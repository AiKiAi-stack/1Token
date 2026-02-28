/**
 * Cron job to scan for expiring tokens and send reminder emails
 * 
 * Usage: 
 *   npx tsx scripts/expiry-reminder.ts
 * 
 * Schedule with node-cron or system cron:
 *   0 2 * * *  # Daily at 2 AM
 */

import { PrismaClient } from '@prisma/client'
import { sendExpiryReminder } from '@/lib/email/email-service'
import { getExpiryStatus } from '@/lib/expiry'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting token expiry reminder scan...')
  
  // Find tokens expiring within 30 days
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const expiringTokens = await prisma.token.findMany({
    where: {
      isActive: true,
      expiresAt: {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      },
      reminded: false, // Only send reminder once
    },
    orderBy: {
      expiresAt: 'asc',
    },
  })

  console.log(`Found ${expiringTokens.length} expiring tokens`)

  if (expiringTokens.length === 0) {
    console.log('No tokens need reminders')
    return
  }

  // Group tokens by user email (in this demo, we use a single email)
  const recipientEmail = process.env.EMAIL_TO

  if (!recipientEmail) {
    console.warn('EMAIL_TO not configured, skipping email notifications')
    // Still mark tokens as reminded
    await prisma.token.updateMany({
      where: {
        id: { in: expiringTokens.map(t => t.id) },
      },
      data: { reminded: true },
    })
    return
  }

  // Prepare reminder data
  const reminderData = expiringTokens.map(token => {
    const expiryInfo = getExpiryStatus(token.expiresAt)
    return {
      platform: token.platform,
      purpose: token.purpose,
      expiresAt: token.expiresAt!.toISOString(),
      daysLeft: expiryInfo.daysLeft || 0,
      scopes: token.scopes,
    }
  })

  // Send reminder email
  const result = await sendExpiryReminder(recipientEmail, reminderData)

  if (result.success) {
    console.log(`Reminder email sent to ${recipientEmail}`)

    // Mark tokens as reminded
    await prisma.token.updateMany({
      where: {
        id: { in: expiringTokens.map(t => t.id) },
      },
      data: { reminded: true },
    })
  } else {
    console.error('Failed to send reminder:', result.error)
  }

  console.log('Expiry reminder scan completed')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
