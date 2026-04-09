'use server';

import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserByClerkId } from '@/data/users';
import {
  getCheckListGaragePlatesPaged,
  getCheckListGaragePlateById,
  createCheckListGaragePlate,
  updateCheckListGaragePlate,
  deleteCheckListGaragePlate,
  type GetCheckListGaragePlatesResult,
  type CheckListGaragePlateRow,
  type CheckListGaragePlateSortColumn,
} from '@/data/checkListGaragePlates';
import {
  getCheckListGarageWorkOrdersPaged,
  syncWorkOrdersForPlate,
  deleteWorkOrdersForPlate,
  type GetCheckListGarageWorkOrdersResult,
  type CheckListGarageWorkOrderSortColumn,
} from '@/data/checkListGarageWorkOrders';
import {
  createCheckListGarage,
  updateCheckListGarage,
  deleteCheckListGarage,
  getCheckListGarageById,
  type CheckListGarageRow,
} from '@/data/checkListGarage';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const checkListGarageSchema = z.object({
  description: z.string().min(1).max(100),
  status: z.string().min(1).max(10),
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

export async function createCheckListGarageAction(
  input: z.infer<typeof checkListGarageSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = checkListGarageSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { displayName } = await resolveUser();
    const result = await createCheckListGarage({ ...parsed.data, createdBy: displayName });
    revalidatePath('/check-list-garage');
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateCheckListGarageAction(
  id: string,
  input: z.infer<typeof checkListGarageSchema>,
): Promise<ActionResult> {
  const parsed = checkListGarageSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    await resolveUser();
    await updateCheckListGarage(BigInt(id), parsed.data);
    revalidatePath('/check-list-garage');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteCheckListGarageAction(
  input: { id: string },
): Promise<ActionResult> {
  try {
    await resolveUser();
    await deleteCheckListGarage(BigInt(input.id));
    revalidatePath('/check-list-garage');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getCheckListGarageByIdAction(
  id: string,
): Promise<ActionResult<CheckListGarageRow | null>> {
  try {
    await resolveUser();
    const data = await getCheckListGarageById(BigInt(id));
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// ── CheckListGaragePlates ──────────────────────────────────────────────────

const checkListGaragePlateSchema = z.object({
  vehiclePlate: z.string().max(20).optional(),
  status: z.string().min(1).max(10),
});

export async function getCheckListGaragePlatesPagedAction(input: {
  checkListGarageId: string;
  page: number;
  pageSize: number;
  search: string;
  sortBy: CheckListGaragePlateSortColumn;
  sortDir: 'asc' | 'desc';
}): Promise<ActionResult<GetCheckListGaragePlatesResult>> {
  try {
    await resolveUser();
    const data = await getCheckListGaragePlatesPaged({
      checkListGarageId: BigInt(input.checkListGarageId),
      search: input.search || undefined,
      sortBy: input.sortBy,
      sortDir: input.sortDir,
      page: input.page,
      pageSize: input.pageSize,
    });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getCheckListGaragePlateByIdAction(
  id: string,
): Promise<ActionResult<CheckListGaragePlateRow | null>> {
  try {
    await resolveUser();
    const data = await getCheckListGaragePlateById(id);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function createCheckListGaragePlateAction(
  checkListGarageId: string,
  input: z.infer<typeof checkListGaragePlateSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = checkListGaragePlateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { displayName } = await resolveUser();
    const data = await createCheckListGaragePlate(BigInt(checkListGarageId), {
      ...parsed.data,
      createdBy: displayName,
    });

    // Automatically sync any existing work orders for this plate
    if (parsed.data.vehiclePlate) {
      await syncWorkOrdersForPlate(parsed.data.vehiclePlate, displayName);
    }

    revalidatePath('/check-list-garage');
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateCheckListGaragePlateAction(
  id: string,
  input: z.infer<typeof checkListGaragePlateSchema>,
): Promise<ActionResult> {
  const parsed = checkListGaragePlateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    await resolveUser();
    await updateCheckListGaragePlate(id, {
      vehiclePlate: parsed.data.vehiclePlate ?? null,
      status: parsed.data.status,
    });
    revalidatePath('/check-list-garage');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteCheckListGaragePlateAction(
  input: { id: string },
): Promise<ActionResult> {
  try {
    await resolveUser();
    // Fetch plate first to get vehiclePlate before deleting
    const plate = await getCheckListGaragePlateById(input.id);
    if (plate?.vehiclePlate) {
      await deleteWorkOrdersForPlate(plate.vehiclePlate);
    }
    await deleteCheckListGaragePlate(input.id);
    revalidatePath('/check-list-garage');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// ── CheckListGarageWorkOrders ──────────────────────────────────────────────

export async function getCheckListGarageWorkOrdersPagedAction(input: {
  vehiclePlate: string;
  page: number;
  pageSize: number;
  search: string;
  sortBy: CheckListGarageWorkOrderSortColumn;
  sortDir: 'asc' | 'desc';
}): Promise<ActionResult<GetCheckListGarageWorkOrdersResult>> {
  try {
    await resolveUser();
    const data = await getCheckListGarageWorkOrdersPaged({
      vehiclePlate: input.vehiclePlate,
      search: input.search || undefined,
      sortBy: input.sortBy,
      sortDir: input.sortDir,
      page: input.page,
      pageSize: input.pageSize,
    });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
