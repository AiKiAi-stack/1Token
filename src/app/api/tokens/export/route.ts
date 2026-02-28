import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET export tokens
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'env' // 'env' | 'shell' | 'json'
    const tag = searchParams.get('tag') || ''

    const tokens = await prisma.token.findMany({
      where: {
        isActive: true,
        ...(tag && { tags: { contains: tag } }),
      },
      orderBy: { platform: 'asc' },
    })

    // Note: This API returns token metadata only, not decrypted values
    // For security, actual token values should only be decrypted client-side
    const exportData = tokens.map(token => ({
      id: token.id,
      platform: token.platform,
      purpose: token.purpose,
      scopes: token.scopes,
      tags: token.tags,
      expiresAt: token.expiresAt,
      // encryptedVal is NOT included - must decrypt client-side with password
    }))

    if (format === 'json') {
      return new NextResponse(JSON.stringify({ tokens: exportData }, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="1token-export.json"',
        },
      })
    }

    if (format === 'shell') {
      const content = exportData
        .map(token => `export ${token.platform.toUpperCase()}_TOKEN="DECRYPT_NEEDED"`)
        .join('\n')
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename="1token-export.sh"',
        },
      })
    }

    // Default: .env format
    const content = exportData
      .map(token => `${token.platform.toUpperCase()}_TOKEN="DECRYPT_NEEDED"`)
      .join('\n')
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename=".env"',
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export tokens' },
      { status: 500 }
    )
  }
}
