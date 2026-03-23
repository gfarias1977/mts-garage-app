import { bigint, bigserial, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { serviceCategoriesTable } from './serviceCategories';

export const servicesTable = pgTable('services', {
  id: bigserial('srv_id', { mode: 'bigint' }).primaryKey(),
  userId: bigint('srv_user_id', { mode: 'bigint' }).notNull(),
  categoryId: bigint('srv_sct_id', { mode: 'bigint' })
    .notNull()
    .references(() => serviceCategoriesTable.id),
  name: varchar('srv_name', { length: 100 }).notNull(),
  description: text('srv_description'),
  createdAt: timestamp('srv_created_at').defaultNow(),
  createdBy: varchar('srv_created_by').notNull(),
  status: varchar('srv_status', { length: 1 }).notNull(),

});
