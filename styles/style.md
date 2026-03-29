# Futuristic Elite Workspace Theme

This document defines the core styling, design tokens, and CSS components extracted from the application. The project is styled using **Tailwind CSS v4** combined with custom CSS classes for advanced effects. It features a complete Dark Mode (default green accent) and Light Mode (purple accent) system with immersive backgrounds, glassmorphism panels, and dynamic animations.

## 🎨 Color Palette & Variables
The color palette represents a "Futuristic Elite Workspace" theme, switching accent colors between Dark and Light mode.

### Dark Mode (Default)
Emphasis is on deep blacks and a bright neon emerald green accent.
* **Primary:** `#00cc66` (Neon Green)
* **Void Background:** `#050505`
* **Surface Background:** `#0a0a0a`
* **Obsidian Base:** `#0c0c0d`

### Light Mode (`data-theme="light"`)
Light mode transforms the entire aesthetic, using purple as the primary accent while replacing dark voids with crisp whites.
* **Primary Accent:** `#8b5cf6` (Vibrant Purple)
* **Void Base:** `#FBFBFB`
* **Text Base:** `#111111`

## 🔤 Typography & Fonts
The design incorporates four distinctive font families to delineate UI hierarchies.
1. **Display:** `"Syne", sans-serif` — Used for massive, high-impact headings.
2. **Tech Titles:** `"Space Grotesk", sans-serif` — Technical, structured headers.
3. **Body Copy:** `"Inter", sans-serif` — Clean, legible UI text and content.
4. **Code & Monospace:** `"JetBrains Mono", monospace` — Code snippets and technical data block text.

## 🌌 Immersive Backgrounds
The theme relies on complex CSS backgrounds rather than solid colors to create depth.
* **Grid Pattern (`.bg-grid-pattern`):** Creates a subtle 40px block grid. Dark mode uses `1a1a1a` lines, while Light mode uses light gray `#e5e7eb` gridlines.
* **Grid Vignette (`.bg-grid-fixed`):** Applies a radial fading mask so grids fade seamlessly into the background void.
* **Scanlines (`.bg-scanline`):** Recreates horizontal CRT monitor-style translucent bar scanlines.

## ✨ Core Component Utilities

### Glassmorphism Panels
* **`.glass-panel`:** `rgba(20, 20, 20, 0.4)` background with a 12px blur filter and a 5% translucent white border.
* **`.glass-panel-light` (Light Mode Variant):** Translates into an opaque white background (`rgba(255, 255, 255, 0.7)`) with matching 12px blur and soft shadow.

### Tool Cards (`.tool-card`)
Interactive surface panels with customized states.
* Built-in transition effects hovering over borders.
* Features `.tool-card-underline`, which creates a glowing primary colored border bar expanding from left to right on full card hover via `scale-x-0` to `scale-x-100`.

### Laser Divider (`.laser-line`)
A 1px high divider used in place of standard borders.
* Features a left-to-right transparent-to-primary-to-transparent linear gradient.
* Emits a shadow matching the primary color to act as a glowing LED strip partition.

### Custom Scrollbars (`.custom-scroll`)
Slimming down the default scrollbars via webkit to minimalist 4-6px widths with rounded tracks to blend in seamlessly.

## 🎬 Animations & Transitions
CSS animations utilized for engaging micro-interactions:
* **`animate-slide-up`:** A highly fluid 0.6s cubic bezier slide-up fade-in mechanism. Supported by `stagger-1` through `stagger-8` utility classes to cascade entrance animations.
* **`animate-glow-pulse`:** Evolving box shadow glow effect over 3 seconds meant for intense highlighted elements.
* **`pulse-emerald`:** Heartbeat scale + fading external ring shadow looping every 2 seconds.

## ⚙️ How to Re-use This Style
1. Include the copied `globals.css` into your new project.
2. Ensure you have the Google WebFonts correctly loaded in your root application structure (`Inter`, `Syne`, `Space Grotesk`, `JetBrains Mono`). You can find this configuration typically within Next.js `layout.tsx` or using `@import url()` inside `globals.css`.
3. Pair this stylesheet with Tailwind CSS v4 and inject custom classes like `bg-grid-pattern` coupled with `absolute inset-0 z-[-1]` layout styling to immediately recreate the environments.
4. Manage Light Mode toggles globally on the `<body>` or `<html>` tag using `data-theme="light"` for an instant palette swap globally!
