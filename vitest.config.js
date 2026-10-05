import { createVitestConfig } from './packages/config/vitest/index.js';

export default createVitestConfig({
  globalSetup: ['./apps/api/tests/global-setup.js'],
  setupFiles: ['./apps/api/tests/setup-env.js'],
});
