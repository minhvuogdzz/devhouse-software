# How to Add an RBAC Permission

This guide outlines the process of adding a new system permission and wiring it through the API and Admin CMS.

---

## Architectural Rules

- **Canonical Catalog:** Permissions are defined once in `@devhouse/shared/permissions.js`.
- **Format:** Resource-action pairs separated by colons (e.g., `services:create`, `blog:publish`, `settings:update`). Wildcards (`*`, `services:*`) are supported in checking logic.
- **Fail-Closed:** Unauthenticated or unauthorized requests must return `401 Unauthorized` or `403 Forbidden` immediately.

---

## Step-by-Step Implementation

### Step 1: Add to `packages/shared/src/permissions.js`

1. Add the permission string to the `PERMISSIONS` array:

   ```javascript
   export const PERMISSIONS = [
     // ...
     'invoices:read',
     'invoices:manage',
   ];
   ```

2. Assign to default system roles in `SEEDED_ROLES`:
   ```javascript
   export const SEEDED_ROLES = {
     // super_admin has '*' automatically
     admin: {
       permissions: PERMISSIONS.filter(p => p !== 'roles:manage'),
     },
     editor: {
       permissions: [
         // ...
         'invoices:read',
       ],
     },
   };
   ```

### Step 2: Enforce in Express API Routes

In `apps/api/src/modules/<resource>/<resource>.admin.routes.js`:
Attach `requirePermission`:

```javascript
import { requirePermission } from '../../core/middleware/require-permission.js';

router.get('/', requirePermission('invoices:read'), controller.list);
router.post('/', requirePermission('invoices:manage'), controller.create);
```

### Step 3: Guard in Admin Frontend

In `apps/admin/src/app/router.jsx`:

```javascript
{
  path: 'invoices',
  element: (
    <RequirePermission permission="invoices:read">
      <InvoiceListPage />
    </RequirePermission>
  ),
}
```

In `apps/admin/src/components/layout/AdminShell.jsx`:
Sidebar links will automatically check `hasPermission(permissions, item.permission)` and hide the item if the active user lacks access.
