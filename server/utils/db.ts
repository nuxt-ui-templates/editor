import { drizzle } from 'drizzle-orm/d1'

export type D1Database = ReturnType<typeof drizzle>

/**
 * Get the Drizzle ORM instance for D1 database
 * Called in Cloudflare Workers/Pages environment
 */
export function getDb(env: { DB: D1Database }): D1Database {
  return drizzle(env.DB)
}

/**
 * For local development with D1
 * This will use Wrangler's local D1 instance
 */
export async function getLocalDb() {
  const response = await fetch('http://localhost:8787/db')
  if (!response.ok) {
    throw new Error('Could not connect to local D1 database')
  }
  const { db } = await response.json()
  return drizzle(db)
}
