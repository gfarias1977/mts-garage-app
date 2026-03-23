import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const workOrdersStatusTable = pgTable('work_orders_status', {
  id: varchar('wes_codigo', { length: 10 }).primaryKey(),
  description: varchar('wes_description', { length: 100 }).notNull(),
  createdAt: timestamp('wes_created_at').defaultNow(),
  createdBy: varchar('wes_created_by').notNull(),
  status: varchar('wes_status', { length: 1 }).notNull(),
});
