import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export type Client = typeof schema.clients.$inferSelect;
export type NewClient = typeof schema.clients.$inferInsert;
export type Lead = typeof schema.leads.$inferSelect;
export type NewLead = typeof schema.leads.$inferInsert;
