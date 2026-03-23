'use server';

import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserByClerkId } from '@/data/users';
import {
  createService,
  updateService,
  deleteService,
  getServiceById,
  type ServiceRow,
} from '@/data/services';
import { getServiceCategoriesForSelect } from '@/data/lookups';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const serviceSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
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

export async function createServiceAction(
  input: z.infer<typeof serviceSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { user, displayName } = await resolveUser();
    const result = await createService(user.id, {
      categoryId: BigInt(parsed.data.categoryId),
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      createdBy: displayName,
    });
    revalidatePath('/services');
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateServiceAction(
  input: z.infer<typeof serviceSchema> & { id: string },
): Promise<ActionResult> {
  const { id, ...rest } = input;
  const parsed = serviceSchema.safeParse(rest);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { user } = await resolveUser();
    await updateService(BigInt(id), user.id, {
      categoryId: BigInt(parsed.data.categoryId),
      name: parsed.data.name,
      description: parsed.data.description || null,
      status: parsed.data.status,
    });
    revalidatePath('/services');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteServiceAction(
  input: { id: string },
): Promise<ActionResult> {
  try {
    const { user } = await resolveUser();
    await deleteService(BigInt(input.id), user.id);
    revalidatePath('/services');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getServiceByIdAction(
  id: string,
): Promise<ActionResult<ServiceRow | null>> {
  try {
    const { user } = await resolveUser();
    const data = await getServiceById(BigInt(id), user.id);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getServiceLookupsAction(): Promise<
  ActionResult<{ categories: { id: string; name: string }[] }>
> {
  try {
    const { user } = await resolveUser();
    const categories = await getServiceCategoriesForSelect(user.id);
    return { success: true, data: { categories } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
