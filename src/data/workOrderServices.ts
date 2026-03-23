import { db } from '@/db';
import { workOrderServicesTable, servicesTable } from '@/db/schema';
import { asc, desc, eq, ilike, or, sql, and } from 'drizzle-orm';

export type WorkOrderServiceRow = {
  id: string;
  workOrderId: string;
  serviceId: string;
  serviceName: string;
  note: string;
  estimatedHourlyRate: string | null;
  estimatedPriceRate: string | null;
  actualHourlyRate: string | null;
  actualPriceRate: string | null;
  discount: string | null;
  status: string;
  createdAt: Date | null;
  createdBy: string;
};

export type WorkOrderServiceSortColumn =
  | 'id'
  | 'serviceId'
  | 'note'
  | 'estimatedHourlyRate'
  | 'estimatedPriceRate'
  | 'actualHourlyRate'
  | 'actualPriceRate'
  | 'discount'
  | 'status'
  | 'createdAt'
  | 'createdBy';

export type GetWorkOrderServicesResult = {
  rows: WorkOrderServiceRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: workOrderServicesTable.id,
  serviceId: workOrderServicesTable.serviceId,
  note: workOrderServicesTable.note,
  estimatedHourlyRate: workOrderServicesTable.estimatedHourlyRate,
  estimatedPriceRate: workOrderServicesTable.estimatedPriceRate,
  actualHourlyRate: workOrderServicesTable.actualHourlyRate,
  actualPriceRate: workOrderServicesTable.actualPriceRate,
  discount: workOrderServicesTable.discount,
  status: workOrderServicesTable.status,
  createdAt: workOrderServicesTable.createdAt,
  createdBy: workOrderServicesTable.createdBy,
} as const;

