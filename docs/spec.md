# 1Token - Product Specification Document

> **Version**: 0.1.1
> **Date**: 2026-03-05
> **Status**: In Development

---

## 1. Product Overview

### 1.1 Vision
1Token is a secure, local-first API Token management tool designed specifically for developers. It provides end-to-end encryption, intuitive token organization, and seamless developer workflow integration through both a web UI and CLI tool.

### 1.2 Target Users
- Individual developers managing multiple API keys
- DevOps engineers handling CI/CD tokens
- Small teams needing secure credential sharing
- Open source maintainers with package publishing tokens

### 1.3 Core Value Propositions
1. **Security First**: AES-256-GCM encryption with master password protection
2. **Local-First**: SQLite database, no cloud dependency, complete data ownership
3. **Developer Experience**: CLI integration for terminal workflows
4. **Expiration Management**: Proactive alerts before tokens expire

### 1.4 Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.x |
| Database | SQLite + Prisma ORM | 6.15.0 |
| UI Library | Shadcn UI + Tailwind CSS | 4.x |
| Encryption | Node.js crypto (AES-256-GCM) | Built-in |
| Testing | Vitest + Playwright | 1.x |

---

## 2. Feature List & Priorities

### 2.1 P0 - Core Features (Implemented)

| Feature | Status | Description |
|---------|--------|-------------|
| End-to-End Encryption | ✅ Complete | AES-256-GCM with scrypt key derivation |
| Master Password Auth | ✅ Complete | scrypt hashing, in-memory session tokens |
| Token CRUD | ✅ Complete | Create, Read, Update, Delete with soft-delete |
| Tag System | ✅ Complete | Comma-separated tags (Prod, Test, CI/CD) |
| Real-time Search | ✅ Complete | Fuzzy search by platform, purpose, tags |
| Token Decryption | ✅ Complete | On-demand decryption with password prompt |
| Dark Mode | ✅ Complete | System-aware theme toggle |
| CLI Tool | ✅ Complete | `1token get <platform>` with clipboard support |
| Token Expiry UI | ✅ Complete | Visual indicators for expiry status |
| Token Export | ✅ Complete | .env, shell, JSON formats |

### 2.2 P1 - High Priority Features (Partial/Needs Improvement)

| Feature | Status | Notes |
|---------|--------|-------|
| Audit Log Page | 🟡 Skeleton | UI exists but lacks full audit history |
| Token Edit | 🟡 Partial | Can update metadata but not rotate token value |
| Scope Presets | ✅ Complete | Pre-defined scopes for common platforms |
| Email Reminders | 🟡 Configured | Script exists but needs scheduling setup |
| Token View Dialog | ✅ Complete | Modal for viewing decrypted tokens |
| Last Used Tracking | ✅ Schema | Field exists but update logic incomplete |

### 2.3 P2 - Nice to Have Features (Not Started)

| Feature | Priority | Description |
|---------|----------|-------------|
| Token Sharing | P2 | Secure team sharing with encrypted links |
| Import from .env | P2 | One-click import from .env files |
| Bulk Operations | P2 | Select multiple tokens for bulk delete/export |
| Token Usage Analytics | P2 | Charts showing token usage over time |
| Multi-user Support | P2 | User accounts with role-based access |
| Mobile App | P2 | React Native or PWA for mobile access |
| Browser Extension | P2 | Auto-fill tokens in web apps |
| Backup/Restore | P2 | Encrypted backup to cloud storage |
| Token Rotation | P2 | Automated rotation with platform APIs |
| IP Whitelist | P2 | Restrict access by IP address |

---

## 3. Page Design Specifications

### 3.1 Login Page (`/login`)

**Purpose**: Authenticate user with master password

**Components**:
- Centered card layout
- Password input with visibility toggle
- Toggle between "Login" and "Setup" modes
- Error message display

**User Flow**:
1. First-time user → "Set up master password"
2. Returning user → Enter password → Redirect to dashboard

**Security**:
- Password never sent in plain text (hashed client-side concept for v2)
- Session token stored in localStorage

### 3.2 Dashboard (`/dashboard`)

