import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { clientTypesTable } from './clientTypes';

export const clientsTable = pgTable('clients', {
  id: varchar('cli_id', { length: 10 }).primaryKey(),
  clientType: varchar('cli_clt_id', { length: 10 })
      .notNull()
      .references(() => clientTypesTable.id),
  name: varchar('cli_name', { length: 100 }).notNull(),
  email: varchar('cli_email', { length: 150 }),
  phone: varchar('cli_phone', { length: 30 }),
  createdAt: timestamp('cli_created_at').defaultNow(),
  createdBy: varchar('cli_created_by').notNull(),
  status: varchar('cli_status', { length: 1 }).notNull(),
});
