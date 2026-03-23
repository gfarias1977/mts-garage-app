import { db } from '@/db';
import { vehiclesTable, clientsTable } from '@/db/schema';
import { asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

export type VehicleRow = {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date | null;
  createdBy: string;
  status: string;
};

export type SortColumn =
  | 'id'
  | 'clientName'
  | 'name'
  | 'email'
  | 'phone'
  | 'createdAt'
  | 'createdBy'
  | 'status';

export type GetVehiclesResult = {
  rows: VehicleRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: vehiclesTable.id,
  clientName: clientsTable.name,
  name: vehiclesTable.name,
  email: vehiclesTable.email,
  phone: vehiclesTable.phone,
  createdAt: vehiclesTable.createdAt,
  createdBy: vehiclesTable.createdBy,
  status: vehiclesTable.status,
} as const;

export async function getVehicles(params: {
  search?: string;
  sortBy?: SortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetVehiclesResult> {
  const { search, sortBy = 'id', sortDir = 'asc', page = 1, pageSize = 10 } = params;

  const whereClause = search
    ? or(
        ilike(vehiclesTable.id, `%${search}%`),
        ilike(vehiclesTable.name, `%${search}%`),
        ilike(clientsTable.name, `%${search}%`),
        ilike(vehiclesTable.email, `%${search}%`),
        ilike(vehiclesTable.phone, `%${search}%`),
        ilike(vehiclesTable.createdBy, `%${search}%`),
        ilike(vehiclesTable.status, `%${search}%`),
      )
    : undefined;

  const sortCol = sortColumnMap[sortBy] ?? vehiclesTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(vehiclesTable)
      .leftJoin(clientsTable, eq(vehiclesTable.clientId, clientsTable.id))
      .where(whereClause),
    db
      .select({
        id: vehiclesTable.id,
        clientId: vehiclesTable.clientId,
        clientName: clientsTable.name,
        name: vehiclesTable.name,
        email: vehiclesTable.email,
        phone: vehiclesTable.phone,
        createdAt: vehiclesTable.createdAt,
        createdBy: vehiclesTable.createdBy,
        status: vehiclesTable.status,
      })
      .from(vehiclesTable)
      .leftJoin(clientsTable, eq(vehiclesTable.clientId, clientsTable.id))
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
      clientId: row.clientId,
      clientName: row.clientName ?? '',
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

export async function getVehicleById(id: string): Promise<VehicleRow | null> {
  const rows = await db
    .select({
      id: vehiclesTable.id,
      clientId: vehiclesTable.clientId,
      clientName: clientsTable.name,
      name: vehiclesTable.name,
      email: vehiclesTable.email,
      phone: vehiclesTable.phone,
      createdAt: vehiclesTable.createdAt,
      createdBy: vehiclesTable.createdBy,
      status: vehiclesTable.status,
    })
    .from(vehiclesTable)
    .leftJoin(clientsTable, eq(vehiclesTable.clientId, clientsTable.id))
    .where(sql`${vehiclesTable.id} = ${id}`)
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id,
    clientId: row.clientId,
    clientName: row.clientName ?? '',
    name: row.name,
    email: row.email ?? null,
    phone: row.phone ?? null,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    status: row.status,
  };
}

export async function createVehicle(input: {
  id: string;
  clientId: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  createdBy: string;
}): Promise<{ id: string }> {
  const [row] = await db
    .insert(vehiclesTable)
    .values({
      id: input.id,
      clientId: input.clientId,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      status: input.status,
      createdBy: input.createdBy,
    })
    .returning({ id: vehiclesTable.id });

  return { id: row.id };
}

export async function updateVehicle(
  id: string,
  input: {
    clientId?: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
    status?: string;
  },
): Promise<void> {
  await db
    .update(vehiclesTable)
    .set(input)
    .where(sql`${vehiclesTable.id} = ${id}`);
}

export async function deleteVehicle(id: string): Promise<void> {
  await db.delete(vehiclesTable).where(sql`${vehiclesTable.id} = ${id}`);
}
