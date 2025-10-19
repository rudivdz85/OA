# Design System Documentation

This document outlines the design system for the AI Coaching Platform, including color palettes, usage guidelines, and accessibility notes.

## Color Palette

### Primary Purple - Main Brand Color
The primary color represents trust, calm, and professionalism suitable for a mental health platform.

| Shade | Hex Code | Usage | Contrast Ratio (on white) |
|-------|----------|-------|---------------------------|
| 50    | `#faf5ff` | Light backgrounds, subtle highlights | 1.03:1 |
| 100   | `#f3e8ff` | Card backgrounds, hover states | 1.05:1 |
| 200   | `#e9d5ff` | Borders, dividers | 1.11:1 |
| 300   | `#d8b4fe` | Disabled states, secondary elements | 1.24:1 |
| 400   | `#c084fc` | Interactive elements | 1.75:1 |
| **500** | **`#a855f7`** | **Primary buttons, links, CTAs** | **2.85:1** |
| 600   | `#9333ea` | Primary button hover | 3.78:1 |
| 700   | `#7e22ce` | Active states, emphasis | 5.43:1 ✓ AA |
| 800   | `#6b21a8` | Text on light backgrounds | 7.12:1 ✓ AAA |
| 900   | `#581c87` | Headings, dark text | 9.41:1 ✓ AAA |
| 950   | `#3b0764` | High contrast text | 13.28:1 ✓ AAA |

**Main Usage:**
- `primary-500`: Primary buttons, main CTAs, links
- `primary-600`: Button hover states
- `primary-700`: Active/pressed states
- `primary-50/100`: Background highlights and cards

### Secondary Teal - Complementary & Calming
The secondary color provides a calming, balanced complement to purple.

| Shade | Hex Code | Usage | Contrast Ratio (on white) |
|-------|----------|-------|---------------------------|
| 50    | `#f0fdfa` | Subtle backgrounds | 1.01:1 |
| 100   | `#ccfbf1` | Card accents | 1.03:1 |
| 200   | `#99f6e4` | Borders, decorative | 1.11:1 |
| 300   | `#5eead4` | Highlights | 1.29:1 |
| 400   | `#2dd4bf` | Interactive accents | 1.75:1 |
| **500** | **`#14b8a6`** | **Secondary buttons, badges** | **2.48:1** |
| 600   | `#0d9488` | Secondary button hover | 3.36:1 |
| 700   | `#0f766e` | Active secondary states | 4.63:1 ✓ AA |
| 800   | `#115e59` | Secondary text | 6.24:1 ✓ AA |
| 900   | `#134e4a` | Dark secondary text | 7.93:1 ✓ AAA |

**Main Usage:**
- Assessment cards and progress indicators
- Secondary actions and buttons
- Success states and positive feedback
- Complementary gradients with primary

### Accent Gold - Warmth & Highlights
The accent color adds warmth and draws attention to special elements.

| Shade | Hex Code | Usage | Contrast Ratio (on white) |
|-------|----------|-------|---------------------------|
| 50    | `#fffbeb` | Subtle highlights | 1.02:1 |
| 100   | `#fef3c7` | Warning backgrounds | 1.04:1 |
| 200   | `#fde68a` | Borders | 1.14:1 |
| 300   | `#fcd34d` | Decorative elements | 1.42:1 |
| 400   | `#fbbf24` | Attention elements | 1.84:1 |
| **500** | **`#f59e0b`** | **Accent buttons, highlights** | **2.41:1** |
| 600   | `#d97706` | Accent hover states | 3.27:1 |
| 700   | `#b45309` | Active accent states | 4.69:1 ✓ AA |
| 800   | `#92400e` | Accent text | 6.69:1 ✓ AA |
| 900   | `#78350f` | Dark accent text | 8.54:1 ✓ AAA |

**Main Usage:**
- Special badges and tags
- Privacy/security indicators
- Premium features
- Tertiary actions

### Semantic Colors

#### Success - Green
```
Light:   #86efac (1.43:1)
Default: #22c55e (2.42:1)
Dark:    #16a34a (3.41:1)
```
**Usage:** Success messages, completed states, positive feedback

#### Warning - Yellow
```
Light:   #fde047 (1.24:1)
Default: #eab308 (2.19:1)
Dark:    #ca8a04 (3.26:1)
```
**Usage:** Warnings, important notices, disclaimers

