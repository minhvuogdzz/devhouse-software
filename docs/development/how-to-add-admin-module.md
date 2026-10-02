# How to Add an Admin CMS Module

This guide explains how to add a new management section to `apps/admin`.

---

## Architectural Invariants

- **Semantic Color Tokens:** Never use raw Tailwind palette classes like `bg-white`, `text-gray-900`. Use `bg-surface`, `text-fg`, `border-border`, etc.
- **Bilingual UI:** All UI chrome must use `t('key')` via `useI18n()`. Content fields must support both Vietnamese and English using `LocalizedField`.
- **RBAC Protected:** Wrap routes with `<RequirePermission permission="...">`.
- **Query Factories:** Use TanStack Query (`useQuery`, `useMutation`) and `apiClient`.

---

## Step-by-Step Implementation

### Step 1: Add Translations

In `apps/admin/src/lib/i18n.jsx`:
Add navigation labels and custom resource labels under both `vi` and `en` dictionaries.

### Step 2: Create Feature Pages in `apps/admin/src/features/<module>/`

1. **List Page (`<Module>ListPage.jsx`):**
   - Use `DataTable` component or custom table for paginated, filterable tabular data.
   - Render `StatusBadge` for publishing status.
   - Provide "Create New" button navigating to `/<module>/new`.

2. **Editor Page (`<Module>EditorPage.jsx`):**
   - Use `ResourceForm` or sticky action header.
   - Use `LocalizedField` for bilingual string inputs.
   - Include delete with confirmation for existing items.

### Step 3: Register Route in `apps/admin/src/app/router.jsx`

Import the new pages and configure router entries under the protected layout:

```javascript
{
  path: '<module>',
  element: (
    <RequirePermission permission="<module>:read">
      <<Module>ListPage />
    </RequirePermission>
  ),
},
{
  path: '<module>/:id',
  element: (
    <RequirePermission permission="<module>:read">
      <<Module>EditorPage />
    </RequirePermission>
  ),
},
```

### Step 4: Add Navigation Link to Sidebar

In `apps/admin/src/components/layout/AdminShell.jsx`:
Add an item to the navigation menu array with:

- `path`: `/<module>`
- `label`: `t('nav.<module>')`
- `icon`: Lucide icon
- `permission`: `<module>:read`
