import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const mechanicsTable = pgTable('mechanics', {
  id: varchar('mec_id', { length: 10 }).primaryKey(),
  name: varchar('mec_name', { length: 100 }).notNull(),
  address: varchar('mec_address', { length: 255 }),
  email: varchar('mec_email', { length: 150 }),
  phone: varchar('mec_phone', { length: 30 }),
  createdAt: timestamp('mec_created_at').defaultNow(),
  createdBy: varchar('mec_created_by').notNull(),
  status: varchar('mec_status', { length: 1 }).notNull(),
});
