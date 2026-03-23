import { db } from '@/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserByClerkId(clerkId: string) {
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);

  if (existing) return existing;

  // Auto-provision DB user on first sign-in
  const [created] = await db
    .insert(usersTable)
    .values({ clerkId })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  // Race condition: another request created it first
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);

  return user ?? null;
}
