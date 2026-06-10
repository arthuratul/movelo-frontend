# Movelo Design System

Movelo is a **delivery app** (food, groceries, packages). Every UI decision should feel fast, warm, and trustworthy. Always write mobile-first.

---

## Colors

### Brand

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#FF6B00` | Primary CTAs, links, active states, highlights |
| `primary-hover` | `#E55F00` | Hover state on primary elements |
| `primary-active` | `#CC5400` | Pressed/active state |
| `primary-subtle` | `#FFF4EE` | Background tint for orange-themed sections |
| `primary-muted` | `#FFE0C7` | Slightly stronger tint, badge backgrounds |
| `secondary` | `#111827` | Secondary buttons, headings on light bg |

### Status

| Token | Usage |
|---|---|
| `success` / `success-light` | Delivered, available, confirmed — always green |
| `error` / `error-light` | Errors, failed delivery, out of stock |
| `warning` / `warning-light` | Delays, low stock, attention needed |
| `info` / `info-light` | Informational, tips, neutral notifications |

### Surface

| Token | Usage |
|---|---|
| `background` `#F9FAFB` | Page background |
| `surface` `#FFFFFF` | Cards, modals, sheets |
| `border` `#E5E7EB` | Dividers, input borders |
| `border-subtle` `#F3F4F6` | Very subtle separators |

### Neutral Scale (`neutral-50` → `neutral-900`)

Use `neutral-900` for primary text, `neutral-500` for secondary, `neutral-400` for placeholder/disabled.

---

## Typography

Font: **Inter** (loaded via `next/font/google`). CSS variable: `--font-inter`.  
Mono font: **Geist Mono** — use for order IDs, tracking numbers, promo codes.

### Semantic classes (prefer these over raw `text-*` utilities)

| Class | Size | Weight | Use for |
|---|---|---|---|
| `.text-display` | 48px | 800 | Hero headlines |
| `.text-title-1` | 36px | 700 | Page titles |
| `.text-title-2` | 30px | 700 | Section headers |
| `.text-title-3` | 24px | 600 | Card titles, modal headers |
| `.text-title-4` | 20px | 600 | Sub-sections |
| `.text-title-5` | 18px | 600 | List headers |
| `.text-body-lg` | 18px | 400 | Featured body text |
| `.text-body` | 16px | 400 | Default body copy |
| `.text-body-sm` | 14px | 400 | Secondary info, descriptions |
| `.text-caption` | 12px | 400 | Timestamps, metadata, helper text |
| `.text-overline` | 11px | 600 | Uppercase category labels |

### When to use raw Tailwind text utilities

Use `text-sm`, `text-base`, `text-lg` etc. only for inline overrides or when mixing with other utilities in a single element. For standalone text blocks, use the semantic classes above.

---

## Buttons

```html
<!-- Primary CTA -->
<button class="btn btn-primary btn-full">Order Now</button>

<!-- Secondary action -->
<button class="btn btn-neutral">Cancel</button>

<!-- Size variants: btn-xs, btn-sm, (default md), btn-lg, btn-xl, btn-full -->
<!-- Style variants: btn-primary, btn-secondary, btn-subtle, btn-outline, btn-ghost, btn-neutral, btn-danger -->

<!-- Icon-only -->
<button class="btn-icon"><SearchIcon /></button>
```

**Rules:**
- Full-width (`btn-full`) for the primary action on any screen
- `btn-primary` for the single most important action per view
- Never put two `btn-primary` buttons side by side — use `btn-subtle` or `btn-outline` for the secondary
- Minimum touch target: 44px height — use `btn-lg` or larger on mobile

---

## Cards

```html
<div class="card">...</div>          <!-- default: rounded-xl, shadow-card, p-4 -->
<div class="card-lg">...</div>       <!-- p-6, rounded-2xl -->
<div class="card-flat">...</div>     <!-- border instead of shadow -->
<div class="card-muted">...</div>    <!-- neutral-50 background -->
```

---

## Inputs

```html
<input class="input" placeholder="Search..." />
<input class="input input-error" />   <!-- error state -->
<input class="input input-sm" />      <!-- small -->
<input class="input input-lg" />      <!-- large -->
```

Always pair with a `<label>` for accessibility.

---

## Badges

```html
<span class="badge badge-success">Delivered</span>
<span class="badge badge-warning">Delayed</span>
<span class="badge badge-primary">New</span>
```

---

## Delivery-specific components

```html
<!-- Info pill (ETA, distance, rating) -->
<span class="info-pill">🕐 30 min</span>
<span class="info-pill">⭐ 4.8</span>

<!-- Price group -->
<span class="price">₹249</span>
<span class="price-strike">₹299</span>
<span class="price-saving">Save ₹50</span>

<!-- Promo tag -->
<span class="promo-tag">20% off</span>

<!-- Fixed bottom CTA bar (mobile) -->
<div class="bottom-action-bar">
  <button class="btn btn-primary btn-full">Proceed to Checkout</button>
</div>
```

---

## Shadows

| Token | Use for |
|---|---|
| `shadow-card` | Default card elevation |
| `shadow-elevated` | Floating elements, sticky headers |
| `shadow-dropdown` | Dropdown menus, autocomplete |
| `shadow-modal` | Modals, bottom sheets |

---

## Spacing conventions

- Page horizontal padding: `px-4` (mobile), `sm:px-6`, `lg:px-8` — or use `.page-container`
- Card inner padding: `p-4` (default card) or `p-6` (card-lg)
- Section vertical gap: `py-10` mobile, `sm:py-16` desktop — or use `.section`
- Between related items: `gap-3` or `gap-4`
- Between sections: `gap-8` or `gap-12`

---

## Border radius

Tailwind utilities map to tuned values:

| Utility | Value | Use for |
|---|---|---|
| `rounded-sm` | 6px | Subtle rounding (tags, chips) |
| `rounded-md` | 10px | Small buttons, small inputs |
| `rounded-lg` | 14px | Default buttons, inputs |
| `rounded-xl` | 18px | Cards, panels |
| `rounded-2xl` | 24px | Large cards |
| `rounded-3xl` | 32px | Hero elements, modals |
| `rounded-full` | 9999px | Pills, avatars, dots |

---

## Rules

1. **Mobile-first**: write base styles for mobile, add `sm:` / `md:` / `lg:` breakpoints only when the layout truly needs to change.
2. **Orange = action**: `primary` color means "tap here to do the main thing". Don't use it decoratively.
3. **Consistent elevation**: only use shadows from the defined shadow scale — no arbitrary `shadow-[...]`.
4. **No hardcoded colors**: always use a design-system token (e.g. `text-neutral-600`) not `text-[#4B5563]`.
5. **Touch targets**: interactive elements must be at least `h-11` (44px). Never smaller on mobile.
6. **Status = color**: use the semantic status tokens consistently — green for good, red for error, amber for warning. Don't invent new meanings for colors.