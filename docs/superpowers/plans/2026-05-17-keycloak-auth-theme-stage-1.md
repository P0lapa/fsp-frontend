# Keycloak Auth Theme Stage 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Stage 1 custom Keycloak login theme that makes the auth flow feel like part of the existing product, with dark mode as the default and a light-mode adaptation driven by shared semantic tokens.

**Architecture:** Keep the Keycloak auth flow on standard login templates and implement the branding layer as a standalone theme in the repo under `keycloak/themes/fsp-auth/login`. Reuse the product's existing terminal design language through CSS variables, background assets, and mono typography, while letting light mode switch through `prefers-color-scheme` to avoid template-level mode wiring in Stage 1.

**Tech Stack:** Keycloak login theme assets, FreeMarker theme configuration, CSS custom properties, static assets, Docker for local theme preview, existing React/Vite repo for source design references.

---

## File Structure

Planned implementation units and responsibilities:

- `keycloak/themes/fsp-auth/login/theme.properties`
  - Registers the theme, imports the base Keycloak login theme, and loads the custom styles.
- `keycloak/themes/fsp-auth/login/resources/css/theme.css`
  - Defines semantic tokens, default dark mode, light-mode overrides, backgrounds, forms, buttons, links, focus, and error states.
- `keycloak/themes/fsp-auth/login/resources/img/terminal-auth-bg.png`
  - Background image used by the login theme so the Keycloak UI carries the same atmosphere as the main site.
- `keycloak/README.md`
  - Documents how to preview and activate the theme in a local Keycloak container.
- `docs/superpowers/specs/2026-05-17-keycloak-auth-theme-design.md`
  - Existing design spec used as the source of truth during review.

The plan intentionally avoids `login.ftl` and `register.ftl` in Stage 1. If later review shows layout limitations are the blocker, those files become Stage 2 work.

### Task 1: Scaffold The Keycloak Theme

**Files:**
- Create: `keycloak/themes/fsp-auth/login/theme.properties`
- Create: `keycloak/themes/fsp-auth/login/resources/css/theme.css`
- Create: `keycloak/themes/fsp-auth/login/resources/img/terminal-auth-bg.png`
- Create: `keycloak/README.md`
- Reference: `src/index.css`
- Reference: `src/components/home/TerminalHero.tsx`

- [ ] **Step 1: Write the failing structural check**

Create a shell verification script locally first by checking the theme paths do not exist yet:

```powershell
@(
  'keycloak/themes/fsp-auth/login/theme.properties',
  'keycloak/themes/fsp-auth/login/resources/css/theme.css',
  'keycloak/themes/fsp-auth/login/resources/img/terminal-auth-bg.png',
  'keycloak/README.md'
) | ForEach-Object {
  if (Test-Path $_) {
    throw "Unexpected existing file: $_"
  }
}
```

- [ ] **Step 2: Run the structural check to verify it fails cleanly**

Run:

```powershell
@(
  'keycloak/themes/fsp-auth/login/theme.properties',
  'keycloak/themes/fsp-auth/login/resources/css/theme.css',
  'keycloak/themes/fsp-auth/login/resources/img/terminal-auth-bg.png',
  'keycloak/README.md'
) | ForEach-Object {
  if (Test-Path $_) {
    throw "Unexpected existing file: $_"
  }
}
```

Expected: no output and exit code `0`, confirming the theme scaffold does not already exist and can be created safely.

- [ ] **Step 3: Create the minimal theme scaffold**

Add `keycloak/themes/fsp-auth/login/theme.properties`:

```properties
parent=keycloak
import=common/keycloak
styles=css/theme.css
```

Create `keycloak/themes/fsp-auth/login/resources/css/theme.css` with the smallest valid theme shell:

```css
:root {
  color-scheme: dark;
  --auth-bg: #0a0a0a;
  --auth-surface: rgba(4, 18, 9, 0.88);
  --auth-text: #d3e7e8;
  --auth-text-muted: #9bb5b8;
  --auth-accent: #04ca37;
  --auth-accent-strong: #c0f000;
  --auth-danger: #ff5f56;
  --auth-border: rgba(4, 202, 55, 0.38);
  --auth-focus: rgba(192, 240, 0, 0.42);
}

@media (prefers-color-scheme: light) {
  :root {
    color-scheme: light;
    --auth-bg: #f4efe2;
    --auth-surface: rgba(247, 241, 228, 0.94);
    --auth-text: #2f4332;
    --auth-text-muted: #5a675d;
    --auth-accent: #4f8a3d;
    --auth-accent-strong: #cfe96d;
    --auth-danger: #c2362b;
    --auth-border: rgba(79, 138, 61, 0.24);
    --auth-focus: rgba(207, 233, 109, 0.34);
  }
}
```

