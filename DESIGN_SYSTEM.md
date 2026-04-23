# CodlyLabs Design System

Reference guide for the unified visual language of the PoC Studio frontend.

## Design Tokens

All tokens are defined in three synchronized locations:

| Source | File | Purpose |
|--------|------|---------|
| Tailwind | `tailwind.config.js` | Utility classes (`bg-brand-600`, `text-neutral-900`) |
| CSS Variables | `src/index.css` | Inline styles, third-party libs (`var(--color-brand-600)`) |
| MUI Theme | `src/theme.ts` | MUI components, sx prop (`theme.palette.primary.main`) |

**Rule:** When adding a new color, spacing, or shadow value, add it to all three files.

---

## Colors

### Brand (Primary)

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| brand-50 | `#eef2ff` | `bg-brand-50` | Light tinted backgrounds |
| brand-100 | `#e0e7ff` | `bg-brand-100` | Hover tint, selected row |
| brand-200 | `#c7d2fe` | `ring-brand-200` | Focus rings |
| brand-500 | `#6366f1` | `text-brand-500` | Accent text, icons |
| brand-600 | `#4f46e5` | `bg-brand-600` | Primary CTA buttons |
| brand-700 | `#4338ca` | `hover:bg-brand-700` | Button hover |

### Neutral (Gray)

Replaces the old mixed usage of `gray-*` and `slate-*`.

| Token | Hex | Usage |
|-------|-----|-------|
| neutral-50 | `#f9fafb` | Page backgrounds |
| neutral-100 | `#f3f4f6` | Card alt backgrounds, light borders |
| neutral-200 | `#e5e7eb` | Borders, dividers |
| neutral-400 | `#9ca3af` | Placeholder text, disabled |
| neutral-500 | `#6b7280` | Tertiary text, captions |
| neutral-600 | `#4b5563` | Secondary text |
| neutral-700 | `#374151` | Body text |
| neutral-900 | `#111827` | Primary text, headings |
| neutral-950 | `#0f172a` | Darkest (root text color) |

### Semantic

| Purpose | Token | Background | Text/Icon | Border |
|---------|-------|-----------|-----------|--------|
| Success | `success` | `bg-success-50` | `text-success-600` | `border-success-200` |
| Error | `danger` | `bg-danger-50` | `text-danger-600` | `border-danger-200` |
| Warning | `warning` | `bg-warning-50` | `text-warning-600` | `border-warning-200` |
| Info | `info` | `bg-info-50` | `text-info-600` | `border-info-200` |

### Editor Theme

For code preview / IDE-style components only.

| Token | Hex | Tailwind |
|-------|-----|----------|
| editor-bg | `#193549` | `bg-editor-bg` |
| editor-bg-dark | `#15232d` | `bg-editor-bg-dark` |
| editor-border | `#0d161d` | `border-editor-border` |
| editor-text | `#e0e0e0` | `text-editor-text` |
| editor-keyword | `#ff9d00` | `text-editor-keyword` |
| editor-string | `#3ad900` | `text-editor-string` |
| editor-function | `#ffc600` | `text-editor-function` |

---

## Typography

| Name | Size | Weight | Tailwind |
|------|------|--------|----------|
| Display | 2.25rem / 36px | 700 | `text-display` |
| Headline | 1.5rem / 24px | 600 | `text-headline` |
| Title | 1.25rem / 20px | 600 | `text-title` |
| Body | 1rem / 16px | 400 | `text-body` |
| Body Small | 0.875rem / 14px | 400 | `text-body-sm` |
| Caption | 0.75rem / 12px | 400 | `text-caption` |
| Overline | 0.625rem / 10px | 600 | `text-overline` |

