# Keycloak Auth Theme Design

**Date:** 2026-05-17

## Goal

Create a custom Keycloak login theme that visually aligns the authentication and registration screens with the existing site, while keeping the first implementation stage limited to styling the standard Keycloak layouts.

## Selected Approach

We will implement a single custom Keycloak theme for the login flow with two visual modes:

- `dark`: the primary mode, styled to echo the approved terminal / cyberpunk Figma direction
- `light`: a site-aligned light adaptation built from the same tokens, structure, and typography

The first stage will focus on styling, not layout reconstruction. We will keep the standard Keycloak page structure as intact as possible and layer the visual system on top of it using theme assets, CSS, and theme configuration.

## Why This Approach

This approach gives us the best balance between visual quality and maintainability:

- it makes the Keycloak flow feel like part of the same product
- it supports both dark and light modes from the start
- it avoids deep template customization before we have seen the styled result
- it leaves a clean path for a second stage if the default Keycloak layout still feels too far from the Figma design

## Existing Product Context

The current site already has a strong terminal-inspired visual language:

- dark terminal background treatment
- mono typography
- neon green accent palette
- shared color tokens for dark and light modes

The Keycloak theme should inherit that product DNA rather than inventing a separate authentication-only design system.

## Stage 1 Scope

Stage 1 includes styling the standard Keycloak authentication pages:

- login
- register
- forgot password / reset password entry points
- standard message / status / error states used in the login flow

Stage 1 styling work includes:

- background treatment
- typography
- color tokens
- buttons
- text inputs
- checkboxes
- links
- focus states
- invalid and error states
- disabled states
- spacing and surface treatment within the constraints of the default layout

Stage 1 also includes a shared token strategy for both visual modes:

- common semantic variables for text, surface, accent, border, danger, and focus
- a dark token set inspired by the approved Figma mood
- a light token set that preserves the same brand language in a brighter palette

## Out of Scope For Stage 1

The following are explicitly deferred unless the styled first pass proves insufficient:

- major layout rewrites of login or register pages
- full reproduction of the Figma composition
- moving registration consent blocks into a custom second column
- adding field-by-field decorative icon placement that depends on template changes
- introducing custom structural sections not present in the standard Keycloak markup
- deep overrides of `login.ftl` or `register.ftl` beyond what is strictly necessary for theme wiring

## Theme Architecture

The theme should be structured as a standard Keycloak login theme, with the visual layer isolated from authentication logic.

Expected building blocks:

- `theme.properties` for theme configuration
- `resources/css` for shared styling and mode-specific token definitions
- `resources/img` for branded assets and background imagery if needed
- `resources/fonts` if local font delivery is required

The implementation should prefer:

- CSS variables for semantic theming
- minimal coupling to internal Keycloak markup details
- reuse of the site's existing visual language where practical

## Visual Direction

### Dark Mode

Dark mode is the primary visual target for Stage 1. It should reflect the mood of the approved Figma screens:

- near-black background
- terminal-like contrast
- neon green accent
- mono or pixel-adjacent display treatment where appropriate
- subtle atmospheric texture or blur if feasible within the theme

The result does not need to match the Figma layout exactly, but it should clearly evoke the same product personality.

### Light Mode

Light mode should not attempt to imitate the Figma screens literally. Instead, it should be the light counterpart of the same branded system:

- lighter surfaces and background
- moderated green accents
- preserved typography and form geometry
- consistent interaction states with the dark theme

The goal is visual continuity with the main site, not a separate design concept.

## Constraints

The main constraint is that Stage 1 works on top of standard Keycloak page structure.

That means we can get close in visual identity, but not fully reproduce:

- the exact two-column registration composition
- precise checkbox positioning from the mockup
- custom icon placement tied to individual fields
- bespoke decorative structure beyond the standard template

These are valid candidates for a later template override stage if needed.

## Success Criteria

Stage 1 is successful when:

- the login, register, forgot password, and related message pages feel like part of the same product as the main site
- dark mode clearly communicates the terminal / cyberpunk mood from the approved mockups
- light mode preserves the same visual identity in a coherent bright palette
- the core interaction states look intentional and consistent: default, hover, focus, invalid, disabled, and error
- we can review the styled result and make a clean decision about whether a second stage with template overrides is necessary

## Stage 2 Trigger

We should move to a second stage with targeted `FTL` overrides only if, after Stage 1 review, the result still lacks enough similarity to the approved design because of structural limitations rather than color, type, or component styling.
