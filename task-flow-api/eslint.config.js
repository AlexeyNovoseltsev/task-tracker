import globals from "globals";
import tseslint from "typescript-eslint";
import pluginPromise from "eslint-plugin-promise";
import pluginImport from "eslint-plugin-import";
import js from "@eslint/js";

export default tseslint.config(
  {
    // Global ignores
    ignores: ["dist/", "node_modules/", "logs/"],
  },
  // Base config for all files
  js.configs.recommended,
  {
    plugins: {
      promise: pluginPromise,
    },
    rules: {
      ...pluginPromise.configs.recommended.rules,
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    }
  },
  {
    // Config for TypeScript files
    files: ["src/**/*.ts"],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: pluginImport,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      }
    },
    rules: {
      ...tseslint.configs.recommendedTypeChecked.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    }
  },
  {
    // Config for JS files
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      }
    },
    rules: {
      'no-unused-vars': 'off' // Turn off for JS config files
    }
  }
);