Font stack: `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

---

## Shadows (Elevation)

| Level | Token | Usage |
|-------|-------|-------|
| 0 | `shadow-xs` | Subtle depth (buttons) |
| 1 | `shadow-sm` | Cards at rest |
| 2 | `shadow-md` | Dropdowns |
| 3 | `shadow-lg` | Modals |
| 4 | `shadow-xl` | Popovers |
| Custom | `shadow-elevated` | Hero sections |
| Custom | `shadow-card` | Floating cards |
| Custom | `shadow-dropdown` | Menu panels |

---

## Border Radius

| Token | Size | Usage |
|-------|------|-------|
| `rounded-xs` | 4px | Tags, small badges |
| `rounded-sm` | 6px | Inputs, small cards |
| `rounded-md` | 8px | Cards, dropdowns (default) |
| `rounded-lg` | 12px | Modals, large cards |
| `rounded-xl` | 16px | Hero cards |
| `rounded-2xl` | 24px | Pill buttons |
| `rounded-3xl` | 32px | Large pills |

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-dropdown` | 50 | Dropdown menus |
| `z-sticky` | 100 | Sticky headers |
| `z-overlay` | 200 | Backdrop overlays |
| `z-modal` | 300 | Modal dialogs |
| `z-popover` | 400 | Popovers, tooltips |
| `z-toast` | 500 | Toast notifications |

---

## Styling Rules

### When to use each system

| System | When |
|--------|------|
| **Tailwind classes** | Layout, spacing, responsive, simple colors, borders, text |
| **MUI components** | Dialog, Table, Alert, TextField, Select, Chip, Tooltip |
| **MUI `sx` prop** | When Tailwind cannot express it (theme-aware media queries) |
| **Inline `style={{}}`** | Truly dynamic values (calculated widths, CSS vars) |

### Forbidden patterns

- **No hardcoded hex** in className or sx — use tokens
- **No `text-gray-*` or `bg-slate-*`** — use `neutral-*`
- **No `text-indigo-*`** — use `brand-*`
- **No arbitrary Tailwind** like `text-[#4338CA]` — add to config if needed
- **No new inline styles** for static colors

---

## Components

### PageErrorBoundary

Wraps independent page sections. If one section crashes, the rest continues.

```tsx
import { PageErrorBoundary } from '@/components/PageErrorBoundary'

<PageErrorBoundary section="panel de métricas">
  <MetricsPanel />
</PageErrorBoundary>
```

**Props:** `section` (string), `fallback` (ReactNode)

### EmptyState

Consistent empty state pattern across all pages.

```tsx
import { EmptyState } from '@/components/EmptyState'

<EmptyState
  title="Sin PoCs generadas"
  description="Crea tu primera Proof-of-Concept."
  actionLabel="Crear PoC"
  onAction={() => navigate('/onboarding')}
/>
```

**Props:** `icon`, `title`, `description`, `actionLabel`, `onAction`, `className`

---

## Accessibility

### Focus management

All interactive elements use `focus-ring` class (defined in `index.css`):
```css
.focus-ring:focus-visible {
  outline: 2px solid var(--color-brand-500);
  outline-offset: 2px;
}
```

### Skip navigation

`App.tsx` includes a skip-to-content link that appears on Tab:
```html
<a href="#main-content" class="skip-to-content">Saltar al contenido principal</a>
```

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

### Required ARIA patterns

| Pattern | Where | How |
|---------|-------|-----|
| `role="log"` + `aria-live="polite"` | Chat message lists | Auto-announces new messages |
| `role="status"` + `aria-live="polite"` | Loading indicators | Announces state changes |
| `role="alert"` + `aria-live="assertive"` | Error boundaries | Immediately announces errors |
| `aria-label` | Icon-only buttons | Describes the action |
| `aria-hidden="true"` | Decorative icons | Hides from screen readers |
| `sr-only` class | Labels for visual inputs | Visible to screen readers only |

---

## Performance

### Code Splitting

All 49 routes use `React.lazy()` with a shared `Suspense` fallback (`RouteLoader`).

### Memoization

| Component | Pattern | Why |
|-----------|---------|-----|
| ChatInterface | `memo` + `useCallback` + `useMemo` | Frequent re-renders from message stream |
| DiscoveryChatInterface | `memo` + `useCallback` | Same — real-time chat |
| PromptBar | `memo` + `useCallback` | Input changes trigger parent re-renders |
| LivePreview | `memo` | Heavy DOM — prevent unnecessary rerenders |

### Logging

Use `logger` from `@/utils/logger` instead of `console.log`:
```ts
import { logger } from '@/utils/logger'
logger.info('PoC created', { pocId, userId })
logger.error('API failed', { endpoint, status })
```

Production only shows `warn` and `error` levels.
