import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const maintenanceTypesTable = pgTable('maintenance_types', {
  id: varchar('mnt_id', { length: 10 }).primaryKey(),
  name: varchar('mnt_name', { length: 100 }).notNull(),
  createdBy: varchar('mnt_created_by').notNull(),
  createdAt: timestamp('mnt_created_at').defaultNow(),
  status: varchar('mnt_status', { length: 1 }).notNull(),
});
