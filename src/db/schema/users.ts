import { bigserial, pgTable, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: bigserial('usr_id', { mode: 'bigint' }).primaryKey(),
  clerkId: varchar('usr_clerk_id', { length: 100 }).notNull().unique(),
});
