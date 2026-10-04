# Design System — MVD Tech & Design

A locked design system for the official MVD Tech & Design multi-page application.
Every page in the website conforms to this design specification to guarantee cohesion,
technical authority, and high brand prestige (inspired by Blackmagic Design, JetBrains, Linear, Zed).

## 1. Genre & Brand Identity
- **Genre**: Technical Modern-Minimal / Editorial Engineering
- **Brand Identity**: Professional, local-first studio software company for photographers, studios, and post-production houses.
- **Tone**: Authoritative, restrained, mathematically precise, local-first, performance-obsessed.
- **Strictly Avoid**: Generic AI SaaS templates, oversized screaming banners, cheesy pastel gradients, generic testimonials, and fake marketing metrics.

## 2. Color System (OKLCH & Dark Titanium)
- `--color-paper`:     `#07090E` (Deep obsidian / dark graphite canvas)
- `--color-paper-2`:   `#0A0E17` (Elevated component surface)
- `--color-paper-3`:   `#101522` (Interactive card & panel background)
- `--color-ink`:       `#F8FAFC` (Primary high-contrast white text)
- `--color-ink-2`:     `#94A3B8` (Secondary technical slate text)
- `--color-ink-muted`: `#64748B` (Tertiary captions, timestamps, shortcuts)
- `--color-rule`:      `rgba(255, 255, 255, 0.08)` (1px crisp boundary lines)
- `--color-rule-subtle`: `rgba(255, 255, 255, 0.04)`
- `--color-accent`:    `#2563EB` (Electric Royal Blue)
- `--color-accent-hover`: `#3B82F6` (Hover state)
- `--color-accent-subtle`: `rgba(37, 99, 235, 0.12)` (Badge & chip backgrounds)
- `--color-success`:   `#10B981` (Verification checkmarks & 100% matched indicator)
- `--color-focus`:     `#60A5FA` (Keyboard focus ring)

## 3. Typography
- **Display & Headings**: Inter / -apple-system / BlinkMacSystemFont, tracking -0.025em, font-weight 700/800, upright (NO italic headings).
- **Body Text**: Inter / SF Pro Text / Segoe UI, tracking -0.01em, font-weight 400/500, line-height 1.6. Max measure 65ch.
- **Technical & Metrics**: `JetBrains Mono`, `SF Mono`, `ui-monospace`, font-weight 500/700 for all EXIF, keyboard shortcuts, benchmarks, and filenames.

## 4. Navigation & Layout Hierarchy
- **Header**: Persistent high-credibility navigation with squircle product badge, release telemetry pill (`v2.6.6 · Build 2026.10`), direct sub-navigation to all dedicated pages, and 1-click Download action.
- **Multi-Page Architecture**:
  1. `/` (Trang Chủ - Overview): Vision, flagship workbench, high-level suite overview, security philosophy.
  2. `/apps/photo-picker` (Photo Picker Pro): The Cull Engine, 60 FPS LibRaw GPU pipeline, 100% Eye-AF loupe, keyboard shortcuts.
  3. `/apps/contact-the-sheet` (Contact The Sheet): The Automation Engine, Google Drive/Sheets regex extraction, fuzzy filename matching.
  4. `/apps/photo-counter` (Photo Counter): The Audit Engine, deep recursive scanner, contract deliverable verification.
  5. `/benchmark` (Hiệu Năng & Kiến Trúc): Cold hard benchmark tables vs Lightroom Classic, Rust/Tauri architecture, air-gapped local-first privacy.
  6. `/download` (Trung Tâm Tải Về): macOS Apple Silicon, Intel, Windows 64-bit binaries, direct GitHub Releases API sync, Gatekeeper command guide.
  7. `/pricing` (Bảng Giá & Bản Quyền): Transparent tiers, ROI analysis, VietQR authentic payment modal, 0h00 VN session sync policy.
  8. `/support` (Hỗ Trợ & Hướng Dẫn): FAQ, installation troubleshooting, remote Zalo/UltraViewer support.
- **Footer**: High-density engineering footer with repository links, company details, author signature, and direct technical support.

## 5. Microinteraction & Component Rules
- 1px crisp borders (`border-white/[0.08]`).
- All interactive controls have distinct states: default, hover, focus-visible, active.
- Keyboard shortcuts prominently indicated (`[Z]`, `[1..5]`, `[Space]`).
- Copy buttons have instant visual feedback (`Copied!` tooltip / checkmark).
