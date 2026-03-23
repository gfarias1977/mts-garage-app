import { bigint, bigserial, numeric, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { workOrderServicesTable } from './workOrderServices';
import { workOrdersTable } from './workOrders';

export const sparePartsTable = pgTable('work_order_service_spare_parts', {
  id: bigserial('spr_id', { mode: 'bigint' }).primaryKey(),
  workOrderId: bigint('spr_wor_id', { mode: 'bigint' })
      .notNull()
      .references(() => workOrdersTable.id),
  serviceId: bigint('spr_srv_id', { mode: 'bigint' })
    .notNull()
    .references(() => workOrderServicesTable.id),
  description: varchar('spr_description', { length: 255 }).notNull(),
  cost: numeric('spr_cost', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('spr_created_at').defaultNow(),
  createdBy: varchar('spr_created_by').notNull(),
  status: varchar('spr_status', { length: 1 }).notNull(),
});
