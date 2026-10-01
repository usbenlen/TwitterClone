import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['./**', '../**'],
          message: 'Use @/ aliases for local imports',
        }],
      }],
      'no-restricted-syntax': ['error', {
        selector: 'ImportExpression[source.value=/^\\.\\.?\\//]',
        message: 'Use @/ aliases for dynamic local imports',
      }, {
        selector: 'CallExpression[callee.object.name=/^(vi|jest)$/][callee.property.name=/^(mock|doMock|unmock|doUnmock|importActual|importMock)$/][arguments.0.value=/^\\.\\.?\\//]',
        message: 'Use @/ aliases for local mock module paths',
      }],
    },
  },
])
