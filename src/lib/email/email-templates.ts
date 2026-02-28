// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || '1Token <noreply@1token.app>',
  to: process.env.EMAIL_TO || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
}

export interface ExpiryReminderData {
  platform: string
  purpose: string
  expiresAt: string
  daysLeft: number
  scopes?: string | null
}

/**
 * Generate HTML email for token expiry reminders
 */
export function generateExpiryReminderEmail(tokens: ExpiryReminderData[]): string {
  const criticalTokens = tokens.filter(t => t.daysLeft < 7)
  const warningTokens = tokens.filter(t => t.daysLeft >= 7 && t.daysLeft < 30)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; }
    .token-card { background: white; border-radius: 8px; padding: 15px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .token-card.critical { border-left: 4px solid #dc2626; }
    .token-card.warning { border-left: 4px solid #f59e0b; }
    .token-platform { font-weight: 600; font-size: 16px; }
    .token-purpose { color: #666; font-size: 14px; margin: 5px 0; }
    .token-meta { display: flex; gap: 15px; margin-top: 10px; font-size: 13px; color: #888; }
    .expiry-badge { padding: 2px 8px; border-radius: 4px; font-weight: 500; }
    .expiry-badge.critical { background: #fef2f2; color: #dc2626; }
    .expiry-badge.warning { background: #fffbeb; color: #d97706; }
    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔑 1Token Expiry Reminder</h1>
    <p style="margin: 10px 0 0; opacity: 0.9;">You have ${tokens.length} token(s) expiring soon</p>
  </div>
  
  <div class="content">
    ${criticalTokens.length > 0 ? `
    <div class="section">
      <div class="section-title" style="color: #dc2626;">🚨 Critical (Expiring within 7 days)</div>
      ${criticalTokens.map(token => `
        <div class="token-card critical">
          <div class="token-platform">${token.platform}</div>
          <div class="token-purpose">${token.purpose}</div>
          <div class="token-meta">
            <span>Expires: ${new Date(token.expiresAt).toLocaleDateString()}</span>
            <span class="expiry-badge critical">${token.daysLeft} days left</span>
          </div>
          ${token.scopes ? `<div class="token-meta">Scopes: ${token.scopes}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${warningTokens.length > 0 ? `
    <div class="section">
      <div class="section-title" style="color: #d97706;">⚠️ Warning (Expiring within 30 days)</div>
      ${warningTokens.map(token => `
        <div class="token-card warning">
          <div class="token-platform">${token.platform}</div>
          <div class="token-purpose">${token.purpose}</div>
          <div class="token-meta">
            <span>Expires: ${new Date(token.expiresAt).toLocaleDateString()}</span>
            <span class="expiry-badge warning">${token.daysLeft} days left</span>
          </div>
          ${token.scopes ? `<div class="token-meta">Scopes: ${token.scopes}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="btn">
        Manage Your Tokens
      </a>
    </div>
  </div>
  
  <div class="footer">
    <p>This is an automated reminder from 1Token.</p>
    <p>© ${new Date().getFullYear()} 1Token. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version for email clients that don't support HTML
 */
export function generateExpiryReminderText(tokens: ExpiryReminderData[]): string {
  const lines = [
    '🔑 1Token Expiry Reminder',
    '',
    `You have ${tokens.length} token(s) expiring soon:`,
    '',
  ]

  tokens.forEach(token => {
    const urgency = token.daysLeft < 7 ? '🚨' : '⚠️'
    lines.push(`${urgency} ${token.platform} - ${token.purpose}`)
    lines.push(`   Expires: ${new Date(token.expiresAt).toLocaleDateString()} (${token.daysLeft} days left)`)
    if (token.scopes) lines.push(`   Scopes: ${token.scopes}`)
    lines.push('')
  })

  lines.push(`Manage your tokens: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`)

  return lines.join('\n')
}
