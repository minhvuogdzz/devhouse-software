# How to Add an API Module

This guide details the recipe for adding a new resource module to `apps/api`.

---

## Architecture Rules to Follow

- **Strict Layering:** route → middleware (`authenticate`, `requirePermission`, `validate`) → controller → service → repository → model.
- **Isomorphic contracts:** Zod schemas live in `packages/shared/src/schemas/`, not in `apps/api`.
- **RBAC:** Every admin route must be protected by `authenticate` and `requirePermission`.
- **Response envelope:** Use `sendSuccess`, `sendPaginated`, or throw custom AppErrors from `apps/api/src/core/errors/`.

---

## Step-by-Step Implementation

### Step 1: Define Shared Zod Schema

In `packages/shared/src/schemas/<resource>.js`:

```javascript
import { z } from 'zod';
import { LocalizedStringSchema } from './common.js';

export const MyResourceSchema = z.object({
  name: LocalizedStringSchema,
  description: LocalizedStringSchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  order: z.number().int().default(0),
});
```

Export it in `packages/shared/src/schemas/index.js` and `packages/shared/src/index.js`.

### Step 2: Define RBAC Permissions

In `packages/shared/src/permissions.js`:
Add `<resource>:read`, `<resource>:create`, `<resource>:update`, `<resource>:delete` to `PERMISSIONS`, and assign them to `SEEDED_ROLES.admin` and `SEEDED_ROLES.editor`.

### Step 3: Create Module in `apps/api/src/modules/<resource>/`

1. **Model (`<resource>.model.js`):**

   ```javascript
   import mongoose from 'mongoose';
   import { sluggable, publishable, softDelete, auditable } from '../../core/db/plugins/index.js';

   const schema = new mongoose.Schema(
     {
       name: { vi: { type: String, required: true }, en: { type: String, default: '' } },
       description: { vi: String, en: String },
       order: { type: Number, default: 0 },
     },
     { timestamps: true },
   );

   schema.plugin(sluggable, { sourceField: 'name.vi' });
   schema.plugin(publishable);
   schema.plugin(softDelete);
   schema.plugin(auditable);

   export const MyResourceModel = mongoose.model('MyResource', schema);
   ```

2. **Service (`<resource>.service.js`):**
   Encapsulate business logic, database queries, and audit logging.

3. **Controller (`<resource>.controller.js`):**
   Handle incoming `req.valid.body` or `req.params`, and return data via `sendSuccess(res, data)`.

4. **Routes (`<resource>.admin.routes.js` and `<resource>.public.routes.js`):**
   Attach `requirePermission(...)` and `validate({ body: MyResourceSchema })`.

### Step 4: Register in `apps/api/src/routes.js`

Mount public routes under `/api/v1/<resource>` and admin routes under `/api/v1/admin/<resource>`.

### Step 5: Write Integration Tests

Add test suite in `apps/api/tests/<resource>.test.js` checking public reads, admin CRUD, validation failures, and permission guards.
