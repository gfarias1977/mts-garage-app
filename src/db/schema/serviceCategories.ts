import { bigint, bigserial, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const serviceCategoriesTable = pgTable('service_categories', {
  id: bigserial('sct_id', { mode: 'bigint' }).primaryKey(),
  userId: bigint('sct_user_id', { mode: 'bigint' }),
  name: varchar('sct_name', { length: 100 }).notNull(),
  createdAt: timestamp('sct_created_at').defaultNow(),
  createdBy: varchar('sct_created_by').notNull(),
  status: varchar('sct_status', { length: 1 }).notNull(),
});
