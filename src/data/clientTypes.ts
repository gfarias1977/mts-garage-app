import { db } from '@/db';
import { clientTypesTable } from '@/db/schema';
import { asc, desc, ilike, or, sql } from 'drizzle-orm';

export type ClientTypeRow = {
  id: string;
  name: string;
  createdAt: Date | null;
  createdBy: string;
  status: string;
};

export type SortColumn = 'id' | 'name' | 'createdAt' | 'createdBy' | 'status';

export type GetClientTypesResult = {
  rows: ClientTypeRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: clientTypesTable.id,
  name: clientTypesTable.name,
  createdAt: clientTypesTable.createdAt,
  createdBy: clientTypesTable.createdBy,
  status: clientTypesTable.status,
} as const;

export async function getClientTypes(params: {
  search?: string;
  sortBy?: SortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetClientTypesResult> {
  const { search, sortBy = 'id', sortDir = 'asc', page = 1, pageSize = 10 } = params;

  const whereClause = search
    ? or(
        ilike(clientTypesTable.id, `%${search}%`),
        ilike(clientTypesTable.name, `%${search}%`),
        ilike(clientTypesTable.createdBy, `%${search}%`),
        ilike(clientTypesTable.status, `%${search}%`),
      )
    : undefined;

  const sortCol = sortColumnMap[sortBy] ?? clientTypesTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(clientTypesTable).where(whereClause),
    db
      .select()
      .from(clientTypesTable)
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

export async function getClientTypeById(id: string): Promise<ClientTypeRow | null> {
  const rows = await db
    .select()
    .from(clientTypesTable)
    .where(sql`${clientTypesTable.id} = ${id}`)
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

export async function createClientType(input: {
  id: string;
  name: string;
  status: string;
  createdBy: string;
}): Promise<{ id: string }> {
  const [row] = await db
    .insert(clientTypesTable)
    .values({
      id: input.id,
      name: input.name,
      status: input.status,
      createdBy: input.createdBy,
    })
    .returning({ id: clientTypesTable.id });

  return { id: row.id };
}

export async function updateClientType(
  id: string,
  input: { name?: string; status?: string },
): Promise<void> {
  await db
    .update(clientTypesTable)
    .set(input)
    .where(sql`${clientTypesTable.id} = ${id}`);
}

export async function deleteClientType(id: string): Promise<void> {
  await db.delete(clientTypesTable).where(sql`${clientTypesTable.id} = ${id}`);
}
