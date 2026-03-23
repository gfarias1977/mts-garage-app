'use server';

import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserByClerkId } from '@/data/users';
import {
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleById,
  type VehicleRow,
} from '@/data/vehicles';
import { getClientsForSelect } from '@/data/lookups';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const vehicleSchema = z.object({
  id: z.string().min(1).max(10),
  clientId: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
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

export async function createVehicleAction(
  input: z.infer<typeof vehicleSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = vehicleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { displayName } = await resolveUser();
    const result = await createVehicle({
      ...parsed.data,
      createdBy: displayName,
    });
    revalidatePath('/vehicles');
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateVehicleAction(
  input: z.infer<typeof vehicleSchema>,
): Promise<ActionResult> {
  const parsed = vehicleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    await resolveUser();
    await updateVehicle(parsed.data.id, {
      clientId: parsed.data.clientId,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      status: parsed.data.status,
    });
    revalidatePath('/vehicles');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteVehicleAction(
  input: { id: string },
): Promise<ActionResult> {
  try {
    await resolveUser();
    await deleteVehicle(input.id);
    revalidatePath('/vehicles');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getVehicleByIdAction(
  id: string,
): Promise<ActionResult<VehicleRow | null>> {
  try {
    await resolveUser();
    const data = await getVehicleById(id);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getVehicleLookupsAction(): Promise<
  ActionResult<{ clients: { id: string; name: string }[] }>
> {
  try {
    await resolveUser();
    const clients = await getClientsForSelect();
    return { success: true, data: { clients } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
