import { pgTable, uuid, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  whopUserId: text('whop_user_id').unique().notNull(),
  email: text('email'),
  username: varchar('username', { length: 50 }).unique().notNull(),
  webhookUrl: text('webhook_url'),
  captureName: boolean('capture_name').default(false),
  capturePhone: boolean('capture_phone').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  clientId: uuid('client_id').references(() => clients.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
