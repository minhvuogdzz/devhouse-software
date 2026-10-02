import { defineConfig } from 'vitest/config';

export const createVitestConfig = (options = {}) =>
  defineConfig({
    test: {
      globals: true,
      environment: 'node',
      testTimeout: 20000,
      fileParallelism: false,
      ...options,
    },
  });

export default createVitestConfig();