**Purpose**: Main token management interface

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  1Token           [Theme] [Export] [Logout]         │  Header
├─────────────────────────────────────────────────────┤
│  Your Tokens                           [Add Token]  │  Title + CTA
│  Manage your API tokens securely                    │
├─────────────────────────────────────────────────────┤
│  [Search...]  [Status ▼]  [Tag ▼]                  │  Filters
│  Showing X of Y tokens                              │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ Platform     │ │ Platform     │ │ Platform     │ │  Token Cards
│  │ [Status]     │ │ [Status]     │ │ [Status]     │ │  (2-3 cols)
│  │ Purpose...   │ │ Purpose...   │ │ Purpose...   │ │
│  │ Expires: XX  │ │ Expires: XX  │ │ Expires: XX  │ │
│  │ [tag1][tag2] │ │ [tag1][tag2] │ │ [tag1][tag2] │ │
│  │ [View][Edit] │ │ [View][Edit] │ │ [View][Edit] │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Token Card Elements**:
- Platform name (title)
- Status badge (safe/warning/critical/expired/no-expiry)
- Purpose description (2-line clamp)
- Expiry badge with progress bar
- Tags (horizontal scroll if needed)
- Scopes (blue badges)
- Action buttons: View, Edit, Delete

**Filters**:
- Search: Real-time fuzzy search
- Status: All, Valid, <30 days, <7 days, Expired
- Tag: Dynamic based on existing tags

### 3.3 Token Form (Modal/Inline)

**Purpose**: Create or edit tokens

**Fields**:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Platform | Text | Yes | Autocomplete with platform presets |
| Token Value | Password | Yes (create only) | Hidden input, no edit on update |
| Purpose | Text | Yes | Description of token usage |
| Scopes | Text | No | Permission scopes, preset selector available |
| Expiry Date | Date | No | Default suggestions per platform |
| Tags | Text | No | Comma-separated |

**Smart Features**:
- Platform suggestions from scope presets
- Default expiry auto-populated based on platform
- Scope preset selector dropdown

### 3.4 Token View Dialog

**Purpose**: View decrypted token value

**Flow**:
1. Click "View" on token card
2. Modal opens with token metadata
3. Password input shown
4. On decrypt: Token value revealed with Copy button

**Security**:
- Decryption requires master password
- Token value masked until decrypted
- Clipboard copy with visual feedback

### 3.5 Audit Page (`/dashboard/audit`)

**Purpose**: Security audit and cleanup recommendations

**Sections**:
1. **Stats Cards** (4 columns):
   - Total Tokens
   - Unused (30+ days)
   - Reminded
   - Expiring Soon

2. **Cleanup Recommendations**:
   - List tokens unused for 30/90 days
   - Direct delete action

3. **Token Usage History**:
   - Last access time per token
   - Sortable table

### 3.6 Export Dialog

**Purpose**: Export token metadata (not decrypted values)

**Options**:
- Format: .env, Shell, JSON
- Filter by tag

**Security Note**: Export contains only metadata. Actual values must be decrypted with master password.

---

## 4. API Interface Design

### 4.1 Authentication Endpoints

#### POST `/api/auth/verify`
Setup or verify master password.

**Request**:
```json
{
  "password": "string",
  "action": "setup" | "verify"
}
```

**Response**:
```json
{
  "success": true,
  "sessionToken": "string",
  "message": "string"
}
```

### 4.2 Token Endpoints

#### GET `/api/tokens`
List all active tokens (encrypted values excluded).

**Query Parameters**:
- `search` - Fuzzy search term
- `tag` - Filter by tag

**Response**:
```json
{
  "tokens": [
    {
      "id": "string",
      "platform": "string",
      "purpose": "string",
      "scopes": "string?",
      "tags": "string",
      "createdAt": "ISO date",
      "expiresAt": "ISO date?",
      "hasValue": true
    }
  ]
}
```

#### POST `/api/tokens`
Create new token.

**Request**:
```json
{
  "platform": "string",
  "tokenValue": "string",
  "password": "string",
  "purpose": "string",
  "scopes": "string?",
  "expiresAt": "string?",
  "tags": "string?"
}
```

**Response**: Created token metadata

#### GET `/api/tokens/:id`
Get single token with encrypted data (for decryption).

**Response**:
```json
{
  "token": {
    "id": "string",
    "platform": "string",
    "purpose": "string",
    "encryptedVal": "string",
    "iv": "string",
    "authTag": "string",
    // ... metadata
  }
}
```

#### PUT `/api/tokens/:id`
Update token metadata (no value change).

**Request**:
```json
{
  "platform": "string",
  "purpose": "string",
  "scopes": "string?",
  "expiresAt": "string?",
  "tags": "string?"
}
```

#### DELETE `/api/tokens/:id`
Soft delete token (sets `isActive: false`).

#### POST `/api/tokens/:id/decrypt`
Decrypt token value.

**Request**:
```json
{
  "password": "string"
}
```

**Response**:
```json
{
  "decrypted": "string",
  "platform": "string"
}
```

#### GET `/api/tokens/export`
Export token metadata.

