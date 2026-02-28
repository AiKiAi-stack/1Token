<div align="center">

# 1Token

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-0.1.0-orange)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19-blue?logo=prisma)

> A secure, local-first API Token manager for developers.
> 
> 一个安全、本地的 API Token 管理工具，专为开发者打造。

**[English](#-features)** | **[中文](README_zh.md#-功能特性)**

</div>

---

## 🌟 Features

- 🔐 **End-to-End Encryption**: AES-256-GCM encryption, tokens always stored encrypted in database
- 🎯 **Master Password**: bcrypt hashing + salt, password never stored in database
- 📋 **One-Click Copy**: Tokens hidden by default, decrypt on click or copy
- 🏷️ **Tag System**: Support for Prod, Test, CI/CD tags for quick filtering
- 🔍 **Real-time Search**: Fuzzy search by platform, purpose, or tags
- ⏰ **Expiration Alerts**: Automatic email reminders 7 days before token expiration
- 🌙 **Dark Mode**: Full light/dark theme support with auto-detection
- 💾 **Local Storage**: SQLite database, lightweight and easy to backup
- 💻 **CLI Tool**: `1token get <platform>` to quickly retrieve and copy tokens

## 🛠 Tech Stack

| Category | Technology | Description |
|----------|------------|-------------|
| **Frontend/Backend** | Next.js 15 (App Router) | Full-stack framework with Server Actions |
| **UI Components** | Shadcn UI + Tailwind CSS | Modern, minimalist design |
| **Database** | SQLite (via Prisma ORM) | Local-first, lightweight, easy backup |
| **Encryption** | Node.js `crypto` (AES-256-GCM) | End-to-end encryption |
| **Task Scheduling** | node-cron | Local scheduled tasks |
| **Email Service** | Resend API | Clean email sending service |

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/AiKiAi-stack/1Token.git
cd 1Token

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

Open your browser and visit [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run linter
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push database schema
pnpm db:studio        # Open Prisma Studio
pnpm cli:build        # Build CLI tool
pnpm cli:dev          # Run CLI in development mode
```

## 💻 CLI Usage

### Basic Commands

```bash
# Get token for a platform and copy to clipboard
pnpm cli:dev get github
pnpm cli:dev get "AWS"
pnpm cli:dev get pypi

# List all tokens
pnpm cli:dev list
pnpm cli:dev ls

# Show help
pnpm cli:dev help
```

### Build Executable

```bash
# Build CLI
pnpm cli:build

# Use compiled CLI
./cli/dist/index.js get github
```

### Clipboard Support

| Platform | Tool | Installation |
|----------|------|--------------|
| macOS | pbcopy | Built-in |
| Linux | xclip / xsel | `sudo apt install xclip` |
| Windows | clip | Built-in |

## 🔐 Security Architecture

### Encryption Flow

1. **Token Storage**:
   - User enters token plaintext
   - Master Password derives key (PBKDF2 + scrypt)
   - AES-256-GCM encryption, stored as Base64 ciphertext
   - Encryption parameters (iv, authTag, salt) stored with ciphertext

2. **Token Decryption**:
   - User enters Master Password
   - Re-derive key using stored salt
   - Decrypt in memory, never write to disk
   - Clear from clipboard after copy

### Security Best Practices

1. **Master Password Not Stored**: Only bcrypt hash stored, derived key in Session
2. **Frontend Masking**: Tokens show `********` by default, decrypt on click/copy
3. **Server-Side Encryption**: Tokens encrypted before storage, decrypted in memory only
4. **Session Expiry**: Destroy derived key on logout or session expiration
5. **Log Sanitization**: Never log any token plaintext

## 📁 Project Structure

```
1token/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── dashboard/          # Main dashboard
│   ├── login/              # Login page
│   └── layout.tsx          # Root layout
├── cli/                    # CLI command-line tool
│   ├── dist/               # Compiled output
│   ├── index.ts            # CLI entry point
│   └── tsconfig.json       # CLI TypeScript config
├── components/             # React components
│   ├── ui/                 # Shadcn UI components
│   ├── token/              # Token-related components
│   └── layout/             # Layout components
├── lib/                    # Utility functions
│   ├── crypto.ts           # Encryption/Decryption
│   ├── auth.ts             # Authentication logic
│   └── db.ts               # Prisma client
├── prisma/                 # Database
│   ├── schema.prisma       # Schema definition
│   └── dev.db              # SQLite database
├── scripts/                # Scripts
│   └── expiry-reminder.ts  # Expiration reminder task
└── tests/                  # Test files
```

## 🤝 Contributing

Contributions are welcome! Please follow the standard workflow:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup

```bash
git clone https://github.com/AiKiAi-stack/1Token.git
cd 1Token
pnpm install
pnpm db:generate
pnpm db:push
pnpm dev
```

### Code Style

- Use Prettier for code formatting
- Follow ESLint rules
- Write meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by AiKiAi-stack**

[⬆ Back to Top](#1token)

</div>
