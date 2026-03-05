import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/crypto'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST: Decrypt a token value
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password required' },
        { status: 400 }
      )
    }

    // Get token from database
    const token = await prisma.token.findUnique({
      where: { id }
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    // Attempt to decrypt using provided password
    try {
      const decrypted = await decrypt(
        token.encryptedVal!,
        token.iv!,
        token.authTag!,
        token.salt!,
        password
      )

      // Update lastUsed timestamp
      await prisma.token.update({
        where: { id },
        data: { lastUsed: new Date() }
      })

      return NextResponse.json({
        decrypted,
        platform: token.platform
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Decrypt token error:', error)
    return NextResponse.json(
      { error: 'Failed to decrypt token' },
      { status: 500 }
    )
  }
}
