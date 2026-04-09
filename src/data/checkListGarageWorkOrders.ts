import { db } from '@/db';
import { checkListGarageWorkOrdersTable, workOrdersTable } from '@/db/schema';
import { asc, desc, eq, ilike, or, sql, and, inArray } from 'drizzle-orm';

export type CheckListGarageWorkOrderRow = {
  id: string;
  workOrderId: string;
  clientId: string;
  mechanicId: string | null;
  vehiclePlate: string;
  createdAt: Date | null;
  createdBy: string;
  status: string;
};

export type CheckListGarageWorkOrderSortColumn =
  | 'id'
  | 'workOrderId'
  | 'clientId'
  | 'mechanicId'
  | 'vehiclePlate'
  | 'createdAt'
  | 'createdBy'
  | 'status';

export type GetCheckListGarageWorkOrdersResult = {
  rows: CheckListGarageWorkOrderRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: checkListGarageWorkOrdersTable.id,
  workOrderId: checkListGarageWorkOrdersTable.workOrderId,
  clientId: checkListGarageWorkOrdersTable.clientId,
  mechanicId: checkListGarageWorkOrdersTable.mechanicId,
  vehiclePlate: checkListGarageWorkOrdersTable.vehiclePlate,
  createdAt: checkListGarageWorkOrdersTable.createdAt,
  createdBy: checkListGarageWorkOrdersTable.createdBy,
  status: checkListGarageWorkOrdersTable.status,
} as const;

export async function getCheckListGarageWorkOrdersPaged(params: {
  vehiclePlate: string;
  search?: string;
  sortBy?: CheckListGarageWorkOrderSortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetCheckListGarageWorkOrdersResult> {
  const {
    vehiclePlate,
    search,
    sortBy = 'id',
    sortDir = 'asc',
    page = 1,
    pageSize = 10,
  } = params;

  const baseFilter = eq(checkListGarageWorkOrdersTable.vehiclePlate, vehiclePlate);

  const whereClause = search
    ? and(
        baseFilter,
        or(
          ilike(checkListGarageWorkOrdersTable.clientId, `%${search}%`),
          ilike(checkListGarageWorkOrdersTable.mechanicId, `%${search}%`),
          ilike(checkListGarageWorkOrdersTable.vehiclePlate, `%${search}%`),
          ilike(checkListGarageWorkOrdersTable.createdBy, `%${search}%`),
          ilike(checkListGarageWorkOrdersTable.status, `%${search}%`),
        ),
      )
    : baseFilter;

  const sortCol = sortColumnMap[sortBy] ?? checkListGarageWorkOrdersTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(checkListGarageWorkOrdersTable)
      .where(whereClause),
    db
      .select()
      .from(checkListGarageWorkOrdersTable)
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
      clientId: row.clientId,
      mechanicId: row.mechanicId ?? null,
      vehiclePlate: row.vehiclePlate,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
      status: row.status,
    })),
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Deletes all check_list_garage_work_orders records for the given vehiclePlate.
 */
export async function deleteWorkOrdersForPlate(vehiclePlate: string): Promise<void> {
  await db
    .delete(checkListGarageWorkOrdersTable)
    .where(eq(checkListGarageWorkOrdersTable.vehiclePlate, vehiclePlate));
}

/**
 * Searches work_orders by vehiclePlate and inserts any that are not yet
 * recorded in check_list_garage_work_orders. Safe to call multiple times
 * (skips existing records).
 */
export async function syncWorkOrdersForPlate(
  vehiclePlate: string,
  createdBy: string,
): Promise<number> {
  // 1. Find all work orders for this plate
  const matchingOrders = await db
    .select({
      id: workOrdersTable.id,
      clientId: workOrdersTable.clientId,
      mechanicId: workOrdersTable.mechanicId,
      vehiclePlate: workOrdersTable.vehiclePlate,
      status: workOrdersTable.status,
    })
    .from(workOrdersTable)
    .where(eq(workOrdersTable.vehiclePlate, vehiclePlate));

  if (matchingOrders.length === 0) return 0;

  // 2. Find which work order IDs are already recorded
  const workOrderIds = matchingOrders.map((o) => o.id);
  const existing = await db
    .select({ workOrderId: checkListGarageWorkOrdersTable.workOrderId })
    .from(checkListGarageWorkOrdersTable)
    .where(inArray(checkListGarageWorkOrdersTable.workOrderId, workOrderIds));

  const existingIds = new Set(existing.map((e) => e.workOrderId.toString()));

  // 3. Insert only the missing ones
  const toInsert = matchingOrders.filter(
    (o) => !existingIds.has(o.id.toString()),
  );

  if (toInsert.length === 0) return 0;

  await db.insert(checkListGarageWorkOrdersTable).values(
    toInsert.map((o) => ({
      workOrderId: o.id,
      clientId: o.clientId,
      mechanicId: o.mechanicId ?? null,
      vehiclePlate: o.vehiclePlate,
      createdBy,
      status: o.status,
    })),
  );

  return toInsert.length;
}
