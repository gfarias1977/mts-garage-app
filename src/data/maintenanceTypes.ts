import { db } from '@/db';
import { maintenanceTypesTable } from '@/db/schema';
import { asc, desc, ilike, or, sql } from 'drizzle-orm';

export type MaintenanceTypeRow = {
  id: string;
  name: string;
  createdAt: Date | null;
  createdBy: string;
  status: string;
};

export type SortColumn = 'id' | 'name' | 'createdAt' | 'createdBy' | 'status';

export type GetMaintenanceTypesResult = {
  rows: MaintenanceTypeRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: maintenanceTypesTable.id,
  name: maintenanceTypesTable.name,
  createdAt: maintenanceTypesTable.createdAt,
  createdBy: maintenanceTypesTable.createdBy,
  status: maintenanceTypesTable.status,
} as const;

export async function getMaintenanceTypes(params: {
  search?: string;
  sortBy?: SortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetMaintenanceTypesResult> {
  const { search, sortBy = 'id', sortDir = 'asc', page = 1, pageSize = 10 } = params;

  const whereClause = search
    ? or(
        ilike(maintenanceTypesTable.id, `%${search}%`),
        ilike(maintenanceTypesTable.name, `%${search}%`),
        ilike(maintenanceTypesTable.createdBy, `%${search}%`),
        ilike(maintenanceTypesTable.status, `%${search}%`),
      )
    : undefined;

  const sortCol = sortColumnMap[sortBy] ?? maintenanceTypesTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(maintenanceTypesTable).where(whereClause),
    db
      .select()
      .from(maintenanceTypesTable)
      .where(whereClause)
      .orderBy(orderClause)
      .limit(pageSize)
      .offset(offset),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    rows: rows.map((row) => ({
      id: row.id,
      name: row.name,
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

export async function getMaintenanceTypeById(id: string): Promise<MaintenanceTypeRow | null> {
  const rows = await db
    .select()
    .from(maintenanceTypesTable)
    .where(sql`${maintenanceTypesTable.id} = ${id}`)
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    status: row.status,
  };
}

export async function createMaintenanceType(input: {
  id: string;
  name: string;
  status: string;
  createdBy: string;
}): Promise<{ id: string }> {
  const [row] = await db
    .insert(maintenanceTypesTable)
    .values({
      id: input.id,
      name: input.name,
      status: input.status,
      createdBy: input.createdBy,
    })
    .returning({ id: maintenanceTypesTable.id });

  return { id: row.id };
}

export async function updateMaintenanceType(
  id: string,
  input: { name?: string; status?: string },
): Promise<void> {
  await db
    .update(maintenanceTypesTable)
    .set(input)
    .where(sql`${maintenanceTypesTable.id} = ${id}`);
}

export async function deleteMaintenanceType(id: string): Promise<void> {
  await db.delete(maintenanceTypesTable).where(sql`${maintenanceTypesTable.id} = ${id}`);
}
