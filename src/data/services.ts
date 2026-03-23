import { db } from '@/db';
import { servicesTable, serviceCategoriesTable } from '@/db/schema';
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

export type ServiceRow = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string | null;
  createdAt: Date | null;
  createdBy: string;
  status: string;
};

export type SortColumn =
  | 'id'
  | 'categoryName'
  | 'name'
  | 'description'
  | 'createdAt'
  | 'createdBy'
  | 'status';

export type GetServicesResult = {
  rows: ServiceRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: servicesTable.id,
  categoryName: serviceCategoriesTable.name,
  name: servicesTable.name,
  description: servicesTable.description,
  createdAt: servicesTable.createdAt,
  createdBy: servicesTable.createdBy,
  status: servicesTable.status,
} as const;

export async function getServices(params: {
  userId: bigint;
  search?: string;
  sortBy?: SortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetServicesResult> {
  const { userId, search, sortBy = 'id', sortDir = 'asc', page = 1, pageSize = 10 } = params;

  const userFilter = eq(servicesTable.userId, userId);

  const whereClause = search
    ? and(
        userFilter,
        or(
          ilike(serviceCategoriesTable.name, `%${search}%`),
          ilike(servicesTable.name, `%${search}%`),
          ilike(servicesTable.description, `%${search}%`),
          ilike(servicesTable.createdBy, `%${search}%`),
          ilike(servicesTable.status, `%${search}%`),
        ),
      )
    : userFilter;

  const sortCol = sortColumnMap[sortBy] ?? servicesTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(servicesTable)
      .leftJoin(serviceCategoriesTable, eq(servicesTable.categoryId, serviceCategoriesTable.id))
      .where(whereClause),
    db
      .select({
        id: servicesTable.id,
        categoryId: servicesTable.categoryId,
        categoryName: serviceCategoriesTable.name,
        name: servicesTable.name,
        description: servicesTable.description,
        createdAt: servicesTable.createdAt,
        createdBy: servicesTable.createdBy,
        status: servicesTable.status,
      })
      .from(servicesTable)
      .leftJoin(serviceCategoriesTable, eq(servicesTable.categoryId, serviceCategoriesTable.id))
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
      categoryId: row.categoryId.toString(),
      categoryName: row.categoryName ?? '',
      name: row.name,
      description: row.description ?? null,
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

export async function getServiceById(
  id: bigint,
  userId: bigint,
): Promise<ServiceRow | null> {
  const rows = await db
    .select({
      id: servicesTable.id,
      categoryId: servicesTable.categoryId,
      categoryName: serviceCategoriesTable.name,
      name: servicesTable.name,
      description: servicesTable.description,
      createdAt: servicesTable.createdAt,
      createdBy: servicesTable.createdBy,
      status: servicesTable.status,
    })
    .from(servicesTable)
    .leftJoin(serviceCategoriesTable, eq(servicesTable.categoryId, serviceCategoriesTable.id))
    .where(and(eq(servicesTable.id, id), eq(servicesTable.userId, userId)))
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id.toString(),
    categoryId: row.categoryId.toString(),
    categoryName: row.categoryName ?? '',
    name: row.name,
    description: row.description ?? null,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    status: row.status,
  };
}

export async function createService(
  userId: bigint,
  input: {
    categoryId: bigint;
    name: string;
    description?: string;
    status: string;
    createdBy: string;
  },
): Promise<{ id: string }> {
  const [row] = await db
    .insert(servicesTable)
    .values({
      userId,
      categoryId: input.categoryId,
      name: input.name,
      description: input.description ?? null,
      status: input.status,
      createdBy: input.createdBy,
    })
    .returning({ id: servicesTable.id });

  return { id: row.id.toString() };
}

export async function updateService(
  id: bigint,
  userId: bigint,
  input: {
    categoryId?: bigint;
    name?: string;
    description?: string | null;
    status?: string;
  },
): Promise<void> {
  await db
    .update(servicesTable)
    .set(input)
    .where(and(eq(servicesTable.id, id), eq(servicesTable.userId, userId)));
}

export async function deleteService(id: bigint, userId: bigint): Promise<void> {
  await db
    .delete(servicesTable)
    .where(and(eq(servicesTable.id, id), eq(servicesTable.userId, userId)));
}
