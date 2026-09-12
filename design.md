# Lowrox Design System

## 1. Purpose

Create a consistent, modern, responsive visual system for Lowrox. The interface should feel energetic, sporty, fun, and approachable without becoming childish or visually noisy.

This file defines visual foundations, reusable UI rules, responsive behavior, **as well as the high-level sitemap, page structures, and key component patterns** used across the platform.

## 2. Sitemap and Page Structure

### Core Sitemap
- **Public Routes:**
  - `/` - Landing Page / Home
  - `/login` - Authentication Page
- **Protected Routes (Requires Login):**
  - `/onboarding` - Full-screen multi-step modal for new users.
  - `/profile` - The main dashboard/profile management page.
  - `/profile/onboarding` - The inline editor for updating onboarding answers.
  - `/profile/settings` - Account settings.

### Layout Patterns
- **Account Layout:** A two-column structure on desktop (Sidebar navigation on the left, Content area on the right). Collapses to a mobile-friendly view on smaller screens.
- **Onboarding Modal:** A focused, full-screen takeover view with step indicators, progress bars, and no distracting external navigation.

## 3. Brand Direction

- Brand personality: energetic, confident, motivating, social, modern
- Visual tone: performance-focused but friendly
- Primary color direction: vivid orange with black and neutral surfaces
- UI character: bold headings, clear hierarchy, rounded components, strong calls to action
- Overall feeling: a modern fitness platform rather than a hardcore bodybuilding product
- Avoid: overly aggressive visuals, excessive gradients, neon overload, dark screens with poor readability, and decorative elements that compete with content

## 3. Design Principles

1. **Energy with clarity** — Use orange to create momentum and highlight action, not as a background for every section.
2. **Sporty, not intimidating** — Strong typography and contrast should feel motivating and accessible.
3. **Fun through details** — Add personality through rounded shapes, subtle motion, badges, icons, and small color accents.
4. **Mobile first** — All components must work from small mobile screens upward.
5. **Consistent interaction** — The same component and state must behave consistently throughout the product.
6. **Accessible by default** — Do not rely on color alone to communicate status or meaning.

## 4. Color System

### Brand Colors

```css
:root {
  --color-brand-50: #FFF5EB;
  --color-brand-100: #FFE7CC;
  --color-brand-200: #FFCC99;
  --color-brand-300: #FFAD5C;
  --color-brand-400: #FF8A24;
  --color-brand-500: #FF6B00;
  --color-brand-600: #E85D00;
  --color-brand-700: #BF4900;
  --color-brand-800: #963A08;
  --color-brand-900: #7A320C;
}
```

- Primary action: `--color-brand-500`
- Primary hover: `--color-brand-600`
- Primary pressed: `--color-brand-700`
- Soft orange surface: `--color-brand-50` or `--color-brand-100`
- Focus ring: `--color-brand-300`

### Neutral Colors

```css
:root {
  --color-black: #0B0B0C;
  --color-neutral-950: #111113;
  --color-neutral-900: #19191C;
  --color-neutral-800: #29292D;
  --color-neutral-700: #3F3F46;
  --color-neutral-600: #5F5F68;
  --color-neutral-500: #7A7A85;
  --color-neutral-400: #A2A2AA;
  --color-neutral-300: #CECED3;
  --color-neutral-200: #E5E5E8;
  --color-neutral-100: #F3F3F5;
  --color-neutral-50: #FAFAFB;
  --color-white: #FFFFFF;
}
```

### Semantic Colors

```css
:root {
  --color-success: #16A36A;
  --color-success-soft: #EAF8F1;
  --color-warning: #E99A00;
  --color-warning-soft: #FFF7DD;
  --color-error: #D9363E;
  --color-error-soft: #FFF0F1;
  --color-info: #2878D0;
  --color-info-soft: #EDF6FF;
}
```

### Color Usage

