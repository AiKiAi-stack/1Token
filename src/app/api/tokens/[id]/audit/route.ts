import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Log token access (called when token is viewed/decrypted)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    await prisma.token.update({
      where: { id },
      data: {
        lastUsed: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Audit log error:', error)
    return NextResponse.json(
      { error: 'Failed to log access' },
      { status: 500 }
    )
  }
}
