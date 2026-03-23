import { db } from '@/db';
import { sparePartsTable, workOrderServicesTable, servicesTable } from '@/db/schema';
import { asc, desc, eq, ilike, or, sql, and } from 'drizzle-orm';

export type SparePartRow = {
  id: string;
  workOrderId: string;
  serviceId: string;
  serviceName: string;
  description: string;
  cost: string;
  status: string;
  createdAt: Date | null;
  createdBy: string;
};

export type SparePartSortColumn =
  | 'id'
  | 'serviceId'
  | 'description'
  | 'cost'
  | 'status'
  | 'createdAt'
  | 'createdBy';

export type GetSparePartsResult = {
  rows: SparePartRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: sparePartsTable.id,
  serviceId: sparePartsTable.serviceId,
  description: sparePartsTable.description,
  cost: sparePartsTable.cost,
  status: sparePartsTable.status,
  createdAt: sparePartsTable.createdAt,
  createdBy: sparePartsTable.createdBy,
} as const;

export async function getWorkOrderSparePartsPaged(params: {
  workOrderId: bigint;
  search?: string;
  sortBy?: SparePartSortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetSparePartsResult> {
  const {
    workOrderId,
    search,
    sortBy = 'id',
    sortDir = 'desc',
    page = 1,
    pageSize = 10,
  } = params;

  const baseFilter = eq(sparePartsTable.workOrderId, workOrderId);

  const whereClause = search
    ? and(
        baseFilter,
        or(
          ilike(sparePartsTable.description, `%${search}%`),
          ilike(sparePartsTable.createdBy, `%${search}%`),
          ilike(sparePartsTable.status, `%${search}%`),
          ilike(sparePartsTable.cost, `%${search}%`),
        ),
      )
    : baseFilter;

  const sortCol = sortColumnMap[sortBy] ?? sparePartsTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(sparePartsTable).where(whereClause),
    db
      .select({
        id: sparePartsTable.id,
        workOrderId: sparePartsTable.workOrderId,
        serviceId: sparePartsTable.serviceId,
        serviceName: servicesTable.name,
        description: sparePartsTable.description,
        cost: sparePartsTable.cost,
        status: sparePartsTable.status,
        createdAt: sparePartsTable.createdAt,
        createdBy: sparePartsTable.createdBy,
      })
      .from(sparePartsTable)
      .leftJoin(workOrderServicesTable, eq(sparePartsTable.serviceId, workOrderServicesTable.id))
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
      description: row.description,
      cost: row.cost,
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

export async function getWorkOrderSparePartById(id: bigint): Promise<SparePartRow | null> {
  const rows = await db
    .select({
      id: sparePartsTable.id,
      workOrderId: sparePartsTable.workOrderId,
      serviceId: sparePartsTable.serviceId,
      serviceName: servicesTable.name,
      description: sparePartsTable.description,
      cost: sparePartsTable.cost,
      status: sparePartsTable.status,
      createdAt: sparePartsTable.createdAt,
      createdBy: sparePartsTable.createdBy,
    })
    .from(sparePartsTable)
    .leftJoin(workOrderServicesTable, eq(sparePartsTable.serviceId, workOrderServicesTable.id))
    .leftJoin(servicesTable, eq(workOrderServicesTable.serviceId, servicesTable.id))
    .where(eq(sparePartsTable.id, id))
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id.toString(),
    workOrderId: row.workOrderId.toString(),
    serviceId: row.serviceId.toString(),
    serviceName: row.serviceName ?? '',
    description: row.description,
    cost: row.cost,
    status: row.status,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
  };
}

export async function createWorkOrderSparePart(
  workOrderId: bigint,
  input: {
    serviceId: bigint;
    description: string;
    cost: string;
    status: string;
    createdBy: string;
  },
): Promise<{ id: string }> {
  const [row] = await db
    .insert(sparePartsTable)
    .values({ workOrderId, ...input })
    .returning({ id: sparePartsTable.id });

  return { id: row.id.toString() };
}

export async function updateWorkOrderSparePart(
  id: bigint,
  input: {
    serviceId?: bigint;
    description?: string;
    cost?: string;
    status?: string;
  },
): Promise<void> {
  await db.update(sparePartsTable).set(input).where(eq(sparePartsTable.id, id));
}

export async function deleteWorkOrderSparePart(id: bigint): Promise<void> {
  await db.delete(sparePartsTable).where(eq(sparePartsTable.id, id));
}

export async function getSparePartsByWorkOrderServicePaged(params: {
  workOrderServiceId: bigint;
  search?: string;
  sortBy?: SparePartSortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetSparePartsResult> {
  const {
    workOrderServiceId,
    search,
    sortBy = 'id',
    sortDir = 'desc',
    page = 1,
    pageSize = 10,
  } = params;

  const baseFilter = eq(sparePartsTable.serviceId, workOrderServiceId);

  const whereClause = search
    ? and(
        baseFilter,
        or(
          ilike(sparePartsTable.description, `%${search}%`),
          ilike(sparePartsTable.createdBy, `%${search}%`),
          ilike(sparePartsTable.status, `%${search}%`),
          ilike(sparePartsTable.cost, `%${search}%`),
        ),
      )
    : baseFilter;

  const sortCol = sortColumnMap[sortBy] ?? sparePartsTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(sparePartsTable).where(whereClause),
    db
      .select({
        id: sparePartsTable.id,
        workOrderId: sparePartsTable.workOrderId,
        serviceId: sparePartsTable.serviceId,
        serviceName: servicesTable.name,
        description: sparePartsTable.description,
        cost: sparePartsTable.cost,
        status: sparePartsTable.status,
        createdAt: sparePartsTable.createdAt,
        createdBy: sparePartsTable.createdBy,
      })
      .from(sparePartsTable)
      .leftJoin(workOrderServicesTable, eq(sparePartsTable.serviceId, workOrderServicesTable.id))
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
      description: row.description,
      cost: row.cost,
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

// Kept for backward compatibility with getWorkOrderSparePartsAction
export async function getWorkOrderSpareParts(workOrderId: bigint) {
  const rows = await db
    .select({
      id: sparePartsTable.id,
      description: sparePartsTable.description,
      cost: sparePartsTable.cost,
      status: sparePartsTable.status,
      createdAt: sparePartsTable.createdAt,
    })
    .from(sparePartsTable)
    .where(eq(sparePartsTable.workOrderId, workOrderId));

  return rows.map((row) => ({
    id: row.id.toString(),
    description: row.description,
    cost: row.cost,
    status: row.status,
    createdAt: row.createdAt,
  }));
}