- Use white or `neutral-50` as the default page background.
- Use black or `neutral-950` for high-impact areas, navigation, hero treatments, and dark cards.
- Use orange primarily for CTAs, active states, selected controls, highlights, and progress indicators.
- Body text on light backgrounds should use `neutral-800` or darker.
- Body text on dark backgrounds should use white or `neutral-200`.
- Never place normal-size white text on light orange.
- Keep the approximate visual ratio at 60% light neutral, 25% black/dark neutral, 10% orange, and 5% semantic or supporting colors.

## 5. Typography

### Font Family

```css
:root {
  --font-primary: "IBM Plex Sans Thai", "Noto Sans Thai", -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

- Use the same font family for Thai and English to maintain consistency.
- Use weights `400`, `500`, `600`, and `700`.
- Avoid using italic text for Thai content.
- Use uppercase English only for short labels, badges, or statistics.

### Type Scale

| Token | Mobile | Desktop | Weight | Line height | Usage |
|---|---:|---:|---:|---:|---|
| `display-lg` | 40px | 64px | 700 | 1.1 | Hero statement |
| `display-md` | 34px | 52px | 700 | 1.15 | Major campaign heading |
| `heading-1` | 30px | 44px | 700 | 1.2 | Page title |
| `heading-2` | 26px | 36px | 700 | 1.25 | Section title |
| `heading-3` | 22px | 28px | 600 | 1.3 | Component group title |
| `heading-4` | 18px | 22px | 600 | 1.35 | Card title |
| `body-lg` | 18px | 18px | 400 | 1.6 | Introductory copy |
| `body-md` | 16px | 16px | 400 | 1.6 | Default body copy |
| `body-sm` | 14px | 14px | 400 | 1.5 | Supporting copy |
| `label` | 14px | 14px | 600 | 1.4 | Buttons and controls |
| `caption` | 12px | 12px | 500 | 1.4 | Metadata and helper text |

- Use responsive type sizing with `clamp()` for large headings.
- Keep body text between 45 and 75 characters per line where possible.
- Do not use font size below 12px.

## 6. Spacing System

Use a 4px base unit.

```css
:root {
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
}
```

- Use 16–24px internal padding for cards.
- Use 48–64px vertical spacing between sections on mobile.
- Use 80–120px vertical spacing between major sections on desktop.
- Prefer `gap` over individual child margins in flex and grid layouts.

## 7. Layout and Grid

### Container

```css
:root {
  --container-max: 1200px;
  --container-wide: 1440px;
}
```

- Default content width: 1200px maximum.
- Wide visual sections may use up to 1440px.
- Center containers with automatic inline margins.
- Page padding: 16px mobile, 24px tablet, 32px desktop.

### Responsive Grid

- Mobile: 4 columns, 16px gutter
- Tablet: 8 columns, 20px gutter
- Desktop: 12 columns, 24px gutter
- Avoid fixed component widths unless required for usability.
- Use CSS Grid for page-level composition and Flexbox for component alignment.

### Breakpoints

```css
:root {
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

Build mobile-first using `min-width` media queries. Breakpoints should respond to content needs rather than device names alone.

## 8. Shape, Border, and Elevation

### Border Radius

```css
:root {
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 999px;
}
```

- Buttons and inputs: 12px
- Cards: 16–24px
- Badges, chips, and segmented controls: pill radius
- Avoid mixing many radius values within one screen.

### Borders

```css
:root {
  --border-subtle: 1px solid #E5E5E8;
  --border-strong: 1px solid #A2A2AA;
  --border-dark: 1px solid #29292D;
}
```

Use borders to define structure. Do not rely on shadows for every component.

### Shadows

```css
:root {
  --shadow-sm: 0 2px 8px rgba(11, 11, 12, 0.06);
  --shadow-md: 0 10px 30px rgba(11, 11, 12, 0.10);
  --shadow-lg: 0 20px 50px rgba(11, 11, 12, 0.16);
}
```

- Use `shadow-sm` for floating controls.
- Use `shadow-md` for elevated cards, menus, and modals.
- Reserve `shadow-lg` for overlays or high-emphasis visual content.

## 9. Icons and Imagery

### Icons

- Use one consistent outlined icon family.
- Default icon sizes: 16px, 20px, 24px, and 32px.
- Use a 2px stroke for standard interface icons.
- Pair unfamiliar icons with a text label.
- Do not use emoji as functional UI icons.

### Photography

- Prioritize authentic movement, training, teamwork, and visible effort.
- Use dynamic cropping and natural lighting.
- Include users with varied fitness levels; avoid showing only elite athletes.
- Use orange overlays sparingly and keep faces, posture, and equipment recognizable.

### Graphic Style

- Use bold geometric crops, angled accents, circular progress motifs, subtle grids, and motion lines.
- Decorative graphics must not interfere with text readability or controls.
- Avoid generic flames, heavy grunge textures, or aggressive combat-sport styling.

## 10. Core Components

### Buttons

Variants:

- Primary: orange background, black or white text depending on verified contrast
- Secondary: black background, white text
- Outline: transparent background, dark border and text
- Ghost: transparent background, no border
- Destructive: error background or error-colored outline

Sizes:

- Small: 36px height
- Medium: 44px height
- Large: 52px height

Rules:

- Minimum touch target: 44×44px.
- Use medium as the default size.
- Use one primary CTA per visual group.
- Disabled controls must remain readable and should not use opacity lower than 40%.
- Loading state must preserve button width and display a progress indicator.

### Form Controls

- Minimum input height: 48px.
- Labels appear above fields and remain visible after input.
- Use placeholder text only as an example, never as a replacement for the label.
- Show helper or error messages directly below the related field.
- Focus state: visible 2px orange ring with sufficient offset.
- Error state: error border, message, and supporting icon; do not communicate error with color alone.

### Multi-step Forms & Editors

- **Component Reuse:** Form steps (e.g., Basic Info, Goals) should be designed as isolated components that can be rendered in both a wizard (Onboarding Modal) and a standard page (Profile Editor).
- **Validation:** Multi-step inline editors must validate all encapsulated sections simultaneously upon "Save" and highlight errors clearly in their respective areas.
- **Unsaved Changes:** Any editor page must prompt the user with a Confirm Dialog if they attempt to navigate away with unsaved modifications.

### Feedback Cards & Sections

- **Feedback Cards:** Use soft background colors (`--color-success-soft`, `--color-info-soft`) with a darker border to present contextual feedback or success states within forms.
- **Add Action Buttons:** Use dashed borders with a brand color text/icon for secondary "Add more" actions (e.g., adding multiple goals or health concerns).

### Cards

Card variants:

- Standard: white surface, subtle border
- Highlight: orange-tinted surface or orange accent border
- Dark: black surface with light text
- Interactive: hover elevation and slight upward movement on pointer devices

Card content should follow a consistent order: visual or icon, title, supporting information, status or metadata, then action.

### Navigation

- Use a clear active state with color plus shape, weight, or underline.
- Desktop navigation should remain visually compact.
- Mobile navigation should collapse into an accessible menu or bottom navigation when appropriate.
- Sticky navigation may be used, but it must not consume excessive screen height.

### Tabs and Segmented Controls

- Use tabs to switch between sibling views.
- Use segmented controls for two to four compact options.
- The selected state should use orange or black fill with visible text contrast.
- Allow horizontal scrolling on small screens instead of compressing labels.

### Badges and Chips

- Use badges for status and chips for filters or selections.
- Keep labels short.
- Provide a removable icon only when the chip can be removed.
- Semantic badges must include text, not color alone.

### Progress and Statistics

- Use bold numbers and restrained labels.
- Orange may highlight the current value or active progress.
- Always pair charts and progress indicators with a readable text value.
- Use motion only when it helps users understand a value change.

### Feedback and Overlays

- Toast: short, temporary confirmation only.
- Inline message: validation or contextual guidance.
- Modal: critical decisions or short focused tasks.
- Drawer or bottom sheet: supporting tasks on mobile.
- Empty states should explain the situation and provide one clear next action.

## 11. Interaction and Motion

```css
:root {
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --duration-slow: 320ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-emphasized: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

- Use 120–200ms transitions for hover, focus, and selection.
- Use 200–320ms for drawers, modals, and expanding content.
- Prefer transform and opacity animation.
- Avoid continuous animation and excessive bouncing.
- Respect `prefers-reduced-motion` and provide a non-animated alternative.
- Hover effects must never be the only interaction cue.

## 12. Responsive Behavior

### Mobile: below 768px

- Use a single-column content flow by default.
- Stack card content and actions when horizontal space is limited.
- Use full-width primary buttons for important form actions.
- Convert wide tables into cards, stacked rows, or horizontally scrollable regions.
- Keep important actions within easy thumb reach.
- Do not hide essential information solely to make the layout fit.

### Tablet: 768–1023px

- Use one or two columns depending on content density.
- Preserve readable line length rather than stretching content across the viewport.
- Navigation may use either desktop or collapsed behavior based on available label width.

### Desktop: 1024px and above

- Use multi-column layouts where relationships benefit from side-by-side comparison.
- Do not stretch body copy to the full container width.
- Hover states may enhance interaction but must not replace click or keyboard behavior.

### Responsive QA

Test at minimum:

- 320px
- 375px
- 390px
- 768px
- 1024px
- 1280px
- 1440px

Verify text wrapping, keyboard focus, menu behavior, touch targets, overflow, images, form validation, dialogs, and loading states at each relevant width.

## 13. Accessibility

- Target WCAG 2.2 AA.
- Normal text contrast must be at least 4.5:1.
- Large text contrast must be at least 3:1.
- Interactive controls and meaningful graphics must have at least 3:1 contrast against adjacent colors.
- Every interactive element must be keyboard accessible.
- Use visible `:focus-visible` styles.
- Use semantic HTML before ARIA.
- Provide text alternatives for meaningful images.
- Do not use color, icon, position, or motion as the only way to communicate meaning.
- Error summaries should link users to the related fields in long forms.
- Support browser zoom up to 200% without loss of content or function.

## 14. Content Style

- Voice: motivating, direct, friendly, and concise
- Prefer action-oriented labels.
- Use familiar Thai words where possible; include English fitness terminology only when it helps recognition.
- Avoid language that shames users for their current ability or body condition.
- Keep button labels specific, such as “เริ่มประเมิน” rather than “ดำเนินการ”.
- Keep headings short and scannable.

## 15. Implementation Rules for AI Dev

- Build reusable tokens and components; do not hard-code visual values repeatedly.
- Implement light surfaces as the default and use dark sections intentionally for emphasis.
- Use orange for primary action and selected states, not for large volumes of body text.
- Components must include default, hover, focus, active, disabled, loading, error, success, and empty states where relevant.
- Do not invent pages, features, dashboard metrics, user roles, or workflows outside of the documented sitemap.
- If product structure or content is missing, request clarification instead of creating it.
- Keep business logic separate from presentational components.
- Use responsive images and reserve image dimensions to prevent layout shift.
- Prefer CSS variables or design-token configuration so the system can be themed consistently.
- Validate contrast after implementation; do not assume brand colors automatically pass accessibility requirements.

## 16. Definition of Done

The UI is ready when:

- Brand tokens are implemented centrally.
- Components use shared styles and predictable variants.
- All important states are represented.
- Layouts work across the defined test widths.
- Keyboard navigation and focus states work correctly.
- Color contrast meets WCAG 2.2 AA.
- The interface consistently feels sporty, energetic, fun, and modern.
- No additional product functionality has been introduced by interpreting this document.