export async function getWorkOrderServicesPaged(params: {
  workOrderId: bigint;
  search?: string;
  sortBy?: WorkOrderServiceSortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetWorkOrderServicesResult> {
  const {
    workOrderId,
    search,
    sortBy = 'id',
    sortDir = 'desc',
    page = 1,
    pageSize = 10,
  } = params;

  const baseFilter = eq(workOrderServicesTable.workOrderId, workOrderId);

  const whereClause = search
    ? and(
        baseFilter,
        or(
          ilike(workOrderServicesTable.note, `%${search}%`),
          ilike(workOrderServicesTable.status, `%${search}%`),
          ilike(workOrderServicesTable.createdBy, `%${search}%`),
        ),
      )
    : baseFilter;

  const sortCol = sortColumnMap[sortBy] ?? workOrderServicesTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(workOrderServicesTable)
      .where(whereClause),
    db
      .select({
        id: workOrderServicesTable.id,
        workOrderId: workOrderServicesTable.workOrderId,
        serviceId: workOrderServicesTable.serviceId,
        serviceName: servicesTable.name,
        note: workOrderServicesTable.note,
        estimatedHourlyRate: workOrderServicesTable.estimatedHourlyRate,
        estimatedPriceRate: workOrderServicesTable.estimatedPriceRate,
        actualHourlyRate: workOrderServicesTable.actualHourlyRate,
        actualPriceRate: workOrderServicesTable.actualPriceRate,
        discount: workOrderServicesTable.discount,
        status: workOrderServicesTable.status,
        createdAt: workOrderServicesTable.createdAt,
        createdBy: workOrderServicesTable.createdBy,
      })
      .from(workOrderServicesTable)
      .leftJoin(servicesTable, eq(workOrderServicesTable.serviceId, servicesTable.id))
      .where(whereClause)
      .orderBy(orderClause)
      .limit(pageSize)
      .offset(offset),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    rows: rows.map((row) => ({
      id: row.id.toString(),
      workOrderId: row.workOrderId.toString(),
      serviceId: row.serviceId.toString(),
      serviceName: row.serviceName ?? '',
      note: row.note,
      estimatedHourlyRate: row.estimatedHourlyRate ?? null,
      estimatedPriceRate: row.estimatedPriceRate ?? null,
      actualHourlyRate: row.actualHourlyRate ?? null,
      actualPriceRate: row.actualPriceRate ?? null,
      discount: row.discount ?? null,
      status: row.status,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
    })),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getWorkOrderServiceById(
  id: bigint,
): Promise<WorkOrderServiceRow | null> {
  const rows = await db
    .select({
      id: workOrderServicesTable.id,
      workOrderId: workOrderServicesTable.workOrderId,
      serviceId: workOrderServicesTable.serviceId,
      serviceName: servicesTable.name,
      note: workOrderServicesTable.note,
      estimatedHourlyRate: workOrderServicesTable.estimatedHourlyRate,
      estimatedPriceRate: workOrderServicesTable.estimatedPriceRate,
      actualHourlyRate: workOrderServicesTable.actualHourlyRate,
      actualPriceRate: workOrderServicesTable.actualPriceRate,
      discount: workOrderServicesTable.discount,
      status: workOrderServicesTable.status,
      createdAt: workOrderServicesTable.createdAt,
      createdBy: workOrderServicesTable.createdBy,
    })
    .from(workOrderServicesTable)
    .leftJoin(servicesTable, eq(workOrderServicesTable.serviceId, servicesTable.id))
    .where(eq(workOrderServicesTable.id, id))
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id.toString(),
    workOrderId: row.workOrderId.toString(),
    serviceId: row.serviceId.toString(),
    serviceName: row.serviceName ?? '',
    note: row.note,
    estimatedHourlyRate: row.estimatedHourlyRate ?? null,
    estimatedPriceRate: row.estimatedPriceRate ?? null,
    actualHourlyRate: row.actualHourlyRate ?? null,
    actualPriceRate: row.actualPriceRate ?? null,
    discount: row.discount ?? null,
    status: row.status,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
  };
}

export async function createWorkOrderService(
  workOrderId: bigint,
  input: {
    serviceId: bigint;
    note: string;
    estimatedHourlyRate?: string | null;
    estimatedPriceRate?: string | null;
    actualHourlyRate?: string | null;
    actualPriceRate?: string | null;
    discount?: string | null;
    status: string;
    createdBy: string;
  },
): Promise<{ id: string }> {
  const [row] = await db
    .insert(workOrderServicesTable)
    .values({ workOrderId, ...input })
    .returning({ id: workOrderServicesTable.id });

  return { id: row.id.toString() };
}

export async function updateWorkOrderService(
  id: bigint,
  input: {
    serviceId?: bigint;
    note?: string;
    estimatedHourlyRate?: string | null;
    estimatedPriceRate?: string | null;
    actualHourlyRate?: string | null;
    actualPriceRate?: string | null;
    discount?: string | null;
    status?: string;
  },
): Promise<void> {
  await db.update(workOrderServicesTable).set(input).where(eq(workOrderServicesTable.id, id));
}

export async function deleteWorkOrderService(id: bigint): Promise<void> {
  await db.delete(workOrderServicesTable).where(eq(workOrderServicesTable.id, id));
}

export async function getServicesForSelect(userId: bigint): Promise<{ id: string; name: string }[]> {
  const rows = await db
    .select({ id: servicesTable.id, name: servicesTable.name })
    .from(servicesTable)
    .where(eq(servicesTable.userId, userId));
  return rows.map((r) => ({ id: r.id.toString(), name: r.name }));
}

// Kept for backward compatibility
export async function getWorkOrderServices(workOrderId: bigint) {
  const rows = await db
    .select({
      id: workOrderServicesTable.id,
      serviceName: servicesTable.name,
      note: workOrderServicesTable.note,
      estimatedHourlyRate: workOrderServicesTable.estimatedHourlyRate,
      actualHourlyRate: workOrderServicesTable.actualHourlyRate,
      estimatedPriceRate: workOrderServicesTable.estimatedPriceRate,
      actualPriceRate: workOrderServicesTable.actualPriceRate,
      discount: workOrderServicesTable.discount,
      status: workOrderServicesTable.status,
      createdAt: workOrderServicesTable.createdAt,
    })
    .from(workOrderServicesTable)
    .leftJoin(servicesTable, eq(workOrderServicesTable.serviceId, servicesTable.id))
    .where(eq(workOrderServicesTable.workOrderId, workOrderId));

  return rows.map((row) => ({
    id: row.id.toString(),
    serviceName: row.serviceName ?? '',
    note: row.note,
    estimatedHourlyRate: row.estimatedHourlyRate ?? null,
    actualHourlyRate: row.actualHourlyRate ?? null,
    estimatedPriceRate: row.estimatedPriceRate ?? null,
    actualPriceRate: row.actualPriceRate ?? null,
    discount: row.discount ?? null,
    status: row.status,
    createdAt: row.createdAt,
  }));
}
