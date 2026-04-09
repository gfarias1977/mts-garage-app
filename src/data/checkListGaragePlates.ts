import { db } from '@/db';
import { checkListGaragePlatesTable } from '@/db/schema';
import { asc, desc, eq, ilike, or, sql, and } from 'drizzle-orm';

export type CheckListGaragePlateRow = {
  id: string;
  vehiclePlate: string | null;
  createdAt: Date | null;
  createdBy: string;
  status: string;
  workOrderCount: number;
};

export type CheckListGaragePlateSortColumn =
  | 'id'
  | 'vehiclePlate'
  | 'createdAt'
  | 'createdBy'
  | 'status';

export type GetCheckListGaragePlatesResult = {
  rows: CheckListGaragePlateRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: checkListGaragePlatesTable.id,
  vehiclePlate: checkListGaragePlatesTable.vehiclePlate,
  createdAt: checkListGaragePlatesTable.createdAt,
  createdBy: checkListGaragePlatesTable.createdBy,
  status: checkListGaragePlatesTable.status,
} as const;

export async function getCheckListGaragePlatesPaged(params: {
  checkListGarageId: bigint;
  search?: string;
  sortBy?: CheckListGaragePlateSortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetCheckListGaragePlatesResult> {
  const {
    checkListGarageId,
    search,
    sortBy = 'id',
    sortDir = 'asc',
    page = 1,
    pageSize = 10,
  } = params;

  const baseFilter = eq(checkListGaragePlatesTable.checkListGarageId, checkListGarageId);

  const whereClause = search
    ? and(
        baseFilter,
        or(
          ilike(checkListGaragePlatesTable.vehiclePlate, `%${search}%`),
          ilike(checkListGaragePlatesTable.createdBy, `%${search}%`),
          ilike(checkListGaragePlatesTable.status, `%${search}%`),
        ),
      )
    : baseFilter;

  const sortCol = sortColumnMap[sortBy] ?? checkListGaragePlatesTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(checkListGaragePlatesTable).where(whereClause),
    db
      .select({
        id: checkListGaragePlatesTable.id,
        vehiclePlate: checkListGaragePlatesTable.vehiclePlate,
        createdAt: checkListGaragePlatesTable.createdAt,
        createdBy: checkListGaragePlatesTable.createdBy,
        status: checkListGaragePlatesTable.status,
        workOrderCount: sql<number>`(
          select count(*)::int
          from check_list_garage_work_orders
          where clgw_veh_plate = check_list_garage_plates.wor_veh_plate
        )`,
      })
      .from(checkListGaragePlatesTable)
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
      vehiclePlate: row.vehiclePlate ?? null,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
      status: row.status,
      workOrderCount: row.workOrderCount ?? 0,
    })),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getCheckListGaragePlateById(
  id: string,
): Promise<CheckListGaragePlateRow | null> {
  const rows = await db
    .select()
    .from(checkListGaragePlatesTable)
    .where(eq(checkListGaragePlatesTable.id, BigInt(id)))
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id.toString(),
    vehiclePlate: row.vehiclePlate ?? null,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    status: row.status,
    workOrderCount: 0,
  };
}

export async function createCheckListGaragePlate(
  checkListGarageId: bigint,
  input: { vehiclePlate?: string; status: string; createdBy: string },
): Promise<{ id: string }> {
  const [row] = await db
    .insert(checkListGaragePlatesTable)
    .values({ checkListGarageId, ...input })
    .returning({ id: checkListGaragePlatesTable.id });

  return { id: row.id.toString() };
}

export async function updateCheckListGaragePlate(
  id: string,
  input: { vehiclePlate?: string | null; status?: string },
): Promise<void> {
  await db
    .update(checkListGaragePlatesTable)
    .set(input)
    .where(eq(checkListGaragePlatesTable.id, BigInt(id)));
}

export async function deleteCheckListGaragePlate(id: string): Promise<void> {
  await db
    .delete(checkListGaragePlatesTable)
    .where(eq(checkListGaragePlatesTable.id, BigInt(id)));
}
