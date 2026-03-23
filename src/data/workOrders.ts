import { db } from '@/db';
import {
  workOrdersTable,
  clientsTable,
  mechanicsTable,
  vehiclesTable,
  maintenanceTypesTable,
  workOrdersStatusTable,
} from '@/db/schema';
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

export type WorkOrderRow = {
  id: string;
  code: string;
  clientName: string;
  mechanicName: string | null;
  vehiclePlate: string;
  maintenanceTypeName: string;
  statusCode: string;
  statusDescription: string;
  createdAt: Date | null;
};

export type WorkOrderDetail = WorkOrderRow & {
  clientId: string;
  mechanicId: string | null;
  maintenanceTypeId: string;
};

export type SortColumn =
  | 'id'
  | 'code'
  | 'clientName'
  | 'mechanicName'
  | 'vehiclePlate'
  | 'maintenanceTypeName'
  | 'statusDescription'
  | 'createdAt';

export type GetWorkOrdersResult = {
  rows: WorkOrderRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: workOrdersTable.id,
  code: workOrdersTable.code,
  clientName: clientsTable.name,
  mechanicName: mechanicsTable.name,
  vehiclePlate: workOrdersTable.vehiclePlate,
  maintenanceTypeName: maintenanceTypesTable.name,
  statusDescription: workOrdersStatusTable.description,
  createdAt: workOrdersTable.createdAt,
} as const;

