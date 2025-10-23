import { pgTable, uuid, text, timestamp, varchar, boolean, json } from 'drizzle-orm/pg-core';

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

export const capturePages = pgTable('capture_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  headline: text('headline').notNull(),
  subheadline: text('subheadline'),
  backgroundType: text('background_type').default('gradient'), // gradient, solid, image
  backgroundColor: text('background_color').default('#ffffff'),
  backgroundGradient: text('background_gradient').default('linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
  backgroundImage: text('background_image'),
  textColor: text('text_color').default('#333333'),
  buttonColor: text('button_color').default('#3b82f6'),
  buttonTextColor: text('button_text_color').default('#ffffff'),
  fontFamily: text('font_family').default('Inter'),
  thumbnail: text('thumbnail'), // Base64 encoded screenshot
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
