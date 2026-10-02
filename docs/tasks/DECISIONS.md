# Architecture and Implementation Decisions

This log records simple, consistent decisions made where documents were unspecified or environment-specific choices were needed.

- 2026-10-02: Local MongoDB community service on port 27017 used for local dev while root compose.yml provides the containerized definition for container environments.
- 2026-10-02: Yarn 4 with nodeLinker: node-modules configured for root workspace and subprojects.
