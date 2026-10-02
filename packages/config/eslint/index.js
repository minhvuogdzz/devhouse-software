import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';

export const noRawPalettePlugin = {
  rules: {
    'no-raw-palette': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce semantic theme tokens instead of raw Tailwind palette utilities',
        },
      },
      create(context) {
        // Matches e.g. bg-white, text-black, bg-blue-500, text-gray-900, border-red-200
        const rawColorPattern =
          /\b(bg|text|border|ring|stroke|fill)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(-\d+)?(\/\d+)?\b/;

        function check(node, text) {
          if (typeof text !== 'string') return;
          const match = text.match(rawColorPattern);
          if (match) {
            context.report({
              node,
              message: `Forbidden raw color utility "${match[0]}". Use semantic tokens (bg-surface, text-fg, bg-primary, text-muted, etc.) from the theme.`,
            });
          }
        }

        return {
          Literal(node) {
            if (typeof node.value === 'string') {
              check(node, node.value);
            }
          },
          TemplateElement(node) {
            if (node.value?.raw) {
              check(node, node.value.raw);
            }
          },
        };
      },
    },
  },
};

export const createEslintConfig = () => [
  js.configs.recommended,
  {
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^(_|React)' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'react/jsx-uses-vars': 'error',
    },
  },
  // Feature code in apps/web and apps/admin: disallow raw palette colors
  {
    files: ['apps/web/app/**/*.{js,jsx}', 'apps/admin/src/**/*.{js,jsx}'],
    plugins: {
      theme: noRawPalettePlugin,
    },
    rules: {
      'theme/no-raw-palette': 'error',
    },
  },
  // Packages boundary: packages cannot import from apps
  {
    files: ['packages/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/apps/**', '@devhouse/web', '@devhouse/admin', '@devhouse/api'],
              message: 'Packages cannot import from applications.',
            },
          ],
        },
      ],
    },
  },
  // Isomorphic packages boundary: packages/shared and packages/content cannot import node built-ins or mongoose
  {
    files: ['packages/shared/**/*.{js,jsx}', 'packages/content/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'fs', message: 'Isomorphic packages cannot import fs.' },
            { name: 'node:fs', message: 'Isomorphic packages cannot import node:fs.' },
            { name: 'path', message: 'Isomorphic packages cannot import path.' },
            { name: 'node:path', message: 'Isomorphic packages cannot import node:path.' },
            { name: 'mongoose', message: 'Isomorphic packages cannot import mongoose.' },
          ],
          patterns: [
            {
              group: ['**/apps/**'],
              message: 'Packages cannot import from applications.',
            },
          ],
        },
      ],
    },
  },
  // Ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.react-router/**',
      '**/.yarn/**',
      '**/coverage/**',
      '**/.hallmark/**',
      'legacy/**',
    ],
  },
];