Copy the existing terminal background into the theme asset path:

```powershell
New-Item -ItemType Directory -Force 'keycloak/themes/fsp-auth/login/resources/img' | Out-Null
Copy-Item 'src/assets/hero-terminal-bg.png' 'keycloak/themes/fsp-auth/login/resources/img/terminal-auth-bg.png'
```

Create `keycloak/README.md`:

````md
# Keycloak Theme Preview

## Run local Keycloak with the custom theme

```powershell
docker run --rm -p 8080:8080 `
  -e KEYCLOAK_ADMIN=admin `
  -e KEYCLOAK_ADMIN_PASSWORD=admin `
  -v "${PWD}/keycloak/themes:/opt/keycloak/themes" `
  quay.io/keycloak/keycloak:26.2 `
  start-dev
```

## Activate the theme

1. Open `http://localhost:8080`.
2. Sign in to the admin console.
3. Open the target realm.
4. Go to `Realm settings -> Themes`.
5. Set `Login theme` to `fsp-auth`.
6. Save and test the login and register flows.
````

- [ ] **Step 4: Run the structural verification to confirm the scaffold exists**

Run:

```powershell
@(
  'keycloak/themes/fsp-auth/login/theme.properties',
  'keycloak/themes/fsp-auth/login/resources/css/theme.css',
  'keycloak/themes/fsp-auth/login/resources/img/terminal-auth-bg.png',
  'keycloak/README.md'
) | ForEach-Object {
  if (-not (Test-Path $_)) {
    throw "Missing expected file: $_"
  }
}
```

Expected: exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add keycloak/themes/fsp-auth/login/theme.properties keycloak/themes/fsp-auth/login/resources/css/theme.css keycloak/themes/fsp-auth/login/resources/img/terminal-auth-bg.png keycloak/README.md
git commit -m "feat: scaffold keycloak auth theme"
```

### Task 2: Implement Shared Theme Tokens And Base Layout Styling

**Files:**
- Modify: `keycloak/themes/fsp-auth/login/resources/css/theme.css`
- Reference: `src/index.css`
- Reference: `src/components/home/TerminalHero.tsx`

- [ ] **Step 1: Write the failing token coverage check**

Create a content assertion for the semantic tokens and light-mode override:

```powershell
$content = Get-Content 'keycloak/themes/fsp-auth/login/resources/css/theme.css' -Raw

@(
  '--auth-bg',
  '--auth-surface',
  '--auth-text',
  '--auth-accent',
  '--auth-danger',
  '@media (prefers-color-scheme: light)'
) | ForEach-Object {
  if ($content -notmatch [regex]::Escape($_)) {
    throw "Missing token or mode block: $_"
  }
}
```

- [ ] **Step 2: Run the token coverage check to verify the minimal scaffold is incomplete**

Run:

```powershell
$content = Get-Content 'keycloak/themes/fsp-auth/login/resources/css/theme.css' -Raw

@(
  'html, body',
  '.login-pf body',
  '#kc-page-title',
  '#kc-form-wrapper'
) | ForEach-Object {
  if ($content -notmatch [regex]::Escape($_)) {
    throw "Missing Stage 1 selector: $_"
  }
}
```

Expected: FAIL because the minimal scaffold from Task 1 does not yet style the Keycloak layout.

- [ ] **Step 3: Write the minimal layout and token implementation**

Replace `keycloak/themes/fsp-auth/login/resources/css/theme.css` with:

```css
:root {
  color-scheme: dark;
  --auth-bg: #070909;
  --auth-bg-overlay: rgba(3, 12, 7, 0.82);
  --auth-surface: rgba(8, 17, 10, 0.9);
  --auth-surface-soft: rgba(6, 21, 11, 0.72);
  --auth-text: #d5e5ea;
  --auth-text-muted: #9ab4b8;
  --auth-heading: #04ca37;
  --auth-accent: #04ca37;
  --auth-accent-strong: #c0f000;
  --auth-accent-contrast: #111111;
  --auth-border: rgba(4, 202, 55, 0.34);
  --auth-border-strong: rgba(4, 202, 55, 0.62);
  --auth-danger: #ff5f56;
  --auth-focus: 0 0 0 3px rgba(192, 240, 0, 0.2);
  --auth-shadow: 0 24px 80px rgba(0, 0, 0, 0.46);
  --auth-font-body: "IBM Plex Mono", "JetBrains Mono", monospace;
  --auth-font-display: "Press Start 2P", "IBM Plex Mono", monospace;
}

