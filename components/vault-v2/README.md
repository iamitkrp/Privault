# Vault V2 Components

This directory contains all UI components for the rebuilt Privault vault system.

## Directory Structure

```
components/vault-v2/
├── index.ts                    # Component exports
├── README.md                   # This file
│
├── credentials/                # Credential display and management
│   ├── CredentialList.tsx     # List view of credentials
│   ├── CredentialGrid.tsx     # Grid view of credentials
│   ├── CredentialCard.tsx     # Individual credential card ✅
│   ├── CredentialForm.tsx     # Create/edit form
│   └── CredentialDetails.tsx  # Detailed view
│
├── expiration/                 # Expiration-related components
│   ├── ExpirationBadge.tsx    # Status badge ✅
│   ├── ExpirationModal.tsx    # Set/edit expiration
│   └── ExpirationWarning.tsx  # Warning notifications
│
├── search/                     # Search and filtering
│   ├── SearchBar.tsx          # Search input
│   ├── FilterPanel.tsx        # Advanced filters
│   └── SortControls.tsx       # Sort options
│
├── stats/                      # Analytics and statistics
│   ├── VaultStats.tsx         # Overall stats
│   ├── HealthScore.tsx        # Security health score
│   └── ExpirationChart.tsx    # Expiration timeline
│
├── import-export/              # Import/Export functionality
│   ├── ImportModal.tsx        # Import wizard
│   ├── ExportModal.tsx        # Export dialog
│   └── FormatSelector.tsx     # Format selection
│
├── common/                     # Shared components
│   ├── LoadingState.tsx       # Loading indicators ✅
│   ├── ErrorState.tsx         # Error displays
│   ├── EmptyState.tsx         # Empty state messages
│   └── ConfirmDialog.tsx      # Confirmation dialogs
│
└── layouts/                    # Layout components
    ├── VaultLayout.tsx        # Main vault layout
    └── VaultSidebar.tsx       # Sidebar navigation
```

## Design Principles

### 1. Component Architecture
- **Composition over inheritance** - Build complex UIs from simple components
- **Props interfaces** - Every component has a well-defined props interface
- **TypeScript** - Strict typing for all components
- **Accessibility** - WCAG 2.1 Level AA compliance

### 2. Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Design tokens** - Consistent colors, spacing, typography
- **Dark mode** - Full dark mode support
- **Responsive** - Mobile-first responsive design
- **Glassmorphism** - Modern visual effects where appropriate

### 3. State Management
- **React hooks** - useState, useEffect, useCallback, useMemo
- **Context** - Shared state via React Context
- **Custom hooks** - Reusable logic extraction
- **Optimistic updates** - Immediate UI feedback

### 4. Performance
- **Memoization** - React.memo for expensive components
- **Lazy loading** - Code splitting for large components
- **Virtual scrolling** - For large lists
- **Debouncing** - For search and input handlers

### 5. Testing
- **Unit tests** - Test each component in isolation
- **Integration tests** - Test component interactions
- **Accessibility tests** - Automated a11y checks
- **Snapshot tests** - Catch UI regressions

## Component Patterns

### Example Component Structure

```typescript
/**
 * Component Name
 * 
 * Brief description of what the component does.
 * Key features and functionality.
 */

'use client'; // If using client-side features

import React from 'react';
import { SomeType } from '@/lib/vault-v2/core/types';

interface ComponentNameProps {
  // Props definition
  requiredProp: string;
  optionalProp?: number;
  onAction?: (id: string) => void;
  className?: string;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  requiredProp,
  optionalProp = 0,
  onAction,
  className = '',
}) => {
  // Component logic

  return (
    <div className={`base-classes ${className}`}>
      {/* Component JSX */}
    </div>
  );
};
```

### Accessibility Checklist

- ✅ Semantic HTML elements
- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Color contrast ratios
- ✅ Touch target sizes

### Error Handling

All components should:
- Handle loading states gracefully
- Display error messages clearly
- Provide fallback UI for failures
- Log errors for debugging

### Common Props Pattern

```typescript
interface BaseComponentProps {
  className?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}
```

## Usage Examples

### CredentialCard

```tsx
import { CredentialCard } from '@/components/vault-v2';

<CredentialCard
  credential={decryptedCredential}
  onEdit={(id) => router.push(`/vault-v2/${id}/edit`)}
  onDelete={(id) => handleDelete(id)}
  onToggleFavorite={(id) => handleToggleFavorite(id)}
/>
```

### LoadingState

```tsx
import { LoadingState } from '@/components/vault-v2';

<LoadingState type="spinner" message="Loading credentials..." size="lg" />
<LoadingState type="skeleton" />
<LoadingState type="dots" />
```

### ExpirationBadge

```tsx
import { ExpirationBadge } from '@/components/vault-v2';

<ExpirationBadge status={credential.expiration_status} />
```

## Development Guidelines

### Adding New Components

1. Create component file in appropriate directory
2. Add TypeScript interface for props
3. Implement component with JSX
4. Export from directory index.ts
5. Add to main index.ts exports
6. Write unit tests
7. Update this README

### Styling Guidelines

- Use Tailwind utility classes
- Follow dark mode patterns: `dark:bg-gray-800`
- Maintain consistent spacing
- Use design tokens for colors
- Keep responsive breakpoints consistent

### Testing Components

```bash
# Run component tests
npm test components/vault-v2

# Run with coverage
npm test -- --coverage components/vault-v2

# Run specific component
npm test CredentialCard
```

## Implementation Status

### Completed ✅
- Component index structure
- CredentialCard component
- ExpirationBadge component
- LoadingState component
- README documentation

### In Progress 🚧
- CredentialList
- CredentialGrid
- CredentialForm
- SearchBar
- FilterPanel
- VaultStats

### Planned 📋
- ExpirationModal
- ExpirationWarning
- ImportModal
- ExportModal
- ErrorState
- EmptyState
- ConfirmDialog
- VaultLayout
- VaultSidebar

## Related Documentation

- [Vault Rebuild Plan](../../VAULT_REBUILD_PLAN.md)
- [Type Definitions](../../lib/vault-v2/core/types.ts)
- [Vault Service](../../lib/vault-v2/services/vault.service.ts)
- [Migration Guide](../../MIGRATION_GUIDE.md)

