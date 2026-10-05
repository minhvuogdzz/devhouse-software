import { createVitestConfig } from '../../packages/config/vitest/index.js';

// Lets `yarn workspace @devhouse/api test` use the same isolated test database as the root run.
export default createVitestConfig({
  globalSetup: ['./tests/global-setup.js'],
  setupFiles: ['./tests/setup-env.js'],
});