@media (prefers-color-scheme: light) {
  :root {
    color-scheme: light;
    --auth-bg: #f4efe2;
    --auth-bg-overlay: rgba(247, 241, 228, 0.82);
    --auth-surface: rgba(247, 241, 228, 0.95);
    --auth-surface-soft: rgba(255, 255, 255, 0.68);
    --auth-text: #2f4332;
    --auth-text-muted: #667560;
    --auth-heading: #4f8a3d;
    --auth-accent: #4f8a3d;
    --auth-accent-strong: #cfe96d;
    --auth-accent-contrast: #233018;
    --auth-border: rgba(79, 138, 61, 0.24);
    --auth-border-strong: rgba(79, 138, 61, 0.46);
    --auth-danger: #c2362b;
    --auth-focus: 0 0 0 3px rgba(207, 233, 109, 0.32);
    --auth-shadow: 0 24px 64px rgba(93, 91, 80, 0.14);
  }
}

html,
body,
.login-pf body {
  min-height: 100%;
  background:
    linear-gradient(180deg, var(--auth-bg-overlay), var(--auth-bg-overlay)),
    url("../img/terminal-auth-bg.png") center / cover no-repeat,
    var(--auth-bg);
  color: var(--auth-text);
  font-family: var(--auth-font-body);
}

.login-pf-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
}

#kc-header-wrapper,
#kc-page-title {
  font-family: var(--auth-font-display);
  letter-spacing: 0.08em;
}

#kc-page-title {
  color: var(--auth-heading);
  font-size: 30px;
  line-height: 1.45;
  text-transform: uppercase;
}

#kc-form-wrapper,
#kc-content-wrapper {
  background: var(--auth-surface);
  border: 1px solid var(--auth-border);
  box-shadow: var(--auth-shadow);
  backdrop-filter: blur(10px);
}

#kc-form-wrapper {
  padding: 28px 24px;
}

@media (max-width: 640px) {
  #kc-page-title {
    font-size: 22px;
  }

  #kc-form-wrapper {
    padding: 22px 18px;
  }
}
```

- [ ] **Step 4: Run the selector coverage check to verify the layout styling is present**

Run:

```powershell
$content = Get-Content 'keycloak/themes/fsp-auth/login/resources/css/theme.css' -Raw

@(
  'html,',
  '.login-pf body',
  '#kc-page-title',
  '#kc-form-wrapper',
  '@media (prefers-color-scheme: light)'
) | ForEach-Object {
  if ($content -notmatch [regex]::Escape($_)) {
    throw "Missing Stage 1 selector: $_"
  }
}
```

Expected: exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add keycloak/themes/fsp-auth/login/resources/css/theme.css
git commit -m "feat: add keycloak auth theme tokens"
```

### Task 3: Style Form Controls, Buttons, Links, And Interaction States

**Files:**
- Modify: `keycloak/themes/fsp-auth/login/resources/css/theme.css`
- Reference: `docs/superpowers/specs/2026-05-17-keycloak-auth-theme-design.md`

- [ ] **Step 1: Write the failing component selector check**

Run:

```powershell
$content = Get-Content 'keycloak/themes/fsp-auth/login/resources/css/theme.css' -Raw

@(
  '.pf-c-form-control',
  '.pf-c-button.pf-m-primary',
  '.pf-c-button.pf-m-block',
  '.login-pf a',
  ':focus-visible'
) | ForEach-Object {
  if ($content -notmatch [regex]::Escape($_)) {
    throw "Missing component styling selector: $_"
  }
}
```

Expected: FAIL before the control styling is added.

- [ ] **Step 2: Write the minimal control and interaction styling**

Append the following to `keycloak/themes/fsp-auth/login/resources/css/theme.css`:

