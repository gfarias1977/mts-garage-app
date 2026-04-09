import { bigint, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const checkListGarageTable = pgTable('check_list_garage', {
  id: bigint('clg_id', { mode: 'bigint' }).primaryKey().generatedAlwaysAsIdentity(),
  description: varchar('clg_description', { length: 100 }).notNull(),
  createdAt: timestamp('clg_created_at').defaultNow(),
  createdBy: varchar('clg_created_by').notNull(),
  status: varchar('clg_status', { length: 10 }).notNull(),
});
  