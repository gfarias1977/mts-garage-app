import { bigint, bigserial, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { workOrdersTable } from './workOrders';

export const workOrderObservationsTable = pgTable('work_order_observations', {
  id: bigserial('woo_id', { mode: 'bigint' }).primaryKey(),
  workOrderId: bigint('woo_wor_id', { mode: 'bigint' })
    .notNull()
    .references(() => workOrdersTable.id),
  authorName: varchar('woo_author_name', { length: 100 }).notNull(),
  content: text('woo_content').notNull(),
  createdAt: timestamp('woo_created_at').defaultNow(),
  createdBy: varchar('woo_created_by').notNull(),
});
