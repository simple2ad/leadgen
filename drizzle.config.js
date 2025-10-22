/** @type { import('drizzle-kit').Config } */
const config = {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  },
};

if (!config.dbCredentials.url) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

module.exports = config;
