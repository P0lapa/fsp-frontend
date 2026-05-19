# Theme Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded UI colors with semantic dark-theme tokens across the app and add the selected light-theme token set to the shared stylesheet.

**Architecture:** The theme system will live in `src/index.css` as semantic CSS custom properties with dark theme as default and light theme under a separate selector. React components will stop referring to raw hex colors and instead use Tailwind arbitrary values backed by CSS variables like `bg-[var(--color-bg)]`, `text-[var(--color-text)]`, and `border-[var(--color-border)]`. Shared presentation helpers that currently return raw classes will also return token-based classes so the color system stays centralized.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, CSS custom properties

---

## File Structure

- Modify: `src/index.css`
  Defines semantic tokens for dark theme and the selected light theme.
- Modify: `src/App.tsx`
  Switches the app shell background to theme tokens.
- Modify: `src/components/Header.tsx`
  Replaces header colors, link states, mobile menu colors, and burger icon colors with tokens.
- Modify: `src/components/home/HeroSection.tsx`
  Replaces hero gradients, text colors, and CTA colors with tokens.
- Modify: `src/components/home/TrainingTicker.tsx`
  Replaces ticker surface, button, and marquee colors with tokens.
- Modify: `src/components/home/SectionFolderLabel.tsx`
  Replaces folder label color with token.
- Modify: `src/components/competitions/CompetitionsHero.tsx`
  Replaces competitions hero colors with tokens.
- Modify: `src/components/competitions/CompetitionsFilters.tsx`
  Replaces filter surface, border, dropdown, and hover colors with tokens.
- Modify: `src/components/competitions/CompetitionCard.tsx`
  Replaces card surface, top bar, text, and CTA colors with tokens.
- Modify: `src/components/competitions/competitionPresentation.ts`
  Replaces helper-returned raw classes with token-based classes for statuses and buttons.
- Modify: `src/pages/CompetitionsPage.tsx`
  Replaces loading, error, empty-state, title, and CTA colors with tokens.
- Modify: `src/pages/CompetitionDetailsPage.tsx`
  Replaces detail-page surface, typography, error, facts-panel, and back-link colors with tokens.
- Modify: `src/pages/TrainingPage.tsx`
  Replaces placeholder page text colors with tokens.
- Modify: `src/pages/NewsPage.tsx`
  Replaces placeholder page text colors with tokens.
- Modify: `src/pages/ProfilePage.tsx`
  Replaces placeholder page text colors with tokens.

### Task 1: Define Semantic Theme Tokens

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add the dark and light token sets to `src/index.css`**

Add semantic variables for:

```css
:root {
  --color-bg: #0a0a0a;
  --color-bg-strong: #050505;
  --color-surface: #08110a;
  --color-surface-soft: #031208;
  --color-surface-card: #001a07;
  --color-border: #04ca37;
  --color-border-muted: #1a3a23;
  --color-border-subtle: #29312d;
  --color-text: #d3e6eb;
  --color-text-muted: #b7d0d8;
  --color-text-soft: #9db4bc;
  --color-text-strong: #08110a;
  --color-accent: #04ca37;
  --color-accent-muted: #079918;
  --color-acid: #7f9f01;
  --color-acid-strong: #c0f000;
  --color-acid-contrast: #111111;
  --color-info: #05d9f6;
  --color-info-soft: #d8f1f7;
  --color-danger: #ff3b30;
  --color-danger-bg: #180505;
  --color-danger-text: #ffd5d2;
  --color-success-bright: #9dff00;
  --shadow-acid: 0 0 24px rgba(127, 159, 1, 0.35);
  --shadow-info-ring: 0 0 0 1px rgba(5, 217, 246, 0.1);
}

:root[data-theme='light'] {
  --color-bg: #f4efe2;
  --color-bg-strong: #efe7d6;
  --color-surface: #fbf7ec;
  --color-surface-soft: #f7f1e4;
  --color-surface-card: #fbf7ec;
  --color-border: #4f8a3d;
  --color-border-muted: #d8ddc8;
  --color-border-subtle: #d4d8c6;
  --color-text: #2f4332;
  --color-text-muted: #394d3f;
  --color-text-soft: #314634;
  --color-text-strong: #233018;
  --color-accent: #4f8a3d;
  --color-accent-muted: #6c8d59;
  --color-acid: #8da83a;
  --color-acid-strong: #cde968;
  --color-acid-contrast: #233018;
  --color-info: #6f9f95;
  --color-info-soft: #eef5ee;
  --color-danger: #b44848;
  --color-danger-bg: #f7e6e2;
  --color-danger-text: #7f2f2f;
  --color-success-bright: #7aa838;
  --shadow-acid: 0 0 24px rgba(141, 168, 58, 0.22);
  --shadow-info-ring: 0 0 0 1px rgba(111, 159, 149, 0.18);
}
```