**Query Parameters**:
- `format` - `env` | `shell` | `json`
- `tag` - Filter by tag

**Response**: File download (text/plain or application/json)

### 4.3 Error Handling

All endpoints return consistent error format:
```json
{
  "error": "Human-readable error message"
}
```

Status codes:
- 200: Success
- 400: Bad Request (validation error)
- 401: Unauthorized (invalid password)
- 404: Not Found
- 500: Internal Server Error

---

## 5. Database Schema

### 5.1 Token Model

```prisma
model Token {
  id           String   @id @default(cuid())
  platform     String   // Platform name (GitHub, PyPI, AWS, etc.)
  encryptedVal String   // AES-256-GCM encrypted value (Base64)
  iv           String   // Initialization vector (Base64)
  authTag      String   // GCM authentication tag (Base64)
  salt         String   // Key derivation salt (Base64)
  purpose      String   // Description of token usage
  scopes       String?  // Permission scopes (JSON or comma-separated)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  expiresAt    DateTime? // Token expiration date
  lastUsed     DateTime? // Last access time (for audit)
  tags         String   // Tags (comma-separated)
  reminded     Boolean  @default(false) // Expiry reminder sent
  isActive     Boolean  @default(true)  // Soft delete flag
}
```

### 5.2 Schema Notes

**Encryption Fields**:
- `encryptedVal`: The actual encrypted token value
- `iv`: 16-byte initialization vector (unique per encryption)
- `authTag`: 16-byte GCM authentication tag (ensures integrity)
- `salt`: 32-byte salt for key derivation

**Audit Fields**:
- `lastUsed`: Updated when token is decrypted/copied
- `reminded`: Prevents duplicate expiry emails
- `isActive`: Enables soft delete and recovery

**Future Considerations**:
- Add `createdBy` field for multi-user support
- Add `rotationHistory` for token versioning
- Add `accessCount` for usage analytics

---

## 6. Security Architecture

### 6.1 Encryption Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Password   │────▶│   scrypt     │────▶│  256-bit Key │
│  (User input)│     │  (N=2^14)    │     │ (Session only)
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
                                                   ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Ciphertext  │◄────│ AES-256-GCM  │◄────│   Plaintext  │
│  (Storage)   │     │  (Encrypt)   │     │  (User data) │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 6.2 Security Best Practices

1. **Master Password**: Never stored; only scrypt hash kept in memory
2. **Derived Key**: Stored in session only, cleared on logout
3. **Encryption**: All tokens encrypted with unique IV per token
4. **Soft Delete**: Tokens marked inactive rather than hard deleted
5. **No Logging**: Token values never logged
6. **Client-Side Session**: Session token in localStorage (for demo; consider httpOnly cookies for production)

---

## 7. Optimization Suggestions

### 7.1 Code Improvements

1. **Duplicate Encryption Logic** (`src/app/api/tokens/route.ts:62-77`):
   - Lines 62-69 and 70-77 contain identical code blocks
   - **Fix**: Remove duplicate code

2. **Master Password Storage** (`src/lib/password.ts`):
   - Currently stored in memory variables (lost on restart)
   - **Suggestion**: Store hash in database or encrypted local file

3. **Last Used Update**:
   - Schema has `lastUsed` field but API doesn't update it
   - **Suggestion**: Update `lastUsed` on decrypt/copy operations

4. **Input Validation**:
   - Add Zod or Joi validation for all API inputs
   - Sanitize platform names (no special characters)

### 7.2 Performance Optimizations

1. **Pagination**: Add pagination for token list (currently loads all)
2. **Debounced Search**: Add debounce to search input (300ms)
3. **Indexed Fields**: Add database indexes for frequent queries:
   ```prisma
   @@index([platform])
   @@index([tags])
   @@index([expiresAt])
   @@index([isActive])
   ```

### 7.3 UI/UX Improvements

1. **Token Value Masking**: Show `ghp_****xxxx` format instead of `********`
2. **Copy Feedback**: Toast notification on successful copy
3. **Keyboard Shortcuts**:
   - `Cmd/Ctrl + K` - Focus search
   - `Cmd/Ctrl + N` - New token
   - `Esc` - Close modals
4. **Bulk Operations**: Select multiple tokens for bulk delete

---

## 8. New Feature Recommendations

### 8.1 High Value, Low Effort

| Feature | Effort | Value | Description |
|---------|--------|-------|-------------|
| Import from .env | Small | High | Parse .env files, import all tokens at once |
| Token Rotation | Medium | High | Update token value without losing metadata |
| Clipboard History | Small | Medium | Show recently copied tokens |
| Usage Analytics | Medium | Medium | Charts: tokens by platform, expiry timeline |

