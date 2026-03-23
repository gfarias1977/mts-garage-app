import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const clientTypesTable = pgTable('client_types', {
  id: varchar('clt_code', { length: 10 }).primaryKey(),
  name: varchar('clt_description', { length: 100 }).notNull(),
  createdAt: timestamp('clt_created_at').defaultNow(),
  createdBy: varchar('clt_created_by').notNull(),
  status: varchar('clt_status', { length: 1 }).notNull(),
});
