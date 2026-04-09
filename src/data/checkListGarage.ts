import { db } from '@/db';
import { checkListGarageTable } from '@/db/schema';
import { asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

export type CheckListGarageRow = {
  id: string;
  description: string;
  createdAt: Date | null;
  createdBy: string;
  status: string;
  hasPlatesWithoutOrders: boolean;
};

export type SortColumn = 'id' | 'description' | 'createdAt' | 'createdBy' | 'status';

export type GetCheckListGarageResult = {
  rows: CheckListGarageRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: checkListGarageTable.id,
  description: checkListGarageTable.description,
  createdAt: checkListGarageTable.createdAt,
  createdBy: checkListGarageTable.createdBy,
  status: checkListGarageTable.status,
} as const;

export async function getCheckListGarage(params: {
  search?: string;
  sortBy?: SortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetCheckListGarageResult> {
  const { search, sortBy = 'id', sortDir = 'asc', page = 1, pageSize = 10 } = params;

  const whereClause = search
    ? or(
        ilike(checkListGarageTable.description, `%${search}%`),
        ilike(checkListGarageTable.createdBy, `%${search}%`),
        ilike(checkListGarageTable.status, `%${search}%`),
      )
    : undefined;

  const sortCol = sortColumnMap[sortBy] ?? checkListGarageTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(checkListGarageTable).where(whereClause),
    db
      .select({
        id: checkListGarageTable.id,
        description: checkListGarageTable.description,
        createdAt: checkListGarageTable.createdAt,
        createdBy: checkListGarageTable.createdBy,
        status: checkListGarageTable.status,
        hasPlatesWithoutOrders: sql<boolean>`exists(
          select 1 from check_list_garage_plates
          where clgp_clg_id = check_list_garage.clg_id
            and wor_veh_plate is not null
            and not exists(
              select 1 from check_list_garage_work_orders
              where clgw_veh_plate = check_list_garage_plates.wor_veh_plate
            )
        )`,
      })
      .from(checkListGarageTable)
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
      description: row.description,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
      status: row.status,
      hasPlatesWithoutOrders: Boolean(row.hasPlatesWithoutOrders),
    })),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getCheckListGarageById(id: bigint): Promise<CheckListGarageRow | null> {
  const rows = await db
    .select()
    .from(checkListGarageTable)
    .where(eq(checkListGarageTable.id, id))
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id.toString(),
    description: row.description,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    status: row.status,
    hasPlatesWithoutOrders: false,
  };
}

export async function createCheckListGarage(input: {
  description: string;
  status: string;
  createdBy: string;
}): Promise<{ id: string }> {
  const [row] = await db
    .insert(checkListGarageTable)
    .values(input)
    .returning({ id: checkListGarageTable.id });

  return { id: row.id.toString() };
}

export async function updateCheckListGarage(
  id: bigint,
  input: { description?: string; status?: string },
): Promise<void> {
  await db
    .update(checkListGarageTable)
    .set(input)
    .where(eq(checkListGarageTable.id, id));
}

export async function deleteCheckListGarage(id: bigint): Promise<void> {
  await db.delete(checkListGarageTable).where(eq(checkListGarageTable.id, id));
}
