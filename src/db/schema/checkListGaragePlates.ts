import { pgTable, timestamp, varchar, bigint } from 'drizzle-orm/pg-core';
import { checkListGarageTable } from './checkListGarage';

export const checkListGaragePlatesTable = pgTable('check_list_garage_plates', {
  id: bigint('clgp_id', { mode: 'bigint' }).primaryKey().generatedAlwaysAsIdentity(),
  checkListGarageId: bigint('clgp_clg_id', { mode: 'bigint' })
    .notNull()
    .references(() => checkListGarageTable.id),  
  vehiclePlate: varchar('wor_veh_plate', { length: 20 }),
  createdAt: timestamp('clgp_created_at').defaultNow(),
  createdBy: varchar('clgp_created_by').notNull(),
  status: varchar('clgp_status', { length: 10 }).notNull(),
});