```css
.login-pf label,
.login-pf .control-label,
.login-pf .kcLabelClass {
  color: var(--auth-text-muted);
  font-size: 0.92rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-pf .pf-c-form-control,
.login-pf input[type="text"],
.login-pf input[type="password"],
.login-pf input[type="email"] {
  min-height: 46px;
  border: 1px solid var(--auth-border);
  border-radius: 0;
  background: var(--auth-surface-soft);
  color: var(--auth-text);
  box-shadow: none;
}

.login-pf .pf-c-form-control::placeholder {
  color: var(--auth-text-muted);
  opacity: 1;
}

.login-pf .pf-c-form-control:hover,
.login-pf input:hover {
  border-color: var(--auth-border-strong);
}

.login-pf .pf-c-form-control:focus,
.login-pf .pf-c-form-control:focus-visible,
.login-pf input:focus,
.login-pf input:focus-visible,
.login-pf a:focus-visible,
.login-pf button:focus-visible {
  outline: none;
  box-shadow: var(--auth-focus);
  border-color: var(--auth-accent-strong);
}

.login-pf .pf-c-button.pf-m-primary,
.login-pf .pf-c-button.pf-m-block,
.login-pf input[type="submit"] {
  min-height: 52px;
  border: 1px solid var(--auth-accent-strong);
  border-radius: 0;
  background: var(--auth-accent-strong);
  color: var(--auth-accent-contrast);
  font-family: var(--auth-font-body);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
}

.login-pf .pf-c-button.pf-m-primary:hover,
.login-pf .pf-c-button.pf-m-block:hover,
.login-pf input[type="submit"]:hover {
  transform: translateY(-1px);
  filter: brightness(1.02);
  box-shadow: 0 0 24px rgba(192, 240, 0, 0.24);
}

.login-pf .pf-c-button.pf-m-primary:disabled,
.login-pf .pf-c-button.pf-m-block:disabled,
.login-pf input[type="submit"]:disabled {
  opacity: 0.56;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-pf a {
  color: var(--auth-text);
  text-decoration-color: var(--auth-accent);
  text-underline-offset: 0.18em;
}

.login-pf a:hover {
  color: var(--auth-accent-strong);
}
```

- [ ] **Step 3: Run the component selector check to verify the styling exists**

Run:

```powershell
$content = Get-Content 'keycloak/themes/fsp-auth/login/resources/css/theme.css' -Raw

@(
  '.pf-c-form-control',
  '.pf-c-button.pf-m-primary',
  '.pf-c-button.pf-m-block',
  '.login-pf a',
  ':focus-visible'
) | ForEach-Object {
  if ($content -notmatch [regex]::Escape($_)) {
    throw "Missing component styling selector: $_"
  }
}
```

Expected: exit code `0`.

- [ ] **Step 4: Preview the login page in Keycloak**

Run:

```powershell
docker run --rm -p 8080:8080 `
  -e KEYCLOAK_ADMIN=admin `
  -e KEYCLOAK_ADMIN_PASSWORD=admin `
  -v "${PWD}/keycloak/themes:/opt/keycloak/themes" `
  quay.io/keycloak/keycloak:26.2 `
  start-dev
```

Expected: Keycloak starts on `http://localhost:8080` and the `fsp-auth` login theme becomes selectable in the realm admin.

- [ ] **Step 5: Commit**

```bash
git add keycloak/themes/fsp-auth/login/resources/css/theme.css
git commit -m "feat: style keycloak auth controls"
```

### Task 4: Style Validation, Checkboxes, Helper Text, And Page Variants

**Files:**
- Modify: `keycloak/themes/fsp-auth/login/resources/css/theme.css`
- Reference: `docs/superpowers/specs/2026-05-17-keycloak-auth-theme-design.md`

- [ ] **Step 1: Write the failing state coverage check**

Run:

```powershell
$content = Get-Content 'keycloak/themes/fsp-auth/login/resources/css/theme.css' -Raw

@(
  '.pf-c-alert',
  '.kc-feedback-text',
  'input[type="checkbox"]',
  ':invalid',
  '.pf-m-error'
) | ForEach-Object {
  if ($content -notmatch [regex]::Escape($_)) {
    throw "Missing state selector: $_"
  }
}
```

Expected: FAIL before state-specific styling is added.

- [ ] **Step 2: Write the minimal validation and variant styling**

Append the following to `keycloak/themes/fsp-auth/login/resources/css/theme.css`:

```css
.login-pf .pf-c-alert,
.login-pf .alert,
.login-pf .pf-c-form__helper-text,
.login-pf .kc-feedback-text {
  border-radius: 0;
  background: transparent;
  color: var(--auth-text-muted);
}

.login-pf .pf-c-alert.pf-m-danger,
.login-pf .pf-c-form-control.pf-m-error,
.login-pf .pf-m-error,
.login-pf .kc-feedback-text {
  color: var(--auth-danger);
  border-color: rgba(255, 95, 86, 0.45);
}

.login-pf .pf-c-form-control:invalid,
.login-pf input:invalid {
  border-color: rgba(255, 95, 86, 0.55);
  box-shadow: 0 0 0 1px rgba(255, 95, 86, 0.12);
}

.login-pf input[type="checkbox"] {
  inline-size: 18px;
  block-size: 18px;
  accent-color: var(--auth-accent);
}

.login-pf .checkbox,
.login-pf .pf-c-check {
  color: var(--auth-text);
}

.login-pf .instruction,
.login-pf .kcFormOptionsWrapperClass,
.login-pf .kcFormSettingClass {
  color: var(--auth-text-muted);
}

.login-pf .login-pf-signup,
.login-pf #kc-info-wrapper,
.login-pf #kc-form-options {
  border-top: 1px solid var(--auth-border);
  margin-top: 20px;
  padding-top: 18px;
}
```

