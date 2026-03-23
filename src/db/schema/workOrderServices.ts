import { bigint, bigserial, numeric, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { servicesTable } from './services';
import { workOrdersTable } from './workOrders';

export const workOrderServicesTable = pgTable('work_order_services', {
  id: bigserial('wos_id', { mode: 'bigint' }).primaryKey(),
  workOrderId: bigint('wos_wor_id', { mode: 'bigint' })
    .notNull()
    .references(() => workOrdersTable.id),
  serviceId: bigint('wos_srv_id', { mode: 'bigint' })
    .notNull()
    .references(() => servicesTable.id),
  note: text('wos_note').notNull(),
  estimatedHourlyRate: numeric('wos_estimated_hourly_rate', { precision: 10, scale: 2 }),
  estimatedPriceRate: numeric('wos_estimated_price_rate', { precision: 10, scale: 2 }),
  actualHourlyRate: numeric('wos_actual_hourly_rate', { precision: 10, scale: 2 }),
  actualPriceRate: numeric('wos_actual_price_rate', { precision: 10, scale: 2 }),
  discount: numeric('wos_discount', { precision: 10, scale: 2 }),
  createdAt: timestamp('wos_created_at').defaultNow(),
  createdBy: varchar('wos_created_by').notNull(),
  status: varchar('wos_status', { length: 1 }).notNull(),
});