- [ ] **Step 2: Repoint global body styles at the new tokens**

Use:

```css
body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: "IBM Plex Mono", monospace;
  overflow-x: hidden;
}
```

### Task 2: Convert Shared Shell and Navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/home/SectionFolderLabel.tsx`

- [ ] **Step 1: Replace app-shell background in `src/App.tsx`**

Switch:

```tsx
<div className="min-h-screen overflow-x-hidden bg-[var(--color-bg)]">
```

- [ ] **Step 2: Replace header colors in `src/components/Header.tsx`**

Use tokens for:
- header border/background
- brand link
- active/inactive nav link
- auth actions
- mobile menu divider
- burger icon border and bars

Key class substitutions:

```tsx
border-[var(--color-border)]
bg-[var(--color-bg)]
text-[var(--color-accent)]
text-[var(--color-accent-muted)]
hover:text-[var(--color-accent)]
border-t border-[var(--color-border)]/40
```

- [ ] **Step 3: Replace folder label color in `src/components/home/SectionFolderLabel.tsx`**

Use:

```tsx
className="mb-8 font-jetbrains text-xs uppercase tracking-[0.18em] text-[var(--color-acid)] sm:text-sm"
```

### Task 3: Convert Shared Home and Competitions Hero Sections

**Files:**
- Modify: `src/components/home/HeroSection.tsx`
- Modify: `src/components/competitions/CompetitionsHero.tsx`
- Modify: `src/components/home/TrainingTicker.tsx`

- [ ] **Step 1: Replace hero surfaces and gradients with token-backed classes**

Use:

```tsx
border-b border-[var(--color-border)]/30 bg-[var(--color-bg)]
```

And token-backed gradients:

```tsx
bg-[var(--color-bg-strong)]
bg-gradient-to-r from-[var(--color-bg)] via-[color:color-mix(in_srgb,var(--color-bg)_90%,transparent)] to-[color:color-mix(in_srgb,var(--color-bg)_50%,transparent)]
bg-gradient-to-b from-[color:color-mix(in_srgb,var(--color-bg)_20%,transparent)] via-transparent to-[var(--color-bg)]
```

- [ ] **Step 2: Replace hero text and CTA colors**

Use:

```tsx
text-[var(--color-accent)]
text-[var(--color-text)]
border-[var(--color-acid)]
bg-[var(--color-acid-strong)]
text-[var(--color-acid-contrast)]
hover:shadow-[var(--shadow-acid)]
```

- [ ] **Step 3: Replace ticker colors in `src/components/home/TrainingTicker.tsx`**

Use tokens for:
- section borders/background
- cyan chip via `--color-info`
- ticker links via `--color-accent-muted` and `--color-accent`

### Task 4: Convert Competitions UI

**Files:**
- Modify: `src/components/competitions/CompetitionsFilters.tsx`
- Modify: `src/components/competitions/CompetitionCard.tsx`
- Modify: `src/components/competitions/competitionPresentation.ts`
- Modify: `src/pages/CompetitionsPage.tsx`

