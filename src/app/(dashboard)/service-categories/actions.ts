'use server';

import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserByClerkId } from '@/data/users';
import {
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  getServiceCategoryById,
  type ServiceCategoryRow,
} from '@/data/serviceCategories';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const serviceCategorySchema = z.object({
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

export async function createServiceCategoryAction(
  input: z.infer<typeof serviceCategorySchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = serviceCategorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { user, displayName } = await resolveUser();
    const result = await createServiceCategory(user.id, {
      ...parsed.data,
      createdBy: displayName,
    });
    revalidatePath('/service-categories');
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateServiceCategoryAction(
  input: z.infer<typeof serviceCategorySchema> & { id: string },
): Promise<ActionResult> {
  const { id, ...rest } = input;
  const parsed = serviceCategorySchema.safeParse(rest);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { user } = await resolveUser();
    await updateServiceCategory(BigInt(id), user.id, parsed.data);
    revalidatePath('/service-categories');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteServiceCategoryAction(
  input: { id: string },
): Promise<ActionResult> {
  try {
    const { user } = await resolveUser();
    await deleteServiceCategory(BigInt(input.id), user.id);
    revalidatePath('/service-categories');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getServiceCategoryByIdAction(
  id: string,
): Promise<ActionResult<ServiceCategoryRow | null>> {
  try {
    const { user } = await resolveUser();
    const data = await getServiceCategoryById(BigInt(id), user.id);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
