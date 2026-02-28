import { generateExpiryReminderEmail, generateExpiryReminderText, type ExpiryReminderData } from './email-templates'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send email using Resend API
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email send')
    return { success: false, error: 'Email not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || '1Token <onboarding@resend.dev>',
        to,
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send email')
    }

    const result = await response.json()
    console.log('Email sent successfully:', result.id)
    
    return { success: true }
  } catch (error) {
    console.error('Send email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send token expiry reminder email
 */
export async function sendExpiryReminder(email: string, tokens: ExpiryReminderData[]): Promise<{ success: boolean; error?: string }> {
  if (tokens.length === 0) {
    return { success: false, error: 'No tokens to remind' }
  }

  const criticalCount = tokens.filter(t => t.daysLeft < 7).length
  const subject = `🔑 ${tokens.length} token(s) expiring soon${criticalCount > 0 ? ` (${criticalCount} critical)` : ''}`

  const html = generateExpiryReminderEmail(tokens)
  const text = generateExpiryReminderText(tokens)

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  })
}