export async function getWorkOrders(params: {
  userId: bigint;
  search?: string;
  sortBy?: SortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetWorkOrdersResult> {
  const { userId, search, sortBy = 'id', sortDir = 'desc', page = 1, pageSize = 10 } = params;

  const searchCondition = search
    ? or(
        ilike(workOrdersTable.code, `%${search}%`),
        ilike(clientsTable.name, `%${search}%`),
        ilike(mechanicsTable.name, `%${search}%`),
        ilike(workOrdersTable.vehiclePlate, `%${search}%`),
        ilike(maintenanceTypesTable.name, `%${search}%`),
        ilike(workOrdersStatusTable.description, `%${search}%`),
      )
    : undefined;

  const whereClause = searchCondition
    ? and(eq(workOrdersTable.userId, userId), searchCondition)
    : eq(workOrdersTable.userId, userId);

  const sortCol = sortColumnMap[sortBy] ?? workOrdersTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);

  const offset = (page - 1) * pageSize;

  const baseQuery = db
    .select({
      id: workOrdersTable.id,
      code: workOrdersTable.code,
      clientName: clientsTable.name,
      mechanicName: mechanicsTable.name,
      vehiclePlate: workOrdersTable.vehiclePlate,
      maintenanceTypeName: maintenanceTypesTable.name,
      statusCode: workOrdersTable.status,
      statusDescription: workOrdersStatusTable.description,
      createdAt: workOrdersTable.createdAt,
    })
    .from(workOrdersTable)
    .leftJoin(clientsTable, eq(workOrdersTable.clientId, clientsTable.id))
    .leftJoin(mechanicsTable, eq(workOrdersTable.mechanicId, mechanicsTable.id))
    .leftJoin(vehiclesTable, eq(workOrdersTable.vehiclePlate, vehiclesTable.id))
    .leftJoin(maintenanceTypesTable, eq(workOrdersTable.maintenanceType, maintenanceTypesTable.id))
    .leftJoin(workOrdersStatusTable, eq(workOrdersTable.status, workOrdersStatusTable.id));

  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(workOrdersTable)
    .leftJoin(clientsTable, eq(workOrdersTable.clientId, clientsTable.id))
    .leftJoin(mechanicsTable, eq(workOrdersTable.mechanicId, mechanicsTable.id))
    .leftJoin(vehiclesTable, eq(workOrdersTable.vehiclePlate, vehiclesTable.id))
    .leftJoin(maintenanceTypesTable, eq(workOrdersTable.maintenanceType, maintenanceTypesTable.id))
    .leftJoin(workOrdersStatusTable, eq(workOrdersTable.status, workOrdersStatusTable.id))
    .where(whereClause);

  const dataQuery = baseQuery
    .where(whereClause)
    .orderBy(orderClause)
    .limit(pageSize)
    .offset(offset);

  const [countResult, rows] = await Promise.all([countQuery, dataQuery]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    rows: rows.map((row) => ({
      id: row.id.toString(),
      code: row.code,
      clientName: row.clientName ?? '',
      mechanicName: row.mechanicName ?? null,
      vehiclePlate: row.vehiclePlate,
      maintenanceTypeName: row.maintenanceTypeName ?? '',
      statusCode: row.statusCode,
      statusDescription: row.statusDescription ?? '',
      createdAt: row.createdAt,
    })),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getWorkOrderById(
  id: bigint,
  userId: bigint,
): Promise<WorkOrderDetail | null> {
  const rows = await db
    .select({
      id: workOrdersTable.id,
      code: workOrdersTable.code,
      clientId: workOrdersTable.clientId,
      clientName: clientsTable.name,
      mechanicId: workOrdersTable.mechanicId,
      mechanicName: mechanicsTable.name,
      vehiclePlate: workOrdersTable.vehiclePlate,
      maintenanceTypeId: workOrdersTable.maintenanceType,
      maintenanceTypeName: maintenanceTypesTable.name,
      statusCode: workOrdersTable.status,
      statusDescription: workOrdersStatusTable.description,
      createdAt: workOrdersTable.createdAt,
    })
    .from(workOrdersTable)
    .leftJoin(clientsTable, eq(workOrdersTable.clientId, clientsTable.id))
    .leftJoin(mechanicsTable, eq(workOrdersTable.mechanicId, mechanicsTable.id))
    .leftJoin(vehiclesTable, eq(workOrdersTable.vehiclePlate, vehiclesTable.id))
    .leftJoin(maintenanceTypesTable, eq(workOrdersTable.maintenanceType, maintenanceTypesTable.id))
    .leftJoin(workOrdersStatusTable, eq(workOrdersTable.status, workOrdersStatusTable.id))
    .where(and(eq(workOrdersTable.id, id), eq(workOrdersTable.userId, userId)))
    .limit(1);

  if (!rows[0]) return null;

  const row = rows[0];
  return {
    id: row.id.toString(),
    code: row.code,
    clientId: row.clientId,
    clientName: row.clientName ?? '',
    mechanicId: row.mechanicId ?? null,
    mechanicName: row.mechanicName ?? null,
    vehiclePlate: row.vehiclePlate,
    maintenanceTypeId: row.maintenanceTypeId,
    maintenanceTypeName: row.maintenanceTypeName ?? '',
    statusCode: row.statusCode,
    statusDescription: row.statusDescription ?? '',
    createdAt: row.createdAt,
  };
}

export async function createWorkOrder(
  userId: bigint,
  input: {
    code: string;
    clientId: string;
    mechanicId?: string;
    vehiclePlate: string;
    maintenanceType: string;
    status: string;
    createdBy: string;
  },
): Promise<{ id: string }> {
  const [row] = await db
    .insert(workOrdersTable)
    .values({
      userId,
      code: input.code,
      clientId: input.clientId,
      mechanicId: input.mechanicId ?? null,
      vehiclePlate: input.vehiclePlate,
      maintenanceType: input.maintenanceType,
      status: input.status,
      createdBy: input.createdBy,
    })
    .returning({ id: workOrdersTable.id });

  return { id: row.id.toString() };
}

export async function updateWorkOrder(
  id: bigint,
  userId: bigint,
  input: {
    code?: string;
    clientId?: string;
    mechanicId?: string | null;
    vehiclePlate?: string;
    maintenanceType?: string;
    status?: string;
  },
): Promise<void> {
  await db
    .update(workOrdersTable)
    .set(input)
    .where(and(eq(workOrdersTable.id, id), eq(workOrdersTable.userId, userId)));
}

export async function deleteWorkOrder(id: bigint, userId: bigint): Promise<void> {
  await db
    .delete(workOrdersTable)
    .where(and(eq(workOrdersTable.id, id), eq(workOrdersTable.userId, userId)));
}
