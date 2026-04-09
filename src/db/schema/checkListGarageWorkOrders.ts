import { pgTable, timestamp, varchar, bigint } from 'drizzle-orm/pg-core';
import { workOrdersTable } from './workOrders';
import { mechanicsTable } from './mechanics';
import { clientsTable } from './clients';
import { vehiclesTable } from './vehicles';

export const checkListGarageWorkOrdersTable = pgTable('check_list_garage_work_orders', {
  id: bigint('clgw_id', { mode: 'bigint' }).primaryKey().generatedAlwaysAsIdentity(),
  workOrderId: bigint('clgw_wor_id', { mode: 'bigint' })
      .notNull()
      .references(() => workOrdersTable.id),
  clientId: varchar('clgwcli_id', { length: 10 })
    .notNull()
    .references(() => clientsTable.id),
  mechanicId: varchar('clgw_mec_id', { length: 10 }).references(
    () => mechanicsTable.id,
  ),      
  vehiclePlate: varchar('clgw_veh_plate', { length: 20 })
    .notNull()
    .references(() => vehiclesTable.id),
  createdAt: timestamp('clgw_created_at').defaultNow(),
  createdBy: varchar('clgw_created_by').notNull(),
  status: varchar('clgw_status', { length: 10 }).notNull(),
});