- [ ] **Step 3: Run the state coverage check to verify the selectors exist**

Run:

```powershell
$content = Get-Content 'keycloak/themes/fsp-auth/login/resources/css/theme.css' -Raw

@(
  '.pf-c-alert',
  '.kc-feedback-text',
  'input[type="checkbox"]',
  ':invalid',
  '.pf-m-error'
) | ForEach-Object {
  if ($content -notmatch [regex]::Escape($_)) {
    throw "Missing state selector: $_"
  }
}
```

Expected: exit code `0`.

- [ ] **Step 4: Manually verify the primary page variants**

Manual checklist in the Keycloak preview realm:

```text
1. Open login page and confirm default, hover, and focus states.
2. Open register page and confirm checkbox styling and helper copy readability.
3. Trigger an invalid login and confirm the error state is readable in both dark and light modes.
4. Open forgot-password and confirm links and input styling are consistent.
5. Open a message/status page and confirm the surface, typography, and spacing still match the theme.
```

Expected: every page variant still feels visually related and no PatternFly defaults dominate the page.

- [ ] **Step 5: Commit**

```bash
git add keycloak/themes/fsp-auth/login/resources/css/theme.css
git commit -m "feat: style keycloak auth states"
```

### Task 5: Verify Repo Safety, Document Limitations, And Prepare Review Handoff

**Files:**
- Modify: `keycloak/README.md`
- Modify: `docs/superpowers/specs/2026-05-17-keycloak-auth-theme-design.md` only if the implementation reveals a spec mismatch

- [ ] **Step 1: Write the failing documentation coverage check**

Run:

```powershell
$content = Get-Content 'keycloak/README.md' -Raw

@(
  'Login theme',
  'fsp-auth',
  'localhost:8080',
  'Stage 1',
  'template overrides'
) | ForEach-Object {
  if ($content -notmatch [regex]::Escape($_)) {
    throw "Missing documentation phrase: $_"
  }
}
```

Expected: FAIL until the Stage 1 limitations are documented explicitly.

- [ ] **Step 2: Expand the preview documentation with limitations and review checklist**

Update `keycloak/README.md` to:

````md
# Keycloak Theme Preview

## Run local Keycloak with the custom theme

```powershell
docker run --rm -p 8080:8080 `
  -e KEYCLOAK_ADMIN=admin `
  -e KEYCLOAK_ADMIN_PASSWORD=admin `
  -v "${PWD}/keycloak/themes:/opt/keycloak/themes" `
  quay.io/keycloak/keycloak:26.2 `
  start-dev
```

## Activate the theme

1. Open `http://localhost:8080`.
2. Sign in to the admin console.
3. Open the target realm.
4. Go to `Realm settings -> Themes`.
5. Set `Login theme` to `fsp-auth`.
6. Save and test the login and register flows.

## Stage 1 limitations

Stage 1 styles the standard Keycloak layout only. It does not include custom template overrides, custom field icons, or a full recreation of the Figma register composition.

## Review checklist

1. Verify dark mode matches the terminal mood.
2. Verify light mode still feels like the same product.
3. Verify login, register, forgot password, and error states are visually consistent.
4. Decide whether any remaining mismatch is caused by layout structure rather than styling.
````

- [ ] **Step 3: Run repository verification commands**

Run:

```powershell
npm run lint
npm run build
```

Expected: both commands succeed. The Keycloak theme files should not break the frontend toolchain.

- [ ] **Step 4: Run the documentation coverage check and inspect git diff**

Run:

```powershell
$content = Get-Content 'keycloak/README.md' -Raw

@(
  'Login theme',
  'fsp-auth',
  'localhost:8080',
  'Stage 1',
  'template overrides'
) | ForEach-Object {
  if ($content -notmatch [regex]::Escape($_)) {
    throw "Missing documentation phrase: $_"
  }
}

git diff -- keycloak/README.md keycloak/themes/fsp-auth/login/theme.properties keycloak/themes/fsp-auth/login/resources/css/theme.css
```

Expected: documentation coverage passes and the diff is limited to the theme scaffold, theme CSS, asset, and preview docs.

- [ ] **Step 5: Commit**

```bash
git add keycloak/README.md keycloak/themes/fsp-auth/login/theme.properties keycloak/themes/fsp-auth/login/resources/css/theme.css
git commit -m "docs: finalize keycloak auth theme stage 1 review"
```
