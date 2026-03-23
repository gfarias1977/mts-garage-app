import { bigint, bigserial, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { clientsTable } from './clients';
import { mechanicsTable } from './mechanics';
import { vehiclesTable } from './vehicles';
import { maintenanceTypesTable } from './maintenanceTypes';
import { workOrdersStatusTable } from './workOrdersStatus';

export const workOrdersTable = pgTable('work_orders', {
  id: bigserial('wor_id', { mode: 'bigint' }).primaryKey(),
  userId: bigint('wor_user_id', { mode: 'bigint' }).notNull(),
  code: varchar('wor_code', { length: 50 }).notNull().unique(),
  clientId: varchar('wor_cli_id', { length: 10 })
    .notNull()
    .references(() => clientsTable.id),
  mechanicId: varchar('wor_mec_id', { length: 10 }).references(
    () => mechanicsTable.id,
  ),
  vehiclePlate: varchar('wor_veh_plate', { length: 20 })
    .notNull()
    .references(() => vehiclesTable.id),
  maintenanceType: varchar('wor_mnt_type', { length: 20 })
  .notNull()
  .references(() => maintenanceTypesTable.id),
  createdAt: timestamp('wor_created_at').defaultNow(),
  createdBy: varchar('wor_created_by').notNull(),
  status: varchar('wor_status', { length: 1 })
  .notNull()
  .references(() => workOrdersStatusTable.id),
});
