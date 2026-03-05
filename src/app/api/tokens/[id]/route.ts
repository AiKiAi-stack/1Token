import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/crypto'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET single token by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const token = await prisma.token.findUnique({
      where: { id, isActive: true },
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    // Return full token including encrypted value (for decryption)
    return NextResponse.json({ 
      token: {
        id: token.id,
        platform: token.platform,
        purpose: token.purpose,
        scopes: token.scopes,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
        tags: token.tags,
        encryptedVal: token.encryptedVal,
        iv: token.iv,
        authTag: token.authTag,
      }
    })
  } catch (error) {
    console.error('Get token error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token' },
      { status: 500 }
    )
  }
}

// PUT update token
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { platform, purpose, scopes, expiresAt, tags } = body

    const token = await prisma.token.update({
      where: { id, isActive: true },
      data: {
        platform,
        purpose,
        scopes,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        tags,
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
    console.error('Update token error:', error)
    return NextResponse.json(
      { error: 'Failed to update token' },
      { status: 500 }
    )
  }
}

// DELETE token (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    await prisma.token.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete token error:', error)
    return NextResponse.json(
      { error: 'Failed to delete token' },
      { status: 500 }
    )
  }
}

// POST decrypt token
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
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
      where: { id, isActive: true }
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    if (!token.encryptedVal || !token.iv || !token.authTag || !token.salt) {
      return NextResponse.json(
        { error: 'Token data incomplete' },
        { status: 400 }
      )
    }

    // Attempt to decrypt using provided password
    try {
      const decrypted = await decrypt(
        token.encryptedVal,
        token.iv,
        token.authTag,
        token.salt,
        password
      )

      // Update lastUsed timestamp
      await prisma.token.update({
        where: { id },
        data: { lastUsed: new Date() },
      })

      return NextResponse.json({
        decrypted,
        platform: token.platform
      })
    } catch (error) {
      console.error('Decryption error:', error)
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