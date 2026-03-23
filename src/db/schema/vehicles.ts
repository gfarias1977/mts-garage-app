import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { clientsTable } from './clients';

export const vehiclesTable = pgTable('vehicles', {
  id: varchar('veh_plate', { length: 10 }).primaryKey(),
  clientId: varchar('veh_clt_id', { length: 10 })
        .notNull()
        .references(() => clientsTable.id),
  name: varchar('veh_name', { length: 100 }).notNull(),
  email: varchar('veh_email', { length: 150 }),
  phone: varchar('veh_phone', { length: 30 }),
  createdAt: timestamp('veh_created_at').defaultNow(),
  createdBy: varchar('veh_created_by').notNull(),
  status: varchar('veh_status', { length: 1 }).notNull(),
});
