import { db } from '@/db';
import { clientsTable, clientTypesTable } from '@/db/schema';
import { asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

export type ClientRow = {
  id: string;
  clientType: string;
  clientTypeName: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date | null;
  createdBy: string;
  status: string;
};

export type SortColumn =
  | 'id'
  | 'clientTypeName'
  | 'name'
  | 'email'
  | 'phone'
  | 'createdAt'
  | 'createdBy'
  | 'status';

export type GetClientsResult = {
  rows: ClientRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: clientsTable.id,
  clientTypeName: clientTypesTable.name,
  name: clientsTable.name,
  email: clientsTable.email,
  phone: clientsTable.phone,
  createdAt: clientsTable.createdAt,
  createdBy: clientsTable.createdBy,
  status: clientsTable.status,
} as const;

export async function getClients(params: {
  search?: string;
  sortBy?: SortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetClientsResult> {
  const { search, sortBy = 'id', sortDir = 'asc', page = 1, pageSize = 10 } = params;

  const whereClause = search
    ? or(
        ilike(clientsTable.id, `%${search}%`),
        ilike(clientsTable.name, `%${search}%`),
        ilike(clientTypesTable.name, `%${search}%`),
        ilike(clientsTable.email, `%${search}%`),
        ilike(clientsTable.phone, `%${search}%`),
        ilike(clientsTable.createdBy, `%${search}%`),
        ilike(clientsTable.status, `%${search}%`),
      )
    : undefined;

  const sortCol = sortColumnMap[sortBy] ?? clientsTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const baseFrom = db
    .select({
      id: clientsTable.id,
      clientType: clientsTable.clientType,
      clientTypeName: clientTypesTable.name,
      name: clientsTable.name,
      email: clientsTable.email,
      phone: clientsTable.phone,
      createdAt: clientsTable.createdAt,
      createdBy: clientsTable.createdBy,
      status: clientsTable.status,
    })
    .from(clientsTable)
    .leftJoin(clientTypesTable, eq(clientsTable.clientType, clientTypesTable.id));

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(clientsTable)
      .leftJoin(clientTypesTable, eq(clientsTable.clientType, clientTypesTable.id))
      .where(whereClause),
    baseFrom.where(whereClause).orderBy(orderClause).limit(pageSize).offset(offset),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    rows: rows.map((row) => ({
      id: row.id,
      clientType: row.clientType,
      clientTypeName: row.clientTypeName ?? '',
      name: row.name,
      email: row.email ?? null,
      phone: row.phone ?? null,
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

export async function getClientById(id: string): Promise<ClientRow | null> {
  const rows = await db
    .select({
      id: clientsTable.id,
      clientType: clientsTable.clientType,
      clientTypeName: clientTypesTable.name,
      name: clientsTable.name,
      email: clientsTable.email,
      phone: clientsTable.phone,
      createdAt: clientsTable.createdAt,
      createdBy: clientsTable.createdBy,
      status: clientsTable.status,
    })
    .from(clientsTable)
    .leftJoin(clientTypesTable, eq(clientsTable.clientType, clientTypesTable.id))
    .where(sql`${clientsTable.id} = ${id}`)
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id,
    clientType: row.clientType,
    clientTypeName: row.clientTypeName ?? '',
    name: row.name,
    email: row.email ?? null,
    phone: row.phone ?? null,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    status: row.status,
  };
}

export async function createClient(input: {
  id: string;
  clientType: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  createdBy: string;
}): Promise<{ id: string }> {
  const [row] = await db
    .insert(clientsTable)
    .values({
      id: input.id,
      clientType: input.clientType,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      status: input.status,
      createdBy: input.createdBy,
    })
    .returning({ id: clientsTable.id });

  return { id: row.id };
}

export async function updateClient(
  id: string,
  input: {
    clientType?: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
    status?: string;
  },
): Promise<void> {
  await db
    .update(clientsTable)
    .set(input)
    .where(sql`${clientsTable.id} = ${id}`);
}

export async function deleteClient(id: string): Promise<void> {
  await db.delete(clientsTable).where(sql`${clientsTable.id} = ${id}`);
}
