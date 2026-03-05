import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET all tokens
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const tag = searchParams.get('tag') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { platform: { contains: search } },
          { purpose: { contains: search } },
          { tags: { contains: search } },
        ],
      }),
      ...(tag && { tags: { contains: tag } }),
    }

    const [tokens, total] = await Promise.all([
      prisma.token.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.token.count({ where }),
    ])

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
    const { platform, tokenValue, password, encryptedVal, iv, authTag, salt, purpose, scopes, expiresAt, tags } = body

    // Validate required fields
    if (!platform || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let finalEncryptedVal = encryptedVal
    let finalIv = iv
    let finalAuthTag = authTag
    let finalSalt = salt

    // If tokenValue and password are provided, encrypt on server
    if (tokenValue && password) {
      const { encrypt } = await import('@/lib/crypto')
      const { encryptedData, iv, authTag, salt } = await encrypt(tokenValue, password)
      finalEncryptedVal = encryptedData
      finalIv = iv
      finalAuthTag = authTag
      finalSalt = salt
    }

    if (!finalEncryptedVal || !finalIv || !finalAuthTag || !finalSalt) {
      return NextResponse.json(
        { error: 'Missing encryption data' },
        { status: 400 }
      )
    }

    const token = await prisma.token.create({
      data: {
        platform,
        encryptedVal: finalEncryptedVal,
        iv: finalIv,
        authTag: finalAuthTag,
        salt: finalSalt,
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

