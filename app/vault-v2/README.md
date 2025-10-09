# Vault V2 - Next.js App Directory

This directory contains all pages and routes for the rebuilt Privault vault system using Next.js 14 App Router.

## Directory Structure

```
app/vault-v2/
├── page.tsx              # Main vault page ✅
├── layout.tsx            # Vault layout ✅
├── loading.tsx           # Loading state ✅
├── error.tsx             # Error boundary ✅
├── README.md             # This file
│
├── [id]/                 # Dynamic routes for credentials
│   ├── page.tsx         # Credential detail view
│   ├── edit/
│   │   └── page.tsx     # Edit credential
│   └── history/
│       └── page.tsx     # Password history
│
├── new/                  # Create new credential
│   └── page.tsx
│
├── import/               # Import credentials
│   └── page.tsx
│
├── export/               # Export credentials
│   └── page.tsx
│
└── settings/             # Vault settings
    └── page.tsx
```

## Page Descriptions

### Main Pages

#### `/vault-v2` - Main Vault Page
- Displays all credentials in list/grid view
- Search and filtering
- Quick actions (copy password, favorite, delete)
- Vault statistics dashboard
- Add new credential button

#### `/vault-v2/new` - Add Credential
- Form to create new credential
- Password generator
- Expiration settings
- Category and tag selection

#### `/vault-v2/[id]` - Credential Details
- Full credential information
- Password reveal with copy
- Access history
- Expiration status
- Edit and delete actions

#### `/vault-v2/[id]/edit` - Edit Credential
- Edit form for existing credential
- Password change with history
- Update expiration settings
- Modify tags and category

#### `/vault-v2/[id]/history` - Password History
- List of password changes
- Change reasons and timestamps
- Restore previous password option

### Import/Export

#### `/vault-v2/import` - Import Credentials
- Upload file (CSV, JSON, etc.)
- Format detection
- Preview import data
- Validation and error handling
- Conflict resolution

#### `/vault-v2/export` - Export Credentials
- Select export format
- Choose credentials to export
- Encryption options
- Download file

### Settings

#### `/vault-v2/settings` - Vault Settings
- Auto-lock timeout
- Default expiration settings
- Export/import preferences
- Security options

## Route Patterns

### Static Routes
- `/vault-v2` - Main vault
- `/vault-v2/new` - Create credential
- `/vault-v2/import` - Import page
- `/vault-v2/export` - Export page
- `/vault-v2/settings` - Settings page

### Dynamic Routes
- `/vault-v2/[id]` - View credential
- `/vault-v2/[id]/edit` - Edit credential
- `/vault-v2/[id]/history` - Password history

## Data Fetching

### Server Components (Default)
- Use for initial page load
- Fetch data server-side
- SEO-friendly
- Better performance

```typescript
// app/vault-v2/page.tsx
export default async function VaultPage() {
  // Server-side data fetching
  const stats = await getVaultStats();
  
  return <VaultDashboard stats={stats} />;
}
```

### Client Components
- Use for interactivity
- State management
- Real-time updates

```typescript
'use client';

export default function CredentialForm() {
  const [data, setData] = useState({});
  
  return <form>...</form>;
}
```

## State Management

### URL State (Search Params)
```typescript
// For filters, search, pagination
const searchParams = useSearchParams();
const category = searchParams.get('category');
```

### React Context
```typescript
// For vault-wide state
<VaultContext.Provider value={{ isLocked, unlock }}>
  {children}
</VaultContext.Provider>
```

### React Hooks
```typescript
// For component state
const [credentials, setCredentials] = useState([]);
const [loading, setLoading] = useState(false);
```

## Loading States

### Streaming with Suspense
```typescript
<Suspense fallback={<LoadingState />}>
  <CredentialList />
</Suspense>
```

### Loading UI Files
- `loading.tsx` - Automatic loading UI
- `error.tsx` - Error boundary UI

## Error Handling

### Error Boundaries
```typescript
// app/vault-v2/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found
```typescript
// app/vault-v2/[id]/not-found.tsx
export default function NotFound() {
  return <h2>Credential not found</h2>;
}
```

## Metadata

### Static Metadata
```typescript
export const metadata: Metadata = {
  title: 'Vault | Privault',
  description: 'Secure password vault',
};
```

### Dynamic Metadata
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const credential = await getCredential(params.id);
  
  return {
    title: `${credential.site} | Vault`,
  };
}
```

## Performance Optimization

### Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components

```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingState />,
});
```

### Caching
- Use React Cache API
- Memoize expensive computations

```typescript
import { cache } from 'react';

const getVaultStats = cache(async (userId: string) => {
  // Expensive operation
});
```

### Parallel Data Fetching
```typescript
const [stats, credentials] = await Promise.all([
  getVaultStats(),
  getCredentials(),
]);
```

## Security Considerations

### Authentication Check
```typescript
// app/vault-v2/layout.tsx
export default async function VaultLayout({ children }) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return <>{children}</>;
}
```

### Data Encryption
- Never send decrypted data to server
- Decrypt only on client-side
- Clear sensitive data from memory

## Implementation Status

### Completed ✅
- Main vault page structure
- Layout with navigation
- Loading states
- Error boundaries
- README documentation

### In Progress 🚧
- Credential detail page
- Edit credential page
- Import/export pages

### Planned 📋
- Password history page
- Settings page
- Advanced filtering
- Bulk operations

## Related Documentation

- [Vault Rebuild Plan](../../VAULT_REBUILD_PLAN.md)
- [Components](../../components/vault-v2/README.md)
- [Services](../../lib/vault-v2/services/vault.service.ts)
- [Migration Guide](../../MIGRATION_GUIDE.md)

