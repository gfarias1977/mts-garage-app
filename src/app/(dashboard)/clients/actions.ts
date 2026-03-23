'use server';

import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserByClerkId } from '@/data/users';
import {
  createClient,
  updateClient,
  deleteClient,
  getClientById,
  type ClientRow,
} from '@/data/clients';
import { getClientTypesForSelect } from '@/data/lookups';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const clientSchema = z.object({
  id: z.string().min(1).max(10),
  clientType: z.string().min(1).max(10),
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

export async function createClientAction(
  input: z.infer<typeof clientSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { displayName } = await resolveUser();
    const result = await createClient({
      ...parsed.data,
      createdBy: displayName,
    });
    revalidatePath('/clients');
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateClientAction(
  input: z.infer<typeof clientSchema>,
): Promise<ActionResult> {
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    await resolveUser();
    await updateClient(parsed.data.id, {
      clientType: parsed.data.clientType,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      status: parsed.data.status,
    });
    revalidatePath('/clients');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteClientAction(
  input: { id: string },
): Promise<ActionResult> {
  try {
    await resolveUser();
    await deleteClient(input.id);
    revalidatePath('/clients');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getClientByIdAction(
  id: string,
): Promise<ActionResult<ClientRow | null>> {
  try {
    await resolveUser();
    const data = await getClientById(id);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getClientLookupsAction(): Promise<
  ActionResult<{ clientTypes: { id: string; name: string }[] }>
> {
  try {
    await resolveUser();
    const clientTypes = await getClientTypesForSelect();
    return { success: true, data: { clientTypes } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
