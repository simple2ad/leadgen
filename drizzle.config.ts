import type { Config } from 'drizzle-kit';

// Use POSTGRES_URL for Vercel/Neon, fallback to DATABASE_URL for local
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

const config: Config = {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
};

export default config;
