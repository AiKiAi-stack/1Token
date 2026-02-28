import { NextRequest, NextResponse } from 'next/server'
import { verifyMasterPassword, setupMasterPassword, isMasterPasswordSet } from '@/lib/password'
import { generateSessionId } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, action } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    if (action === 'setup') {
      // Check if already set up
      const alreadySet = await isMasterPasswordSet()
      if (alreadySet) {
        return NextResponse.json(
          { error: 'Master password already set' },
          { status: 400 }
        )
      }

      const result = await setupMasterPassword(password)
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }

      const sessionToken = generateSessionId()
      
      return NextResponse.json({
        success: true,
        sessionToken,
        message: 'Master password set successfully'
      })
    } else {
      // Verify password
      const result = await verifyMasterPassword(password)

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 401 }
        )
      }

      const sessionToken = generateSessionId()

      return NextResponse.json({
        success: true,
        sessionToken,
        message: 'Authentication successful'
      })
    }
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
