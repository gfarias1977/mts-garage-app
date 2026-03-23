import { bigint, bigserial, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { workOrdersTable } from './workOrders';

export const workOrderLogsTable = pgTable('work_order_logs', {
  id: bigserial('wol_id', { mode: 'bigint' }).primaryKey(),
  workOrderId: bigint('wol_wor_id', { mode: 'bigint' })
    .notNull()
    .references(() => workOrdersTable.id),
  changedBy: varchar('wol_changed_by', { length: 20 }).notNull(),
  changedById: bigint('wol_changed_by_id', { mode: 'bigint' }),
  field: varchar('wol_field', { length: 100 }),
  oldValue: text('wol_old_value'),
  newValue: text('wol_new_value'),
  createdAt: timestamp('wol_created_at').defaultNow(),
});
