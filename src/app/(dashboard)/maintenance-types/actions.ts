'use server';

import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserByClerkId } from '@/data/users';
import {
  createMaintenanceType,
  updateMaintenanceType,
  deleteMaintenanceType,
  getMaintenanceTypeById,
  type MaintenanceTypeRow,
} from '@/data/maintenanceTypes';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const maintenanceTypeSchema = z.object({
  id: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
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

export async function createMaintenanceTypeAction(
  input: z.infer<typeof maintenanceTypeSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = maintenanceTypeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { displayName } = await resolveUser();
    const result = await createMaintenanceType({
      ...parsed.data,
      createdBy: displayName,
    });
    revalidatePath('/maintenance-types');
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateMaintenanceTypeAction(
  input: z.infer<typeof maintenanceTypeSchema>,
): Promise<ActionResult> {
  const parsed = maintenanceTypeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    await resolveUser();
    await updateMaintenanceType(parsed.data.id, {
      name: parsed.data.name,
      status: parsed.data.status,
    });
    revalidatePath('/maintenance-types');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteMaintenanceTypeAction(
  input: { id: string },
): Promise<ActionResult> {
  try {
    await resolveUser();
    await deleteMaintenanceType(input.id);
    revalidatePath('/maintenance-types');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getMaintenanceTypeByIdAction(
  id: string,
): Promise<ActionResult<MaintenanceTypeRow | null>> {
  try {
    await resolveUser();
    const data = await getMaintenanceTypeById(id);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
