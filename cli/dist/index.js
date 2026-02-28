#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const child_process_1 = require("child_process");
const util_1 = require("util");
const readline = __importStar(require("readline"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// Crypto constants
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const AUTH_TAG_LENGTH = 16;
const ITERATIONS = 100000;
// Get database path
function getDatabasePath() {
    const possiblePaths = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join(__dirname, '..', 'prisma', 'dev.db'),
    ];
    for (const dbPath of possiblePaths) {
        if (fs.existsSync(dbPath)) {
            return dbPath;
        }
    }
    return path.join(process.cwd(), 'prisma', 'dev.db');
}
// Create Prisma client with correct database path
const dbPath = getDatabasePath();
process.env.DATABASE_URL = `file:${dbPath}`;
const prisma = new client_1.PrismaClient();
function askPassword(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
async function deriveKey(password, salt) {
    return new Promise((resolve, reject) => {
        (0, crypto_1.scrypt)(password, salt, KEY_LENGTH, {
            N: ITERATIONS,
            r: 8,
            p: 1,
            maxmem: 128 * 1024 * 1024,
        }, (err, derivedKey) => {
            if (err)
                reject(err);
            else
                resolve(derivedKey);
        });
    });
}
async function decryptToken(encryptedData, iv, authTag, salt, password) {
    const key = await deriveKey(password, Buffer.from(salt, 'base64'));
    const ivBuffer = Buffer.from(iv, 'base64');
    const authTagBuffer = Buffer.from(authTag, 'base64');
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, key, ivBuffer, {
        authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTagBuffer);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
async function copyToClipboard(text) {
    const platform = process.platform;
    try {
        if (platform === 'darwin') {
            await execAsync(`echo "${text.replace(/"/g, '\\"')}" | pbcopy`);
        }
        else if (platform === 'linux') {
            try {
                await execAsync(`echo "${text.replace(/"/g, '\\"')}" | xclip -selection clipboard`);
            }
            catch {
                await execAsync(`echo "${text.replace(/"/g, '\\"')}" | xsel --clipboard --input`);
            }
        }
        else if (platform === 'win32') {
            await execAsync(`echo ${text.replace(/"/g, '\\"')} | clip`);
        }
        else {
            console.log('⚠️  Unsupported platform for clipboard copy');
            return;
        }
        console.log('✅ Token copied to clipboard');
    }
    catch (error) {
        console.log('⚠️  Failed to copy to clipboard. Install xclip (Linux) or use pbcopy (macOS)');
        console.log('   Token value:', text);
    }
}
async function getToken(platformQuery) {
    try {
        // Find tokens - use simple contains search (SQLite is case-insensitive by default)
        const allTokens = await prisma.token.findMany({
            where: {
                isActive: true,
            },
        });
        // Filter manually for case-insensitive search
        const tokens = allTokens.filter(t => t.platform.toLowerCase().includes(platformQuery.toLowerCase()));
        if (tokens.length === 0) {
            console.log(`❌ No token found for platform: ${platformQuery}`);
            process.exit(1);
        }
        let selectedToken;
        if (tokens.length === 1) {
            selectedToken = tokens[0];
        }
        else {
            console.log(`\nFound ${tokens.length} tokens matching "${platformQuery}":`);
            tokens.forEach((token, index) => {
                console.log(`  ${index + 1}. ${token.platform} - ${token.purpose}`);
            });
            const choice = await askPassword('\nSelect a token (number): ');
            const index = parseInt(choice) - 1;
            if (isNaN(index) || index < 0 || index >= tokens.length) {
                console.log('❌ Invalid selection');
                process.exit(1);
            }
            selectedToken = tokens[index];
        }
        // Get master password
        const password = await askPassword('Enter master password: ');
        // Decrypt token
        const decryptedToken = await decryptToken(selectedToken.encryptedVal, selectedToken.iv, selectedToken.authTag, selectedToken.salt, password);
        // Update last used
        await prisma.token.update({
            where: { id: selectedToken.id },
            data: { lastUsed: new Date() },
        });
        // Copy to clipboard
        await copyToClipboard(decryptedToken);
        console.log(`\n📋 Token for ${selectedToken.platform}`);
        console.log(`   Purpose: ${selectedToken.purpose}`);
        console.log(`   Value: ${decryptedToken.substring(0, 10)}...`);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('decrypt')) {
            console.log('❌ Invalid master password or corrupted token');
        }
        else {
            console.log('❌ Error:', error);
        }
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
async function listTokens() {
    try {
        const tokens = await prisma.token.findMany({
            where: { isActive: true },
            orderBy: { platform: 'asc' },
        });
        if (tokens.length === 0) {
            console.log('No tokens found.');
            return;
        }
        console.log(`\n📦 ${tokens.length} token(s) in vault:\n`);
        tokens.forEach((token) => {
            const status = token.expiresAt && new Date(token.expiresAt) < new Date()
                ? '🔴 EXPIRED'
                : token.expiresAt && new Date(token.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    ? '🟡 EXPIRING SOON'
                    : '🟢 ACTIVE';
            console.log(`  ${status} ${token.platform}`);
            console.log(`     Purpose: ${token.purpose}`);
            if (token.tags) {
                console.log(`     Tags: ${token.tags}`);
            }
            if (token.expiresAt) {
                console.log(`     Expires: ${token.expiresAt.toISOString().split('T')[0]}`);
            }
            console.log('');
        });
    }
    catch (error) {
        console.log('❌ Error:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
function showHelp() {
    console.log(`
1Token CLI - API Token Manager

Usage:
  1token <command> [options]

Commands:
  get <platform>     Get token for a platform and copy to clipboard
  list, ls          List all tokens
  help              Show this help message

Examples:
  1token get github
  1token get "AWS"
  1token list
`);
}
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    if (!command || command === 'help' || command === '--help' || command === '-h') {
        showHelp();
        process.exit(0);
    }
    switch (command) {
        case 'get':
            if (!args[1]) {
                console.log('❌ Please specify a platform: 1token get <platform>');
                process.exit(1);
            }
            await getToken(args[1]);
            break;
        case 'list':
        case 'ls':
            await listTokens();
            break;
        default:
            console.log(`❌ Unknown command: ${command}`);
            showHelp();
            process.exit(1);
    }
}
main();
