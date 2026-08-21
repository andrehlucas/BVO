import { defineConfig, globalIgnores } from 'eslint/config'
import nextTs from 'eslint-config-next/typescript'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/commercial/*'],
              message: 'Domain modules must not depend on commercial configuration.',
            },
            {
              group: ['@/analytics/*'],
              message: 'Domain modules must not depend on analytics.',
            },
            {
              group: ['@/components/*'],
              message: 'Domain modules must not depend on UI components.',
            },
          ],
        },
      ],
    },
  },
  globalIgnores(['.next/**', '.worktrees/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
