import path from 'node:path'
import { defineWorkersProject, readD1Migrations } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersProject(async () => {
  const migrationsPath = path.join(__dirname, 'drizzle/migrations')
  const migrations = await readD1Migrations(migrationsPath)
  return {
    test: {
      setupFiles: ['./test/apply-migrations.ts'],
      globals: true,
      poolOptions: {
        workers: {
          singleWorker: true,
          isolatedStorage: false,
          miniflare: {
            compatibilityFlags: ['nodejs_compat'],
            compatibilityDate: '2024-04-01',
            d1Databases: ['DB'],
            bindings: { TEST_MIGRATIONS: migrations }
          }
        }
      }
    }
  }
})
