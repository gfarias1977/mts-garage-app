import { bigint, bigserial, boolean, numeric, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { servicesTable } from './services';

export const servicePricesTable = pgTable('service_prices', {
  id: bigserial('srp_id', { mode: 'bigint' }).primaryKey(),
  serviceId: bigint('srp_srv_id', { mode: 'bigint' })
    .notNull()
    .references(() => servicesTable.id),
  price: numeric('srp_price', { precision: 12, scale: 2 }).notNull(),
  estimatedHourlyRate: numeric('srp_estimated_hourly_rate', { precision: 10, scale: 2 }),
  currency: varchar('srp_currency', { length: 10 }).notNull().default('CLP'),
  isCurrent: boolean('srp_is_current').notNull().default(false),
  createdAt: timestamp('srp_created_at').defaultNow(),
  createdBy: varchar('srp_created_by').notNull(),
});
