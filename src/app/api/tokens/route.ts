import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET all tokens
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const tag = searchParams.get('tag') || ''

    const tokens = await prisma.token.findMany({
      where: {
        isActive: true,
        OR: search
          ? [
              { platform: { contains: search } },
              { purpose: { contains: search } },
              { tags: { contains: search } },
            ]
          : undefined,
        ...(tag && { tags: { contains: tag } }),
      },
      orderBy: { createdAt: 'desc' },
    })

    // Don't return encrypted values in list view
    const sanitizedTokens = tokens.map(({ encryptedVal, iv, authTag, ...token }) => ({
      ...token,
      hasValue: true,
    }))

    return NextResponse.json({ tokens: sanitizedTokens })
  } catch (error) {
    console.error('Get tokens error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}

// POST create new token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, encryptedVal, iv, authTag, purpose, scopes, expiresAt, tags } = body

    if (!platform || !encryptedVal || !iv || !authTag || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const token = await prisma.token.create({
      data: {
        platform,
        encryptedVal,
        iv,
        authTag,
        purpose,
        scopes: scopes || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        tags: tags || '',
      },
    })

    return NextResponse.json({ 
      token: {
        id: token.id,
        platform: token.platform,
        purpose: token.purpose,
        scopes: token.scopes,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
        tags: token.tags,
      }
    })
  } catch (error) {
    console.error('Create token error:', error)
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    )
  }
}