#### Error - Red
```
Light:   #fca5a5 (1.92:1)
Default: #ef4444 (3.04:1)
Dark:    #dc2626 (4.52:1 ✓ AA)
```
**Usage:** Errors, destructive actions, critical alerts

#### Info - Blue
```
Light:   #93c5fd (1.59:1)
Default: #3b82f6 (3.18:1)
Dark:    #2563eb (4.54:1 ✓ AA)
```
**Usage:** Informational messages, tips, neutral notifications

### Neutral Gray Scale

| Shade | Hex Code | Usage | Contrast Ratio (on white) |
|-------|----------|-------|---------------------------|
| 50    | `#fafafa` | App background | 1.01:1 |
| 100   | `#f5f5f5` | Secondary background | 1.03:1 |
| 200   | `#e5e5e5` | Borders, dividers | 1.17:1 |
| 300   | `#d4d4d4` | Disabled text | 1.40:1 |
| 400   | `#a3a3a3` | Placeholder text | 2.48:1 |
| 500   | `#737373` | Secondary text | 4.69:1 ✓ AA |
| 600   | `#525252` | Body text | 6.95:1 ✓ AA |
| 700   | `#404040` | Emphasis text | 9.34:1 ✓ AAA |
| 800   | `#262626` | Headings | 12.63:1 ✓ AAA |
| 900   | `#171717` | Primary text | 14.83:1 ✓ AAA |
| 950   | `#0a0a0a` | Maximum contrast | 17.01:1 ✓ AAA |

## Gradients

### Primary Gradient
```css
background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
```
**Usage:** Hero buttons, premium features, main CTAs

### Secondary Gradient
```css
background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
```
**Usage:** Assessment cards, progress indicators

### Accent Gradient
```css
background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
```
**Usage:** Special badges, highlights

### Purple-Teal Blend
```css
background: linear-gradient(135deg, #a855f7 0%, #14b8a6 100%);
```
**Usage:** Welcome cards, feature highlights

## Shadows

### Purple-Tinted Shadows
```css
/* Small */
box-shadow: 0 1px 2px 0 rgb(168 85 247 / 0.05);

/* Medium */
box-shadow: 0 4px 6px -1px rgb(168 85 247 / 0.1),
            0 2px 4px -2px rgb(168 85 247 / 0.1);

/* Large */
box-shadow: 0 10px 15px -3px rgb(168 85 247 / 0.15),
            0 4px 6px -4px rgb(168 85 247 / 0.1);

/* Extra Large */
box-shadow: 0 20px 25px -5px rgb(168 85 247 / 0.2),
            0 8px 10px -6px rgb(168 85 247 / 0.1);
```

## Color Usage Guidelines

### Buttons

#### Primary Actions
```tsx
// Standard primary button
className="bg-gradient-primary hover:shadow-purple-lg text-white"

// Primary outline
className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
```

#### Secondary Actions
```tsx
// Standard secondary button
className="bg-gradient-secondary hover:shadow-lg text-white"

// Secondary outline
className="border-2 border-secondary-500 text-secondary-600 hover:bg-secondary-50"
```

#### Tertiary Actions
```tsx
// Ghost button
className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
```

### Cards

#### Feature Cards
```tsx
// Primary feature
className="bg-white border-2 border-primary-200 hover:border-primary-400 hover:shadow-purple-lg"

// Secondary feature
className="bg-white border-2 border-secondary-200 hover:border-secondary-400"

// Accent feature
className="bg-white border-2 border-accent-200 hover:border-accent-400"
```

#### Content Cards
```tsx
// Standard card
className="bg-white rounded-2xl shadow-sm border border-primary-100"

// Elevated card
className="bg-white rounded-2xl shadow-purple-md border border-primary-200"
```

### Text Hierarchy

```tsx
// Page Title (H1)
className="text-5xl font-extrabold text-neutral-900"

// Section Title (H2)
className="text-3xl font-bold text-neutral-900"

// Subsection Title (H3)
className="text-2xl font-bold text-neutral-900"

// Card Title (H4)
className="text-xl font-semibold text-neutral-900"

// Body Text
className="text-base text-neutral-600"

// Secondary Text
className="text-sm text-neutral-500"

// Emphasis
className="text-base font-semibold text-neutral-900"
```

### Backgrounds

```tsx
// App background
className="bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/30"

// Section background
className="bg-gradient-to-r from-primary-50 to-secondary-50"

// Card backgrounds
className="bg-white"

// Highlight backgrounds
className="bg-primary-50"
className="bg-secondary-50"
className="bg-accent-50"
```

