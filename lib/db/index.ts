import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use POSTGRES_URL for Vercel Postgres, fallback to DATABASE_URL for local development
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

export const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

export type Client = typeof schema.clients.$inferSelect;
export type NewClient = typeof schema.clients.$inferInsert;
export type Lead = typeof schema.leads.$inferSelect;
export type NewLead = typeof schema.leads.$inferInsert;
