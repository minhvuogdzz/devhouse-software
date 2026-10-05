import { defineConfig } from 'vitest/config';

export const createVitestConfig = (options = {}) =>
  defineConfig({
    test: {
      globals: true,
      environment: 'node',
      testTimeout: 20000,
      fileParallelism: false,
      exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', 'legacy/**', 'mvd-ecosystem/**'],
      ...options,
    },
  });

export default createVitestConfig();
