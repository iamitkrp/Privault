# Privault - Zero-Knowledge Password Manager

🔒 **Secure, Private, Zero-Knowledge Password Management**

A modern web application built with Next.js and TypeScript that ensures your passwords are encrypted locally before ever leaving your device. Even we can't see your data.

## ✨ Features

- **🔐 Zero-Knowledge Security**: Your master password never leaves your device
- **🛡️ Military-Grade Encryption**: AES-256-GCM encryption with PBKDF2 key derivation
- **📱 Modern Web App**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **🔄 Import/Export**: Backup and migrate from other password managers
- **📊 Password Health**: Strength analysis and security recommendations
- **🎨 Beautiful UI**: Clean, accessible interface with dark/light themes
- **⚡ Fast & Responsive**: Optimized performance with instant search
- **♿ Accessibility**: Full keyboard navigation and screen reader support
- **🔒 Advanced Security**: Session monitoring, automatic logout, security analytics
- **📱 PWA Support**: Progressive Web App with offline capabilities
- **⚡ Performance Optimized**: Bundle splitting, lazy loading, and caching

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/privault.git
   cd privault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example.txt .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Run the SQL schema files in your Supabase project:
     - `database/schema.sql` - Main application schema
     - `database/security-schema.sql` - Security monitoring schema
   - Enable Row Level Security on all tables

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Zero-Knowledge Principle

```
User Device (Browser)     |     Server (Supabase)
                         |
Master Password          |     ❌ Never sees password
     ↓                   |     ❌ Never sees keys
PBKDF2 Key Derivation   |     ❌ Never sees plaintext
     ↓                   |
AES-256 Encryption      |     ✅ Only stores encrypted data
     ↓                   |     ✅ Cannot decrypt anything
Encrypted Data ------→  |
```

### Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Encryption**: Web Crypto API (AES-256-GCM, PBKDF2, SHA-256)
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: React Context + Hooks
- **Performance**: Bundle optimization, code splitting, PWA

## 📚 Development Status - **COMPLETED** ✅

All development phases have been successfully completed:

- [x] **Phase 1**: Project foundation and setup
- [x] **Phase 2**: Supabase backend configuration  
- [x] **Phase 3**: Authentication system
- [x] **Phase 4**: Cryptographic foundation
- [x] **Phase 5**: Core vault functionality
- [x] **Phase 6**: Enhanced UI/UX and accessibility
- [x] **Phase 7**: Import/export functionality
- [x] **Phase 8**: Advanced security features
- [x] **Phase 9**: Performance optimization and PWA

**🎉 The application is now production-ready!**

## 🔒 Security Features

- **Client-side encryption** - All encryption happens in your browser
- **Zero-knowledge architecture** - We can't see your data even if compromised
- **Secure key derivation** - PBKDF2 with 100,000+ iterations
- **Session security** - Auto-lock after inactivity with configurable timeouts
- **Password auditing** - Strength analysis and security recommendations
- **Secure backup** - Encrypted export/import functionality
- **Security monitoring** - Login tracking and suspicious activity detection
- **Session management** - Multiple device session tracking
- **OTP verification** - Optional 2FA for vault access

## 📖 Documentation

For detailed information about the project:

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete technical documentation
- **[plan.md](./plan.md)** - Development phases and implementation details
- **[Database Setup](./database/setup-instructions.md)** - Database configuration guide
- **[Security Architecture](./DOCUMENTATION.md#cryptographic-implementation)** - Detailed security information

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run analyze      # Analyze bundle size (set ANALYZE=true)
```

### Project Structure

```
privault/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # User dashboard with security overview
│   └── vault/             # Password vault
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── vault/            # Vault-specific components
│   ├── security/         # Security monitoring components
│   └── ui/               # Generic UI components
├── lib/                   # Core libraries
│   ├── auth/             # Authentication logic
│   ├── crypto/           # Encryption utilities
│   └── supabase/         # Database client
├── services/             # Business logic services
│   ├── vault.service.ts  # Vault operations
│   ├── crypto.service.ts # Encryption services
│   ├── auth.service.ts   # Authentication
│   ├── security-monitoring.service.ts # Security tracking
│   └── session-management.service.ts # Session handling
├── types/                # TypeScript type definitions
├── constants/            # App-wide constants
└── database/             # Database schemas and setup
```

## 🚀 Production Deployment

The application is ready for production deployment with:

- **Performance optimizations** enabled
- **Bundle splitting** for efficient loading
- **PWA capabilities** for offline use
- **Security monitoring** built-in
- **Comprehensive error handling**
- **Type safety** throughout

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔐 Security

If you discover a security vulnerability, please send an email to security@privault.app instead of opening a public issue.

## 💬 Support

- **Documentation**: [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/privault/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/privault/discussions)

---

**Built with ❤️ for privacy and security**
