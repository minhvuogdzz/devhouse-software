# How to Add a Content Section

This guide explains how to define, store, and render a new customizable homepage or static page section.

---

## Architectural Principles

- **Schema & Defaults in `@devhouse/content`:** Section definitions live in code with full bilingual default values.
- **Graceful Rendering Without Images (P3):** Every section must render beautifully relying on typography, color, and spacing even if image fields are empty.
- **Commercial Language (P5):** Headlines and text describe customer benefits and outcomes, not technical jargon. No monospace fonts or code-style motifs.

---

## Step-by-Step Implementation

### Step 1: Define Section in `@devhouse/content`

In `packages/content/src/define.js`:
Use `defineSection` with typed fields (`string`, `text`, `repeater`, etc.):

```javascript
export const statsSection = defineSection({
  key: 'stats',
  name: { vi: 'Số liệu ấn tượng', en: 'Key Metrics' },
  fields: {
    title: { type: 'string', required: true },
    subtitle: { type: 'string' },
    items: {
      type: 'repeater',
      fields: {
        value: { type: 'string', required: true },
        label: { type: 'string', required: true },
      },
    },
  },
});
```

Attach the default content in `packages/content/src/pages/<page>.js`:

```javascript
stats: {
  title: { vi: 'Năng lực đã được bảo chứng', en: 'Proven Delivery Capability' },
  subtitle: { vi: 'Đồng hành cùng sự tăng trưởng số của đối tác', en: 'Empowering digital growth across industries' },
  items: [
    { value: { vi: '99.9%', en: '99.9%' }, label: { vi: 'Độ khả dụng hệ thống', en: 'System Availability' } },
  ],
}
```

### Step 2: Implement UI Component in `apps/web`

In `apps/web/app/components/sections/<SectionName>.jsx`:

```jsx
export function StatsSection({ content, locale = 'vi' }) {
  if (!content) return null;
  const title = content.title?.[locale] || content.title?.vi;
  const items = content.items || [];

  return (
    <section className="py-16 md:py-24 bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-fg text-center">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
          {items.map((it, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl font-extrabold text-primary font-display">
                {it.value?.[locale] || it.value?.vi}
              </div>
              <p className="text-sm text-fg-muted mt-1">{it.label?.[locale] || it.label?.vi}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Step 3: Support in Admin Page Editor

In `apps/admin/src/features/pages/PageEditorPage.jsx`:
Add a tab and field inputs corresponding to the section definition so editors can modify or override its text and reset to code defaults at any time.
