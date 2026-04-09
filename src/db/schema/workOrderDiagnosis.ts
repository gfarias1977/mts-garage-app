import { bigint, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { workOrdersTable } from './workOrders';

export const workOrderDiagnosisTable = pgTable('work_order_diagnosis', {
  id: bigint('wod_id', { mode: 'bigint' }).primaryKey().generatedAlwaysAsIdentity(),
  workOrderId: bigint('wod_wor_id', { mode: 'bigint' })
    .notNull()
    .references(() => workOrdersTable.id),
  authorName: varchar('wod_author_name', { length: 100 }).notNull(),
  content: text('wod_content').notNull(),
  createdAt: timestamp('wod_created_at').defaultNow(),
  createdBy: varchar('wod_created_by').notNull(),
});
