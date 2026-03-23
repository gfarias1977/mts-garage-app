import { db } from '@/db';
import { mechanicsTable } from '@/db/schema';
import { asc, desc, ilike, or, sql } from 'drizzle-orm';

export type MechanicRow = {
  id: string;
  name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date | null;
  createdBy: string;
  status: string;
};

export type SortColumn =
  | 'id'
  | 'name'
  | 'address'
  | 'email'
  | 'phone'
  | 'createdAt'
  | 'createdBy'
  | 'status';

export type GetMechanicsResult = {
  rows: MechanicRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: mechanicsTable.id,
  name: mechanicsTable.name,
  address: mechanicsTable.address,
  email: mechanicsTable.email,
  phone: mechanicsTable.phone,
  createdAt: mechanicsTable.createdAt,
  createdBy: mechanicsTable.createdBy,
  status: mechanicsTable.status,
} as const;

export async function getMechanics(params: {
  search?: string;
  sortBy?: SortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetMechanicsResult> {
  const { search, sortBy = 'id', sortDir = 'asc', page = 1, pageSize = 10 } = params;

  const whereClause = search
    ? or(
        ilike(mechanicsTable.id, `%${search}%`),
        ilike(mechanicsTable.name, `%${search}%`),
        ilike(mechanicsTable.address, `%${search}%`),
        ilike(mechanicsTable.email, `%${search}%`),
        ilike(mechanicsTable.phone, `%${search}%`),
        ilike(mechanicsTable.createdBy, `%${search}%`),
        ilike(mechanicsTable.status, `%${search}%`),
      )
    : undefined;

  const sortCol = sortColumnMap[sortBy] ?? mechanicsTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(mechanicsTable).where(whereClause),
    db
      .select()
      .from(mechanicsTable)
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
      address: row.address ?? null,
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

export async function getMechanicById(id: string): Promise<MechanicRow | null> {
  const rows = await db
    .select()
    .from(mechanicsTable)
    .where(sql`${mechanicsTable.id} = ${id}`)
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    status: row.status,
  };
}

export async function createMechanic(input: {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  status: string;
  createdBy: string;
}): Promise<{ id: string }> {
  const [row] = await db
    .insert(mechanicsTable)
    .values({
      id: input.id,
      name: input.name,
      address: input.address ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      status: input.status,
      createdBy: input.createdBy,
    })
    .returning({ id: mechanicsTable.id });

  return { id: row.id };
}

export async function updateMechanic(
  id: string,
  input: {
    name?: string;
    address?: string | null;
    email?: string | null;
    phone?: string | null;
    status?: string;
  },
): Promise<void> {
  await db
    .update(mechanicsTable)
    .set(input)
    .where(sql`${mechanicsTable.id} = ${id}`);
}

export async function deleteMechanic(id: string): Promise<void> {
  await db.delete(mechanicsTable).where(sql`${mechanicsTable.id} = ${id}`);
}
