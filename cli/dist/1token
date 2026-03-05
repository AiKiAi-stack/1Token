#!/usr/bin/env node

// Simple and direct CLI for 1Token
const readline = require('readline')
const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

async function copyToClipboard(text) {
  const platform = process.platform
  
  try {
    if (platform === 'darwin') {
      // macOS
      await execAsync(`echo "${text.replace(/"/g, '\\"')}" | pbcopy`)
    } else if (platform === 'linux') {
      // Linux
      try {
        await execAsync(`echo "${text.replace(/"/g, '\\"')}" | xclip -selection clipboard`)
      } catch {
        await execAsync(`echo "${text.replace(/"/g, '\\"')}" | xsel --clipboard --input`)
      }
    } else if (platform === 'win32') {
      // Windows
      await execAsync(`echo ${text.replace(/"/g, '\\"')} | clip`)
    } else {
      console.log('⚠️  Clipboard not supported - showing value:')
      console.log(text.substring(0, 60) + '...')
      return
    }
    console.log('✅ Token copied!')
  } catch (error) {
    console.log('⚠️  Clipboard failed. Value: ' + text.substring(0, 60) + '...')
  }
}

// Get user input asynchronously
function askForInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close()
      resolve(answer?.trim() || '')
    })
  })
}

// Get token by platform
async function getToken(platformQuery) {
  try {
    // Default server, configurable via env
    const serverUrl = process.env.API_SERVER_URL || 'http://localhost:3000'
    
    const response = await fetch(`${serverUrl}/api/tokens`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Fetch error:', response.status, errorText)
      process.exit(1)
    }
    
    const data = await response.json()
    const allTokens = data.tokens || []
    
    // Filter by platform (case-insensitive match)
    const tokens = allTokens.filter(t => 
      t.platform.toLowerCase().includes(platformQuery.toLowerCase())
    )

    if (tokens.length === 0) {
      console.log(`❌ No token for: ${platformQuery}`)
      process.exit(1)
    }

    let selectedToken

    if (tokens.length === 1) {
      selectedToken = tokens[0]
      console.log(`🔍 Found: ${selectedToken.platform}`)
    } else {
      console.log(`\nFound ${tokens.length} tokens for "${platformQuery}":`)
      tokens.forEach((token, index) => {
        console.log(`  ${index + 1}. ${token.platform} - ${token.purpose}`)
      })
      const choice = await askForInput('\nSelect (number): ')
      const index = parseInt(choice) - 1
      if (isNaN(index) || index < 0 || index >= tokens.length) {
        console.log('❌ Invalid selection')
        process.exit(1)
      }
      selectedToken = tokens[index]
    }

    // Get password from user
    const password = await askForInput('Enter master password: ')

    // Get decrypted token from API
    const decryptResponse = await fetch(`${serverUrl}/api/tokens/${selectedToken.id}/decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    
    if (!decryptResponse.ok) {
      const error = await decryptResponse.json()
      console.log(`❌ ${error.error || 'Decrypt failed'}`)
      process.exit(1)
    }
    
    const result = await decryptResponse.json()
    const decryptedValue = result.decrypted

    // Update last-used time (fire-and-forget)
    fetch(`${serverUrl}/api/tokens/${selectedToken.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: selectedToken.platform,
        purpose: selectedToken.purpose,
        scopes: selectedToken.scopes,
        expiresAt: selectedToken.expiresAt,
        tags: selectedToken.tags,
      })
    }).catch(() => {})

    // Copy to clipboard
    await copyToClipboard(decryptedValue)

    console.log(`\n📋 Token for ${selectedToken.platform}`)
    console.log(`   Purpose: ${selectedToken.purpose}`)
    console.log(`   Value: ${decryptedValue.substring(0, 30)}...`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// List all tokens
async function listTokens() {
  try {
    const serverUrl = process.env.API_SERVER_URL || 'http://localhost:3000'
    
    const response = await fetch(`${serverUrl}/api/tokens`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Fetch error:', errorText)
      process.exit(1)
    }
    
    const data = await response.json()
    const tokens = data.tokens || []

    if (tokens.length === 0) {
      console.log('No tokens found')
      return
    }

    console.log(`\n📦 ${tokens.length} tokens:\n`)

    tokens.forEach((token, index) => {
      let status = '🔵' // Default
      let statusText = 'NO EXPIRY'
      
      if (token.expiresAt) {
        const expiryDate = new Date(token.expiresAt)
        if (expiryDate < new Date()) {
          status = '🔴' // Expired
          statusText = 'EXPIRED'
        } else {
          status = '🟢' // Active
          statusText = 'ACTIVE'
        }
      }
        
      console.log(`${status} ${index + 1}. ${token.platform}`)
      console.log(`     🎯 ${token.purpose}`)
      console.log(`     🏷️  ${token.tags.split(',').map(tag => tag.trim()).join(', ')}`)
      if (token.expiresAt) {
        console.log(`     📅 Status: ${statusText} (${new Date(token.expiresAt).toLocaleDateString()})`)
      }
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
1Token CLI - Token Manager

Usage:
  1token <command> [options]

Commands:
  get <platform>     Get token by platform and copy to clipboard
  list, ls          List all tokens  
  help              Show this help

Examples:
  1token get github
  1token get "AWS Access Key"  
  1token list

Environment vars:
  API_SERVER_URL     Override server (default: http://localhost:3000)
`)
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]?.toLowerCase()

  // Polyfill fetch if needed
  if (typeof global.fetch === 'undefined') {
    try {
      global.fetch = require('node-fetch')
    } catch {
      console.error('❌ node-fetch required. Install with: npm install -g node-fetch@2')
      process.exit(1)
    }
  }

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp()
    return
  }

  switch (command) {
    case 'get':
      if (!args[1]) {
        console.log('❌ Specify: 1token get <platform>')
        process.exit(1)
      }
      await getToken(args[1])
      break

    case 'list':
    case 'ls':
      await listTokens()
      break

    default:
      console.log(`❌ Unknown: ${command}`)
      showHelp()
      process.exit(1)
  }
}

// Only run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}