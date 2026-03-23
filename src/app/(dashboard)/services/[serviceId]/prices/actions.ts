'use server';

import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserByClerkId } from '@/data/users';
import {
  createServicePrice,
  updateServicePrice,
  deleteServicePrice,
  getServicePriceById,
  type ServicePriceRow,
} from '@/data/servicePrices';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const servicePriceSchema = z.object({
  serviceId: z.string().min(1),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  estimatedHourlyRate: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid rate format').optional(),
  currency: z.string().min(1).max(10),
  isCurrent: z.boolean(),
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

export async function createServicePriceAction(
  input: z.infer<typeof servicePriceSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = servicePriceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { displayName } = await resolveUser();
    const result = await createServicePrice(BigInt(parsed.data.serviceId), {
      price: parsed.data.price,
      estimatedHourlyRate: parsed.data.estimatedHourlyRate,
      currency: parsed.data.currency,
      isCurrent: parsed.data.isCurrent,
      createdBy: displayName,
    });
    revalidatePath(`/services/${parsed.data.serviceId}/prices`);
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateServicePriceAction(
  input: z.infer<typeof servicePriceSchema> & { id: string },
): Promise<ActionResult> {
  const { id, ...rest } = input;
  const parsed = servicePriceSchema.safeParse(rest);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    await resolveUser();
    await updateServicePrice(BigInt(id), BigInt(parsed.data.serviceId), {
      price: parsed.data.price,
      estimatedHourlyRate: parsed.data.estimatedHourlyRate || null,
      currency: parsed.data.currency,
      isCurrent: parsed.data.isCurrent,
    });
    revalidatePath(`/services/${parsed.data.serviceId}/prices`);
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteServicePriceAction(
  input: { id: string; serviceId: string },
): Promise<ActionResult> {
  try {
    await resolveUser();
    await deleteServicePrice(BigInt(input.id), BigInt(input.serviceId));
    revalidatePath(`/services/${input.serviceId}/prices`);
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getServicePriceByIdAction(
  id: string,
  serviceId: string,
): Promise<ActionResult<ServicePriceRow | null>> {
  try {
    await resolveUser();
    const data = await getServicePriceById(BigInt(id), BigInt(serviceId));
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