- [ ] **Step 1: Tokenize filter controls in `src/components/competitions/CompetitionsFilters.tsx`**

Replace raw classes with:

```tsx
bg-[var(--color-bg)]
border-[var(--color-border-subtle)]
hover:border-[color:color-mix(in_srgb,var(--color-border-subtle)_70%,var(--color-text-muted))]
text-[var(--color-text-muted)]
focus:border-[var(--color-info)]
shadow-[var(--shadow-info-ring)]
text-[var(--color-info-soft)]
```

- [ ] **Step 2: Tokenize card colors in `src/components/competitions/CompetitionCard.tsx`**

Replace raw colors with:

```tsx
border-[var(--color-border)]
bg-[var(--color-surface-card)]
shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-border)_5%,transparent)]
bg-[var(--color-accent)]
text-[var(--color-text-strong)]
text-[var(--color-text)]
text-[var(--color-accent)]
```

- [ ] **Step 3: Replace helper-returned classes in `src/components/competitions/competitionPresentation.ts`**

Update status helper returns to:

```ts
return 'text-[var(--color-success-bright)]'
return 'text-[var(--color-accent)]'
return 'text-[var(--color-danger)]'
return 'text-[var(--color-text)]'
return 'text-[var(--color-acid)]'
```

Update button helper returns to:

```ts
return 'border-[var(--color-acid)] bg-[var(--color-acid-strong)] text-[var(--color-acid-contrast)] hover:translate-y-[-1px] hover:shadow-[var(--shadow-acid)]'
return 'border-[var(--color-acid)] bg-[var(--color-bg)] text-[var(--color-acid)] hover:bg-[color:color-mix(in_srgb,var(--color-bg)_85%,var(--color-surface))]'
```

- [ ] **Step 4: Tokenize `src/pages/CompetitionsPage.tsx` states**

Replace:
- section title color
- loading cards
- error alert
- empty state
- “show more” CTA

With token-backed classes using `--color-accent`, `--color-surface`, `--color-danger-*`, and `--color-acid-*`.

### Task 5: Convert Competition Details and Placeholder Pages

**Files:**
- Modify: `src/pages/CompetitionDetailsPage.tsx`
- Modify: `src/pages/TrainingPage.tsx`
- Modify: `src/pages/NewsPage.tsx`
- Modify: `src/pages/ProfilePage.tsx`

- [ ] **Step 1: Tokenize detail page surface and text colors**

Use tokens for:
- loading text
- error states
- back link
- outer section border/background
- title strip
- description text
- problem set card
- facts sidebar

- [ ] **Step 2: Tokenize placeholder pages**

Use:

```tsx
<div className="mx-auto max-w-7xl px-6 py-12 text-[var(--color-accent)]">
```

and the same for the `pre` on profile.

### Task 6: Verify Theme Token Migration

**Files:**
- Modify: `src/index.css`
- Modify: all files touched above

- [ ] **Step 1: Run a color-regression search**

Run:

```bash
rg -n "#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6,8})|text-\\[|bg-\\[|border-\\[|shadow-\\[" src
```

Expected:
- only intentional asset files or token definitions remain
- no stray UI hex codes in migrated components

- [ ] **Step 2: Run lint**

Run:

```bash
npm.cmd run lint
```

Expected: exit code 0

- [ ] **Step 3: Run production build**

Run:

```bash
npm.cmd run build
```

Expected: exit code 0

## Self-Review

- Spec coverage:
  - Dark theme tokens as default: covered by Task 1.
  - Light theme tokens added to shared styles: covered by Task 1.
  - Hardcoded colors replaced across current pages/components: covered by Tasks 2-5.
  - No logic change, only styling system change: preserved throughout.
- Placeholder scan:
  - No TODO/TBD placeholders remain.
- Type consistency:
  - All token names are consistent across tasks and use the same `--color-*` scheme.
