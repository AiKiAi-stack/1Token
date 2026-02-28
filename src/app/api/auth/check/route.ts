import { NextResponse } from 'next/server'
import { isMasterPasswordSet } from '@/lib/password'

export async function GET() {
  try {
    const isSet = await isMasterPasswordSet()
    return NextResponse.json({ isPasswordSet: isSet })
  } catch (error) {
    console.error('Check auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
