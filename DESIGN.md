---
name: DeepFlow - Abyssal Protocol
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#bac9cd'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#859397'
  outline-variant: '#3b494c'
  surface-tint: '#00daf8'
  primary: '#baf2ff'
  on-primary: '#00363f'
  primary-container: '#00e0ff'
  on-primary-container: '#005f6d'
  inverse-primary: '#006877'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#e0e9ff'
  on-tertiary: '#233148'
  tertiary-container: '#bfcdeb'
  on-tertiary-container: '#495770'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#a5eeff'
  primary-fixed-dim: '#00daf8'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#d6e3ff'
  tertiary-fixed-dim: '#b9c7e4'
  on-tertiary-fixed: '#0d1c32'
  on-tertiary-fixed-variant: '#39475f'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system embodies the "Abyssal Protocol" narrative—a fusion of deep-sea exploration and cryptographic precision. It targets developers and high-stakes traders who value speed, technical depth, and a high-contrast, professional interface. 

The visual style is a hybrid of **Minimalism** and **Glassmorphism**, set against a **Deep-Sea Cryptography** backdrop. This involves ultra-clean, functional layouts paired with atmospheric depth created through layered gradients and luminous "electric" accents. The emotional response is one of calm authority, immense power, and technical sophistication.

Key visual pillars:
- **Atmospheric Depth:** Multi-tonal dark environments that feel infinite rather than flat.
- **Luminous Precision:** High-contrast data points and interactive elements that "glow" with purpose.
- **Structural Clarity:** Rigid grid alignment and sharp details inspired by financial terminals.

## Colors

The palette transitions from the abyss to the surface. The background is never flat; it utilizes a deep navy-to-black gradient to create a sense of immersion.

- **Primary (Electric Cyan):** Used for primary actions, success states, and critical data visualizations. It serves as the "bioluminescent" guide in the dark UI.
- **Secondary (Pure White):** Reserved for primary headings and high-contrast text to ensure maximum readability against the dark backgrounds.
- **Neutral (Slate/Off-White):** Used for secondary text, labels, and borders to provide a sophisticated hierarchy without competing with primary headings.
- **Accents:** Subtle cyan glows are applied to active states and icons to simulate the appearance of light refracting through water.

## Typography

This design system utilizes a clean, professional type scale that favors legibility and a "system-ready" aesthetic.

- **Headlines:** Uses Geist for a modern, geometric look. Large headlines should use tighter tracking to feel like a cohesive block of information.
- **Body:** Geist is used for its exceptional readability in dark mode, maintaining enough "air" between characters to prevent smearing on OLED screens.
- **Data & Labels:** JetBrains Mono is introduced for technical values, addresses, and code snippets, reinforcing the cryptographic nature of the product. 
- **Hierarchy:** High contrast in weight (Bold for headers vs. Regular for body) is essential to guide the eye through dense information environments.

## Layout & Spacing

The layout philosophy follows a **12-column Fluid Grid** with fixed maximum widths for desktop to maintain a professional, dashboard-like feel. 

- **Density:** The system uses a 8px baseline grid. For data-heavy views, use "Compact" spacing (8px/16px), and for landing pages or high-level dashboards, use "Spacious" spacing (32px/64px).
- **Responsive Behavior:** 
  - **Desktop:** 12 columns, 24px gutters, 40px margins.
  - **Tablet:** 8 columns, 16px gutters, 24px margins.
  - **Mobile:** 4 columns, 16px gutters, 16px margins.
- **Alignment:** All elements must snap to the grid. Inset padding within cards should be consistent with the global margin scale (e.g., if global margin is 24px, card padding should be 24px).

## Elevation & Depth

Hierarchy is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional drop shadows.

- **Level 0 (Surface):** The deep navy-to-black gradient background.
- **Level 1 (Card/Container):** Semi-transparent surfaces (`rgba(255, 255, 255, 0.03)`) with a subtle 1px border (`rgba(255, 255, 255, 0.1)`). This creates a "glass" effect that reveals the gradient beneath.
- **Level 2 (Active/Hover):** Background blur (12px - 20px) and a primary color glow effect.
- **Outlines:** Use "Ghost Borders"—low-opacity white or cyan outlines that define shape without adding visual weight. This maintains the high-contrast professional look of financial software.

## Shapes

The shape language is "Soft" yet disciplined. While the interface feels precise and technical, slight rounding prevents it from feeling overly aggressive or dated.

- **Standard Elements:** 0.25rem (4px) corner radius for buttons, input fields, and small tags.
- **Containers:** 0.5rem (8px) for cards and main UI panels.
- **Icons:** Use linear, 2px stroke icons with sharp or minimally rounded terminals to match the typography.

## Components

- **Buttons:**
  - **Primary:** Solid Electric Cyan background with black or deep navy text. No shadows, but a 10px outer cyan glow on hover.
  - **Secondary:** Transparent background with a 1px White border and White text.
- **Input Fields:** Dark, recessed backgrounds (`#020617`) with 1px borders that transition from Slate to Cyan when focused. Use JetBrains Mono for entered text.
- **Chips/Badges:** Small, all-caps labels with high-contrast backgrounds. Use cyan for "Live" or "Success" and deep slate for "Inactive."
- **Cards:** Utilize the glassmorphic style described in Elevation. Header areas within cards should have a subtle horizontal separator.
- **Progress Indicators:** Use thin, 2px glowing cyan lines. Avoid heavy, thick loading bars.
- **Data Tables:** High-density, no vertical borders, only subtle horizontal separators. Header row should use `label-caps` typography.