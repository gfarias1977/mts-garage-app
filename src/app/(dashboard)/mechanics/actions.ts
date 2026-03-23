'use server';

import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserByClerkId } from '@/data/users';
import {
  createMechanic,
  updateMechanic,
  deleteMechanic,
  getMechanicById,
  type MechanicRow,
} from '@/data/mechanics';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const mechanicSchema = z.object({
  id: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  address: z.string().max(255).optional(),
  email: z.string().max(150).optional(),
  phone: z.string().max(30).optional(),
  status: z.string().length(1),
});

async function resolveUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');
  const [user, clerkUser] = await Promise.all([
    getUserByClerkId(clerkId),
    currentUser(),
  ]);
  if (!user) redirect('/sign-in');
  const displayName =
    clerkUser?.username ??
    ([clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') ||
      clerkUser?.emailAddresses?.[0]?.emailAddress) ??
    user.id.toString();
  return { user, displayName };
}

export async function createMechanicAction(
  input: z.infer<typeof mechanicSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = mechanicSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { displayName } = await resolveUser();
    const result = await createMechanic({
      ...parsed.data,
      createdBy: displayName,
    });
    revalidatePath('/mechanics');
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateMechanicAction(
  input: z.infer<typeof mechanicSchema>,
): Promise<ActionResult> {
  const parsed = mechanicSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    await resolveUser();
    await updateMechanic(parsed.data.id, {
      name: parsed.data.name,
      address: parsed.data.address || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      status: parsed.data.status,
    });
    revalidatePath('/mechanics');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteMechanicAction(
  input: { id: string },
): Promise<ActionResult> {
  try {
    await resolveUser();
    await deleteMechanic(input.id);
    revalidatePath('/mechanics');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getMechanicByIdAction(
  id: string,
): Promise<ActionResult<MechanicRow | null>> {
  try {
    await resolveUser();
    const data = await getMechanicById(id);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
