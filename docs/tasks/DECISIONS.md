# Architecture and Implementation Decisions

This log records simple, consistent decisions made where documents were unspecified or environment-specific choices were needed.

- 2026-10-02: Local MongoDB community service on port 27017 used for local dev while root compose.yml provides the containerized definition for container environments.
- 2026-10-02: Yarn 4 with nodeLinker: node-modules configured for root workspace and subprojects.
- 2026-10-02: Brand blue provisional OKLCH selected as `oklch(52% 0.22 258)` for light theme and `oklch(68% 0.20 255)` for dark theme meeting WCAG AA contrast standards.
- 2026-10-02: React Router v7 used in framework mode (SSR) for `apps/web` and Vite SPA data router mode for `apps/admin`.
- 2026-10-02: Semantic alpha overlays (`bg-fg/50 backdrop-blur-xs`) used for modals and drawers to ensure strict compliance with `theme/no-raw-palette`.