### 8.2 Medium Term

| Feature | Effort | Value | Description |
|---------|--------|-------|-------------|
| Backup/Restore | Medium | High | Encrypted JSON export/import for backup |
| Team Sharing | Large | High | E2E encrypted sharing between users |
| Browser Extension | Large | High | Auto-fill tokens on known platforms |
| Webhook Notifications | Small | Medium | Webhook call on token expiry |

### 8.3 Long Term Vision

1. **Multi-Device Sync**: Encrypted sync via cloud storage (user-controlled)
2. **Hardware Security Key**: YubiKey integration for master password
3. **Biometric Auth**: Fingerprint/FaceID for mobile app
4. **AI Token Suggestions**: Auto-suggest scopes based on platform patterns

---

## 9. CLI Specification

### 9.1 Current Commands

```bash
# Get token by platform
1token get <platform>    # Decrypts and copies to clipboard

# List all tokens
1token list              # Show all tokens with status
1token ls                # Alias for list

# Help
1token help              # Show usage information
```

### 9.2 Proposed New Commands

```bash
# Token management
1token add               # Interactive token creation
1token edit <id>         # Edit token metadata
1token delete <id>       # Delete token
1token rotate <id>       # Update token value

# Export/Import
1token export --format=env --tag=prod
1token import --file=.env

# Utility
1token search <query>    # Search tokens
1token audit             # Show security audit
1token backup            # Create encrypted backup
```

### 9.3 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_SERVER_URL` | `http://localhost:3000` | 1Token server URL |
| `1TOKEN_MASTER_PASSWORD` | - | Master password (for automation) |

---

## 10. Testing Strategy

### 10.1 Test Coverage Requirements

| Category | Coverage | Status |
|----------|----------|--------|
| Unit Tests | 80%+ | 🟡 Partial |
| Integration Tests | 70%+ | 🟡 Partial |
| E2E Tests | Critical flows | 🟡 Partial |

### 10.2 Critical Test Scenarios

1. **Encryption/Decryption Roundtrip**
   - Encrypt → Decrypt → Verify original value
   - Wrong password fails gracefully

2. **Token Lifecycle**
   - Create → Read → Update → Delete → Verify soft delete

3. **Authentication**
   - Setup → Login → Access protected routes → Logout
   - Invalid password rejection

4. **Expiry Handling**
   - Correct status calculation for all date ranges
   - Reminder email triggered appropriately

---

## 11. Deployment & Operations

### 11.1 Environment Variables

```bash
# Required
DATABASE_URL="file:./dev.db"

# Optional (for email)
RESEND_API_KEY="re_xxxx"
EMAIL_FROM="1Token <noreply@1token.app>"
EMAIL_TO="user@example.com"

# Optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 11.2 Cron Jobs

```bash
# Daily at 2 AM - Expiry reminders
0 2 * * * cd /path/to/1token && npx tsx scripts/expiry-reminder.ts
```

### 11.3 Backup Strategy

1. **Database**: Regular SQLite file backup
2. **Export**: Periodic encrypted JSON export
3. **Version Control**: Database migrations in git

---

## 12. Appendix

### 12.1 Supported Platforms (Scope Presets)

| Platform | Default Expiry | Common Scopes |
|----------|----------------|---------------|
| GitHub | 90 days | repo, user, read:org, workflow |
| GitLab | 90 days | api, read_user, write_repository |
| PyPI | No expiry | pypi-submit, pypi-upload |
| npm | 365 days | publish, read, automation |
| AWS | 90 days | s3:*, ec2:*, lambda:* |
| Google Cloud | 90 days | cloud-platform, userinfo.email |
| Vercel | 365 days | deployments:write, projects:read |
| Slack | 365 days | channels:read, chat:write |
| Discord | No expiry | identify, guilds, bot |
| OpenAI | 90 days | full |

### 12.2 Glossary

| Term | Definition |
|------|------------|
| **AES-256-GCM** | Advanced Encryption Standard with 256-bit key and Galois/Counter Mode |
| **scrypt** | Password-based key derivation function (memory-hard) |
| **IV** | Initialization Vector - unique random value for each encryption |
| **Auth Tag** | Authentication tag ensuring ciphertext integrity |
| **Soft Delete** | Marking records as inactive rather than permanent deletion |
| **E2E Encryption** | End-to-end encryption where only users hold keys |

---

**Document Owner**: Product Team
**Last Updated**: 2026-03-05
**Next Review**: 2026-03-15