## Accessibility Guidelines

### WCAG 2.1 Compliance

#### Text Contrast Requirements

**Level AA (Minimum):**
- Normal text: 4.5:1
- Large text (18pt+): 3:1

**Level AAA (Enhanced):**
- Normal text: 7:1
- Large text (18pt+): 4.5:1

#### Recommended Combinations

✓ **Excellent Contrast (AAA)**
- `neutral-900` on white (14.83:1)
- `neutral-800` on white (12.63:1)
- `primary-800` on white (7.12:1)
- `primary-950` on `primary-50` (12.89:1)

✓ **Good Contrast (AA)**
- `neutral-600` on white (6.95:1)
- `primary-700` on white (5.43:1)
- `secondary-700` on white (4.63:1)

⚠️ **Use with Caution**
- `primary-500` on white (2.85:1) - Use for large text or icons only
- `secondary-500` on white (2.48:1) - Use for large text or icons only

❌ **Insufficient Contrast**
- `primary-300` and lighter on white - Decorative only
- `secondary-300` and lighter on white - Decorative only

### Best Practices

1. **Always use sufficient contrast for text**
   - Body text: `neutral-600` or darker
   - Headings: `neutral-800` or `neutral-900`
   - Links: `primary-600` or darker

2. **Use color + icon/text for important states**
   - Don't rely on color alone
   - Add icons or labels for clarity

3. **Test with color blindness simulators**
   - Purple and teal have good differentiation
   - Avoid red/green as only indicators

4. **Provide hover and focus states**
   - Always include visible focus indicators
   - Use `focus-visible:ring-2 ring-primary-500` for keyboard navigation

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Font Sizes
```
text-xs:   0.75rem  (12px)
text-sm:   0.875rem (14px)
text-base: 1rem     (16px)
text-lg:   1.125rem (18px)
text-xl:   1.25rem  (20px)
text-2xl:  1.5rem   (24px)
text-3xl:  1.875rem (30px)
text-4xl:  2.25rem  (36px)
text-5xl:  3rem     (48px)
```

### Font Weights
```
font-normal:    400
font-medium:    500
font-semibold:  600
font-bold:      700
font-extrabold: 800
```

## Spacing Scale

```
0:   0px
1:   0.25rem (4px)
2:   0.5rem  (8px)
3:   0.75rem (12px)
4:   1rem    (16px)
6:   1.5rem  (24px)
8:   2rem    (32px)
12:  3rem    (48px)
16:  4rem    (64px)
20:  5rem    (80px)
24:  6rem    (96px)
```

## Border Radius

```
rounded-lg:   0.5rem  (8px)  - Small elements
rounded-xl:   0.75rem (12px) - Medium cards
rounded-2xl:  1rem    (16px) - Large cards
rounded-3xl:  1.5rem  (24px) - Hero elements
rounded-full: 9999px         - Circles, pills
```

## Animation & Transitions

### Duration
```
duration-200: 200ms - Quick interactions
duration-300: 300ms - Standard transitions
```

### Easing
```
ease-in-out - Most transitions
ease-out    - Appearing elements
```

### Common Transitions
```tsx
// Hover scale
className="transition-transform duration-200 hover:scale-105"

// Color transition
className="transition-colors duration-200"

// All properties
className="transition-all duration-200"
```

## Component Examples

### Primary Button
```tsx
<button className="bg-gradient-primary hover:shadow-purple-lg text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105">
  Get Started
</button>
```

### Feature Card
```tsx
<div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-purple-lg transition-all duration-200 border border-primary-100 hover:border-primary-300">
  <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
    {/* Icon */}
  </div>
  <h3 className="text-xl font-bold text-neutral-900 mb-3">Title</h3>
  <p className="text-neutral-600 leading-relaxed">Description</p>
</div>
```

### Badge
```tsx
<span className="bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-2 rounded-full">
  New Feature
</span>
```

## Dark Mode (Future Consideration)

The CSS variables are already set up for dark mode support:
- Background shifts to `#0a0a0a`, `#171717`, `#262626`
- Primary becomes `#c084fc` (lighter purple)
- Text becomes light variants

To enable dark mode, add `dark:` prefixes to Tailwind classes and ensure proper contrast.

## Resources

- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Color Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

Last updated: 2025-10-18
