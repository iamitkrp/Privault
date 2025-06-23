# Privault - Zero-Knowledge Password Manager

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Security Principles](#architecture--security-principles)
4. [Development Phases](#development-phases)
5. [Database Design](#database-design)
6. [Authentication System](#authentication-system)
7. [Cryptographic Implementation](#cryptographic-implementation)
8. [File Structure](#file-structure)
9. [Security Features](#security-features)
10. [Getting Started](#getting-started)

---

## 🎯 Project Overview

**Privault** is a modern, zero-knowledge password manager built as a web application. The core principle is that your passwords and sensitive data are encrypted on your device before being sent to our servers, meaning we (the service provider) can never see your actual passwords - even if we wanted to.

### What Makes Privault Special?

- **Zero-Knowledge Architecture**: Your master password never leaves your device
- **Client-Side Encryption**: All encryption happens in your browser using military-grade AES-256
- **Modern Web Technologies**: Built with the latest React/Next.js for a smooth user experience
- **Privacy-First Design**: We can't see your data, and no one else can either

### Target Users
- Individuals who want secure password storage
- Privacy-conscious users who don't trust traditional password managers
- Anyone who wants to understand how zero-knowledge encryption works

---

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 14** with App Router
  - *Why?* Modern React framework with server-side rendering, great performance, and excellent developer experience
  - *Benefits:* Fast loading, SEO-friendly, automatic code splitting

### Programming Language
- **TypeScript**
  - *Why?* Adds type safety to JavaScript, catches errors early, better code documentation
  - *Benefits:* Fewer runtime errors, better IDE support, easier refactoring

### UI & Styling
- **Tailwind CSS**
  - *Why?* Utility-first CSS framework for rapid UI development
  - *Benefits:* Consistent design, small bundle size, responsive design made easy

- **Radix UI**
  - *Why?* Accessible, unstyled UI components
  - *Benefits:* Built-in accessibility, keyboard navigation, screen reader support

### Database & Backend
- **Supabase**
  - *Why?* PostgreSQL database with built-in authentication and real-time features
  - *Benefits:* Row Level Security (RLS), automatic API generation, authentication handling

### Cryptography
- **Web Crypto API** (Browser Native)
  - *Why?* Built into browsers, hardware-accelerated, audited by browser vendors
  - *Algorithms:* AES-256-GCM for encryption, PBKDF2 for key derivation, SHA-256 for hashing

### Additional Libraries
- **zxcvbn** - Password strength estimation
- **bcrypt** - Additional password hashing (if needed)
- **React Hook Form** - Form validation and management

---

## 🏗️ Architecture & Security Principles

### Zero-Knowledge Architecture

```
User's Device (Browser)          |          Server (Supabase)
                                |
1. Master Password              |
2. ↓ PBKDF2 Key Derivation     |
3. Encryption Key Generated    |          ❌ Never sees master password
4. ↓ AES-256 Encryption        |          ❌ Never sees encryption key
5. Encrypted Data →            |          ✅ Stores encrypted blobs only
                                |          ✅ Can't decrypt user data
```

### Security Layers

1. **Transport Security**: HTTPS encryption for all communications
2. **Database Security**: Row Level Security (RLS) ensures users only access their data
3. **Client-Side Encryption**: AES-256-GCM with unique IVs for each encryption
4. **Key Derivation**: PBKDF2 with 100,000 iterations and unique salt per user
5. **Session Management**: 15-minute auto-lock, secure session handling

### Privacy Guarantees

- **Your master password**: Never sent to our servers
- **Your encryption key**: Generated locally, never leaves your device
- **Your passwords**: Encrypted before leaving your browser
- **Our access**: We can only see encrypted blobs, not your actual data

---

## 🚀 Development Phases

### Phase 1: Project Foundation & Setup ✅ COMPLETED

**Goal**: Set up the basic project structure and development environment

**What We Built:**
- Next.js 14 project with TypeScript configuration
- Tailwind CSS and Radix UI integration
- Complete TypeScript type system for the entire application
- Comprehensive constants file with security configurations
- Modular folder structure for scalability

**Key Files Created:**
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - UI styling configuration
- `types/` - Complete type definitions for the application
- `constants/index.ts` - Security settings, error messages, validation rules

**Technical Decisions:**
- Chose Next.js App Router for modern React patterns
- TypeScript for type safety and better developer experience
- Tailwind for rapid, consistent UI development

---

### Phase 2: Supabase Backend Setup ✅ COMPLETED

**Goal**: Set up the database and authentication backend

**What We Built:**
- Supabase project configuration with PostgreSQL database
- Complete database schema with security-first design
- Row Level Security (RLS) policies for data isolation
- Database types generation for TypeScript integration

**Database Tables:**
```sql
profiles         - User metadata and encryption salt
vaults          - Encrypted vault data (single blob approach)
vault_items     - Individual encrypted credentials
password_history - Encrypted password change history
```

**Security Features:**
- **Row Level Security**: Users can only access their own data
- **Unique Salt Storage**: Each user gets a unique salt for key derivation
- **Encrypted Data Only**: Server never stores plaintext passwords
- **Audit Trail**: Password history for security analysis

**Key Files:**
- `database/schema.sql` - Complete database structure
- `lib/supabase/client.ts` - Database connection configuration
- `types/database.ts` - Auto-generated TypeScript types

---

### Phase 3: Authentication System ✅ COMPLETED

**Goal**: Build secure user registration and login system

**What We Built:**
- User registration with email verification
- Secure login flow with form validation
- Authentication state management with React Context
- Route protection for secured pages
- Beautiful, accessible UI forms

**Authentication Flow:**
1. **Registration**: User signs up → Email verification required → Account activated
2. **Login**: Email + password → Session created → Redirect to vault
3. **Session Management**: Auto-logout after inactivity, secure token handling
4. **Route Protection**: Automatic redirects for unauthorized access

**Security Features:**
- Email verification required for account activation
- Password strength validation with visual feedback
- Form validation with user-friendly error messages
- Secure session handling with automatic cleanup
- CSRF protection through Supabase security

**Key Components:**
- `app/(auth)/signup/page.tsx` - Registration form with password strength meter
- `app/(auth)/login/page.tsx` - Login form with validation
- `lib/auth/auth-context.tsx` - Authentication state management
- `services/auth.service.ts` - User profile and session management

---

### Phase 4: Cryptographic Foundation ✅ COMPLETED

**Goal**: Implement zero-knowledge encryption system

**What We Built:**
- Complete cryptographic utility library using Web Crypto API
- Master passphrase management with secure session handling
- High-level crypto service for vault operations
- Comprehensive testing framework for security validation

**Cryptographic Components:**

#### 1. Core Crypto Functions (`lib/crypto/crypto-utils.ts`)
```javascript
// Key derivation using PBKDF2
deriveKey(passphrase, salt, iterations=100000) 
// AES-256-GCM encryption with unique IVs
encrypt(data, key)
// Secure decryption with integrity verification
decrypt(encryptedData, key)
// Cryptographically secure random generation
generateSecureRandom()
```

#### 2. Passphrase Manager (`lib/crypto/passphrase-manager.ts`)
- **In-Memory Storage**: Master passphrase never written to disk
- **Auto-Timeout**: 15-minute session with activity tracking
- **Secure Cleanup**: Memory cleared on timeout or logout
- **Activity Tracking**: Extends session on user interaction

#### 3. Crypto Service (`services/crypto.service.ts`)
- **User Initialization**: Sets up encryption for new users
- **Vault Operations**: Encrypts/decrypts entire vaults
- **Item Management**: Handles individual password encryption
- **Session Management**: Coordinates passphrase and crypto operations

#### 4. Testing Framework (`lib/test-crypto.ts`)
- **Comprehensive Tests**: Validates all cryptographic functions
- **Browser Console Testing**: Easy testing during development
- **Security Validation**: Confirms zero-knowledge principles
- **Performance Testing**: Ensures crypto operations are fast

**Security Specifications:**
- **Algorithm**: AES-256-GCM (Authenticated encryption)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: 32 bytes, unique per user, cryptographically random
- **IV**: 12 bytes, unique per encryption, never reused
- **Key Size**: 256 bits (32 bytes)
- **Session Timeout**: 15 minutes with auto-extension on activity

**Zero-Knowledge Guarantees:**
- Master passphrase never sent to server
- Encryption key derived locally and never transmitted
- All data encrypted before leaving the browser
- Unique initialization vectors prevent pattern analysis
- Server stores only encrypted blobs

---

## 🗄️ Database Design

### Table Structure

#### `profiles` Table
Stores user metadata and cryptographic salt
```sql
- user_id: UUID (References Supabase auth.users)
- email: Email address for user identification
- salt: Base64-encoded cryptographic salt (32 bytes)
- security_settings: JSON object with user preferences
- created_at/updated_at: Automatic timestamps
```

#### `vaults` Table  
Stores encrypted vault data as single blob
```sql
- id: UUID primary key
- user_id: UUID (Foreign key to profiles)
- name: Vault name (plaintext, for organization)
- encrypted_data: Base64-encoded encrypted vault content
- created_at/updated_at: Automatic timestamps
```

#### `vault_items` Table
Alternative storage for individual encrypted items
```sql
- id: UUID primary key
- vault_id: UUID (Foreign key to vaults)
- name: Item name (encrypted)
- encrypted_data: Base64-encoded encrypted item data
- created_at/updated_at: Automatic timestamps
```

#### `password_history` Table
Tracks password changes for security analysis
```sql
- id: UUID primary key
- user_id: UUID (Foreign key to profiles)
- encrypted_old_password: Previous password (encrypted)
- changed_at: Timestamp of password change
```

### Security Policies (Row Level Security)

All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- No cross-user data leakage possible
- Automatic filtering at database level
- Protection against SQL injection and data exposure

---

## 🔐 Authentication System

### Registration Flow
1. **Form Submission**: User enters email, master password, confirms password
2. **Validation**: Client-side validation (password strength, email format)
3. **Account Creation**: Supabase creates user account
4. **Email Verification**: User receives verification email
5. **Account Activation**: User clicks email link, account activated
6. **Profile Creation**: User profile created with unique cryptographic salt
7. **Ready to Use**: User can now log in and access vault

### Login Flow
1. **Credentials Entry**: User enters email and master password
2. **Authentication**: Supabase validates credentials
3. **Session Creation**: Secure session token generated
4. **Profile Loading**: User profile and salt retrieved
5. **Crypto Initialization**: Encryption system prepared
6. **Vault Access**: User redirected to secure vault interface

### Session Management
- **Auto-Logout**: 15-minute timeout with activity extension
- **Secure Storage**: Session tokens stored securely
- **Activity Tracking**: Mouse/keyboard activity extends session
- **Clean Shutdown**: Secure cleanup on logout/timeout

---

## 🔒 Cryptographic Implementation

### Encryption Process
```
1. User enters master password
2. Retrieve user's unique salt from database
3. Derive encryption key: PBKDF2(password, salt, 100000 iterations)
4. For each password to encrypt:
   a. Generate unique 12-byte IV
   b. Encrypt: AES-256-GCM(data, key, IV)
   c. Combine: IV + encrypted_data + auth_tag
   d. Encode: Base64(combined_data)
5. Store encoded data in database
```

### Decryption Process
```
1. Retrieve encrypted data from database
2. Decode: Base64 → raw bytes
3. Split: IV + encrypted_data + auth_tag
4. Decrypt: AES-256-GCM(encrypted_data, key, IV)
5. Verify: Authentication tag validates data integrity
6. Return: Original plaintext data
```

### Key Security Features
- **Unique IVs**: Every encryption uses a new, random IV
- **Authentication**: GCM mode provides built-in tamper detection
- **Salt Storage**: Unique salt per user prevents rainbow table attacks
- **Key Derivation**: PBKDF2 with high iteration count resists brute force
- **Memory Safety**: Sensitive data cleared from memory when not needed

---

## 📁 File Structure

```
Privault/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/page.tsx        # Login form
│   │   ├── signup/page.tsx       # Registration form
│   │   └── verify-email/page.tsx # Email verification page
│   ├── auth/callback/route.ts    # Auth callback handler
│   ├── vault/page.tsx            # Main vault interface
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Landing page
├── components/                   # Reusable UI components
│   ├── auth/                     # Authentication components
│   ├── forms/                    # Form components
│   ├── ui/                       # Base UI components
│   └── vault/                    # Vault-specific components
├── lib/                          # Core libraries
│   ├── auth/auth-context.tsx     # Authentication state management
│   ├── crypto/                   # Cryptography implementation
│   │   ├── crypto-utils.ts       # Core crypto functions
│   │   └── passphrase-manager.ts # Master password management
│   ├── supabase/client.ts        # Database connection
│   ├── test-crypto.ts            # Crypto testing utilities
│   └── utils/                    # General utilities
├── services/                     # Business logic services
│   ├── auth.service.ts           # User management
│   └── crypto.service.ts         # High-level crypto operations
├── hooks/                        # React custom hooks
│   └── use-passphrase-session.ts # Passphrase session hook
├── types/                        # TypeScript type definitions
│   ├── database.ts               # Database types
│   └── index.ts                  # Application types
├── constants/index.ts            # App configuration
├── database/                     # Database schema
│   ├── schema.sql                # Database structure
│   └── setup-instructions.md     # Setup guide
└── README.md                     # Project overview
```

---

## 🛡️ Security Features

### Data Protection
- **Zero-Knowledge**: Server never sees unencrypted data
- **Client-Side Encryption**: All encryption happens in browser
- **Unique Salts**: Each user has unique cryptographic salt
- **Strong Key Derivation**: PBKDF2 with 100,000 iterations
- **Authenticated Encryption**: AES-GCM prevents tampering

### Access Control
- **Row Level Security**: Database-level access control
- **Session Management**: Automatic timeout and cleanup
- **Route Protection**: Unauthorized users redirected
- **Email Verification**: Prevents account takeover

### Privacy Features
- **No Analytics**: No tracking or user behavior monitoring
- **Minimal Data**: Only encrypted data and email stored
- **Local Processing**: Sensitive operations happen locally
- **Secure Transmission**: HTTPS for all communications

### Development Security
- **TypeScript**: Prevents many runtime errors
- **Input Validation**: All user inputs validated
- **Error Handling**: Secure error messages
- **Code Review**: Structured development process

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project
- Basic understanding of React/TypeScript (for development)

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd Privault
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.example.txt .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Set Up Database**
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Run the SQL from `database/schema.sql`

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Test Cryptography** (Optional)
   - Open browser console
   - Run `testCrypto.runAllTests()`

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📊 Current Status (Phase 4 Complete)

### ✅ Completed Features
- Project foundation and development setup
- Database design with security policies
- User authentication with email verification
- Complete cryptographic implementation
- Zero-knowledge encryption system
- Comprehensive testing framework

### 🚧 Next Steps (Phase 5)
- Vault user interface for password management
- Add/edit/delete password entries
- Search and organization features
- Password generator integration
- Import/export functionality

### 🎯 Future Enhancements
- Mobile application
- Browser extension
- Team/family sharing features
- Security audit reports
- Biometric authentication
- Advanced password analysis

---

## 🤝 Contributing

This project follows a phase-by-phase development approach. Each phase is thoroughly tested before moving to the next. Current development philosophy:

- **Security First**: Every feature designed with security in mind
- **Privacy by Design**: Zero-knowledge principles in all components
- **User Experience**: Complex security made simple for users
- **Code Quality**: TypeScript, testing, and documentation

---

## 📝 License

This project is developed as an educational and practical implementation of zero-knowledge password management. See LICENSE file for details.

---

## 📞 Support

For questions about implementation, security concerns, or contribution guidelines, please refer to the project repository or contact the development team.

---

*This documentation covers the current state of Privault through Phase 4. The project continues to evolve with additional phases focusing on user interface, advanced features, and security enhancements.* 