'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserByClerkId } from '@/data/users';
import { createWorkOrder, updateWorkOrder, deleteWorkOrder, getWorkOrderById, type WorkOrderDetail } from '@/data/workOrders';
import {
  getWorkOrderServices,
  getWorkOrderServicesPaged,
  getWorkOrderServiceById,
  createWorkOrderService,
  updateWorkOrderService,
  deleteWorkOrderService,
  getServicesForSelect,
  type GetWorkOrderServicesResult,
  type WorkOrderServiceRow,
  type WorkOrderServiceSortColumn,
} from '@/data/workOrderServices';
import {
  getWorkOrderSpareParts,
  getWorkOrderSparePartsPaged,
  getSparePartsByWorkOrderServicePaged,
  getWorkOrderSparePartById,
  createWorkOrderSparePart,
  updateWorkOrderSparePart,
  deleteWorkOrderSparePart,
  type GetSparePartsResult,
  type SparePartRow,
  type SparePartSortColumn,
} from '@/data/workOrderSpareParts';
import {
  getWorkOrderObservations,
  getWorkOrderObservationsPaged,
  getWorkOrderObservationById,
  createWorkOrderObservation,
  updateWorkOrderObservation,
  deleteWorkOrderObservation,
  type GetObservationsResult,
  type ObservationRow,
  type ObservationSortColumn,
} from '@/data/workOrderObservations';
import {
  getClientsForSelect,
  getMechanicsForSelect,
  getVehiclesForSelect,
  getMaintenanceTypesForSelect,
  getStatusesForSelect,
} from '@/data/lookups';
import { getWorkOrderQuoteData, type WorkOrderQuoteData } from '@/data/workOrderQuote';
import { currentUser } from '@clerk/nextjs/server';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const workOrderSchema = z.object({
  code: z.string().min(1).max(50),
  clientId: z.string().min(1),
  mechanicId: z.string().optional(),
  vehiclePlate: z.string().min(1).max(20),
  maintenanceType: z.string().min(1),
  status: z.string().min(1),
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

export async function createWorkOrderAction(
  input: z.infer<typeof workOrderSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = workOrderSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { user, displayName } = await resolveUser();
    const result = await createWorkOrder(user.id, {
      ...parsed.data,
      createdBy: displayName,
    });
    revalidatePath('/work-orders');
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateWorkOrderAction(
  input: z.infer<typeof workOrderSchema> & { id: string },
): Promise<ActionResult> {
  const { id, ...rest } = input;
  const parsed = workOrderSchema.safeParse(rest);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { user } = await resolveUser();
    await updateWorkOrder(BigInt(id), user.id, parsed.data);
    revalidatePath('/work-orders');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteWorkOrderAction(
  input: { id: string },
): Promise<ActionResult> {
  try {
    const { user } = await resolveUser();
    await deleteWorkOrder(BigInt(input.id), user.id);
    revalidatePath('/work-orders');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

type Lookups = {
  clients: { id: string; name: string }[];
  mechanics: { id: string; name: string }[];
  vehicles: { id: string; name: string }[];
  maintenanceTypes: { id: string; name: string }[];
  statuses: { id: string; description: string }[];
};

export async function getLookupsAction(): Promise<ActionResult<Lookups>> {
  try {
    await resolveUser();
    const [clients, mechanics, vehicles, maintenanceTypes, statuses] = await Promise.all([
      getClientsForSelect(),
      getMechanicsForSelect(),
      getVehiclesForSelect(),
      getMaintenanceTypesForSelect(),
      getStatusesForSelect(),
    ]);
    return { success: true, data: { clients, mechanics, vehicles, maintenanceTypes, statuses } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getWorkOrderByIdAction(
  id: string,
): Promise<ActionResult<WorkOrderDetail | null>> {
  try {
    const { user } = await resolveUser();
    const workOrder = await getWorkOrderById(BigInt(id), user.id);
    return { success: true, data: workOrder };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getWorkOrderServicesAction(
  workOrderId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof getWorkOrderServices>>>> {
  try {
    await resolveUser();
    const data = await getWorkOrderServices(BigInt(workOrderId));
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getWorkOrderSparePartsAction(
  workOrderId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof getWorkOrderSpareParts>>>> {
  try {
    await resolveUser();
    const data = await getWorkOrderSpareParts(BigInt(workOrderId));
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getWorkOrderObservationsAction(
  workOrderId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof getWorkOrderObservations>>>> {
  try {
    await resolveUser();
    const data = await getWorkOrderObservations(BigInt(workOrderId));
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

const observationSchema = z.object({
  authorName: z.string().min(1).max(100),
  content: z.string().min(1),
});

export async function getWorkOrderObservationsPagedAction(input: {
  workOrderId: string;
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}): Promise<ActionResult<GetObservationsResult>> {
  try {
    await resolveUser();
    const data = await getWorkOrderObservationsPaged({
      workOrderId: BigInt(input.workOrderId),
      search: input.search || undefined,
      sortBy: (input.sortBy as ObservationSortColumn) || 'id',
      sortDir: input.sortDir,
      page: input.page,
      pageSize: input.pageSize,
    });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getWorkOrderObservationByIdAction(
  id: string,
): Promise<ActionResult<ObservationRow | null>> {
  try {
    await resolveUser();
    const data = await getWorkOrderObservationById(BigInt(id));
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function createWorkOrderObservationAction(
  workOrderId: string,
  input: z.infer<typeof observationSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = observationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { displayName } = await resolveUser();
    const data = await createWorkOrderObservation(BigInt(workOrderId), {
      ...parsed.data,
      createdBy: displayName,
    });
    revalidatePath('/work-orders');
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateWorkOrderObservationAction(
  id: string,
  input: z.infer<typeof observationSchema>,
): Promise<ActionResult> {
  const parsed = observationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    await resolveUser();
    await updateWorkOrderObservation(BigInt(id), parsed.data);
    revalidatePath('/work-orders');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteWorkOrderObservationAction(id: string): Promise<ActionResult> {
  try {
    await resolveUser();
    await deleteWorkOrderObservation(BigInt(id));
    revalidatePath('/work-orders');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// ── Spare Parts ────────────────────────────────────────────────────────────────

const sparePartSchema = z.object({
  serviceId: z.string().min(1),
  description: z.string().min(1).max(255),
  cost: z.string().min(1).regex(/^\d+(\.\d{1,2})?$/, 'Ingrese un costo válido (ej: 1500.00)'),
  status: z.string().min(1).max(1),
});

export async function getWorkOrderSparePartsPagedAction(input: {
  workOrderId: string;
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}): Promise<ActionResult<GetSparePartsResult>> {
  try {
    await resolveUser();
    const data = await getWorkOrderSparePartsPaged({
      workOrderId: BigInt(input.workOrderId),
      search: input.search || undefined,
      sortBy: (input.sortBy as SparePartSortColumn) || 'id',
      sortDir: input.sortDir,
      page: input.page,
      pageSize: input.pageSize,
    });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getWorkOrderSparePartByIdAction(
  id: string,
): Promise<ActionResult<SparePartRow | null>> {
  try {
    await resolveUser();
    const data = await getWorkOrderSparePartById(BigInt(id));
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getWorkOrderServicesForSelectAction(
  workOrderId: string,
): Promise<ActionResult<{ id: string; serviceName: string }[]>> {
  try {
    await resolveUser();
    const rows = await getWorkOrderServices(BigInt(workOrderId));
    return { success: true, data: rows.map((r) => ({ id: r.id, serviceName: r.serviceName })) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function createWorkOrderSparePartAction(
  workOrderId: string,
  input: z.infer<typeof sparePartSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = sparePartSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { displayName } = await resolveUser();
    const data = await createWorkOrderSparePart(BigInt(workOrderId), {
      serviceId: BigInt(parsed.data.serviceId),
      description: parsed.data.description,
      cost: parsed.data.cost,
      status: parsed.data.status,
      createdBy: displayName,
    });
    revalidatePath('/work-orders');
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateWorkOrderSparePartAction(
  id: string,
  input: z.infer<typeof sparePartSchema>,
): Promise<ActionResult> {
  const parsed = sparePartSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    await resolveUser();
    await updateWorkOrderSparePart(BigInt(id), {
      serviceId: BigInt(parsed.data.serviceId),
      description: parsed.data.description,
      cost: parsed.data.cost,
      status: parsed.data.status,
    });
    revalidatePath('/work-orders');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteWorkOrderSparePartAction(id: string): Promise<ActionResult> {
  try {
    await resolveUser();
    await deleteWorkOrderSparePart(BigInt(id));
    revalidatePath('/work-orders');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getSparePartsByWorkOrderServicePagedAction(input: {
  workOrderServiceId: string;
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}): Promise<ActionResult<GetSparePartsResult>> {
  try {
    await resolveUser();
    const data = await getSparePartsByWorkOrderServicePaged({
      workOrderServiceId: BigInt(input.workOrderServiceId),
      search: input.search || undefined,
      sortBy: (input.sortBy as SparePartSortColumn) || 'id',
      sortDir: input.sortDir,
      page: input.page,
      pageSize: input.pageSize,
    });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// ── Work Order Services ────────────────────────────────────────────────────────

const optionalNumeric = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Ingrese un valor válido (ej: 1500.00)')
  .optional()
  .or(z.literal(''));

const workOrderServiceSchema = z.object({
  serviceId: z.string().min(1),
  note: z.string(),
  estimatedHourlyRate: optionalNumeric,
  estimatedPriceRate: optionalNumeric,
  actualHourlyRate: optionalNumeric,
  actualPriceRate: optionalNumeric,
  discount: optionalNumeric,
  status: z.string().min(1).max(1),
});

export async function getWorkOrderServicesPagedAction(input: {
  workOrderId: string;
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}): Promise<ActionResult<GetWorkOrderServicesResult>> {
  try {
    await resolveUser();
    const data = await getWorkOrderServicesPaged({
      workOrderId: BigInt(input.workOrderId),
      search: input.search || undefined,
      sortBy: (input.sortBy as WorkOrderServiceSortColumn) || 'id',
      sortDir: input.sortDir,
      page: input.page,
      pageSize: input.pageSize,
    });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getWorkOrderServiceByIdAction(
  id: string,
): Promise<ActionResult<WorkOrderServiceRow | null>> {
  try {
    await resolveUser();
    const data = await getWorkOrderServiceById(BigInt(id));
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getServicesForSelectAction(): Promise<
  ActionResult<{ id: string; name: string }[]>
> {
  try {
    const { user } = await resolveUser();
    const data = await getServicesForSelect(user.id);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function createWorkOrderServiceAction(
  workOrderId: string,
  input: z.infer<typeof workOrderServiceSchema>,
): Promise<ActionResult<{ id: string }>> {
  const parsed = workOrderServiceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    const { displayName } = await resolveUser();
    const toNull = (v: string | undefined) => (v === '' || v === undefined ? null : v);
    const data = await createWorkOrderService(BigInt(workOrderId), {
      serviceId: BigInt(parsed.data.serviceId),
      note: parsed.data.note,
      estimatedHourlyRate: toNull(parsed.data.estimatedHourlyRate),
      estimatedPriceRate: toNull(parsed.data.estimatedPriceRate),
      actualHourlyRate: toNull(parsed.data.actualHourlyRate),
      actualPriceRate: toNull(parsed.data.actualPriceRate),
      discount: toNull(parsed.data.discount),
      status: parsed.data.status,
      createdBy: displayName,
    });
    revalidatePath('/work-orders');
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateWorkOrderServiceAction(
  id: string,
  input: z.infer<typeof workOrderServiceSchema>,
): Promise<ActionResult> {
  const parsed = workOrderServiceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.message };

  try {
    await resolveUser();
    const toNull = (v: string | undefined) => (v === '' || v === undefined ? null : v);
    await updateWorkOrderService(BigInt(id), {
      serviceId: BigInt(parsed.data.serviceId),
      note: parsed.data.note,
      estimatedHourlyRate: toNull(parsed.data.estimatedHourlyRate),
      estimatedPriceRate: toNull(parsed.data.estimatedPriceRate),
      actualHourlyRate: toNull(parsed.data.actualHourlyRate),
      actualPriceRate: toNull(parsed.data.actualPriceRate),
      discount: toNull(parsed.data.discount),
      status: parsed.data.status,
    });
    revalidatePath('/work-orders');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteWorkOrderServiceAction(id: string): Promise<ActionResult> {
  try {
    await resolveUser();
    await deleteWorkOrderService(BigInt(id));
    revalidatePath('/work-orders');
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getWorkOrderQuoteDataAction(
  workOrderId: string,
): Promise<ActionResult<{ quoteData: WorkOrderQuoteData; sellerName: string }>> {
  try {
    await resolveUser();
    const [quoteData, clerkUser] = await Promise.all([
      getWorkOrderQuoteData(BigInt(workOrderId)),
      currentUser(),
    ]);
    if (!quoteData) return { success: false, error: 'Work order not found' };
    const sellerName = clerkUser
      ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ')
      : quoteData.createdBy;
    return { success: true, data: { quoteData, sellerName } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
