import { db } from '@/db';
import { serviceCategoriesTable } from '@/db/schema';
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

export type ServiceCategoryRow = {
  id: string;
  name: string;
  createdAt: Date | null;
  createdBy: string;
  status: string;
};

export type SortColumn = 'id' | 'name' | 'createdAt' | 'createdBy' | 'status';

export type GetServiceCategoriesResult = {
  rows: ServiceCategoryRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: serviceCategoriesTable.id,
  name: serviceCategoriesTable.name,
  createdAt: serviceCategoriesTable.createdAt,
  createdBy: serviceCategoriesTable.createdBy,
  status: serviceCategoriesTable.status,
} as const;

export async function getServiceCategories(params: {
  userId: bigint;
  search?: string;
  sortBy?: SortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetServiceCategoriesResult> {
  const { userId, search, sortBy = 'id', sortDir = 'asc', page = 1, pageSize = 10 } = params;

  const userFilter = eq(serviceCategoriesTable.userId, userId);

  const whereClause = search
    ? and(
        userFilter,
        or(
          ilike(serviceCategoriesTable.name, `%${search}%`),
          ilike(serviceCategoriesTable.createdBy, `%${search}%`),
          ilike(serviceCategoriesTable.status, `%${search}%`),
        ),
      )
    : userFilter;

  const sortCol = sortColumnMap[sortBy] ?? serviceCategoriesTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(serviceCategoriesTable).where(whereClause),
    db
      .select()
      .from(serviceCategoriesTable)
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

export async function getServiceCategoryById(
  id: bigint,
  userId: bigint,
): Promise<ServiceCategoryRow | null> {
  const rows = await db
    .select()
    .from(serviceCategoriesTable)
    .where(and(eq(serviceCategoriesTable.id, id), eq(serviceCategoriesTable.userId, userId)))
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id.toString(),
    name: row.name,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    status: row.status,
  };
}

export async function createServiceCategory(
  userId: bigint,
  input: { name: string; status: string; createdBy: string },
): Promise<{ id: string }> {
  const [row] = await db
    .insert(serviceCategoriesTable)
    .values({
      userId,
      name: input.name,
      status: input.status,
      createdBy: input.createdBy,
    })
    .returning({ id: serviceCategoriesTable.id });

  return { id: row.id.toString() };
}

export async function updateServiceCategory(
  id: bigint,
  userId: bigint,
  input: { name?: string; status?: string },
): Promise<void> {
  await db
    .update(serviceCategoriesTable)
    .set(input)
    .where(and(eq(serviceCategoriesTable.id, id), eq(serviceCategoriesTable.userId, userId)));
}

export async function deleteServiceCategory(id: bigint, userId: bigint): Promise<void> {
  await db
    .delete(serviceCategoriesTable)
    .where(and(eq(serviceCategoriesTable.id, id), eq(serviceCategoriesTable.userId, userId)));
}
