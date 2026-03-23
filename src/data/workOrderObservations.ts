import { db } from '@/db';
import { workOrderObservationsTable } from '@/db/schema';
import { asc, desc, eq, ilike, or, sql, and } from 'drizzle-orm';

export type ObservationRow = {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | null;
  createdBy: string;
};

export type ObservationSortColumn = 'id' | 'authorName' | 'content' | 'createdAt' | 'createdBy';

export type GetObservationsResult = {
  rows: ObservationRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: workOrderObservationsTable.id,
  authorName: workOrderObservationsTable.authorName,
  content: workOrderObservationsTable.content,
  createdAt: workOrderObservationsTable.createdAt,
  createdBy: workOrderObservationsTable.createdBy,
} as const;

export async function getWorkOrderObservationsPaged(params: {
  workOrderId: bigint;
  search?: string;
  sortBy?: ObservationSortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetObservationsResult> {
  const {
    workOrderId,
    search,
    sortBy = 'id',
    sortDir = 'desc',
    page = 1,
    pageSize = 10,
  } = params;

  const baseFilter = eq(workOrderObservationsTable.workOrderId, workOrderId);

  const whereClause = search
    ? and(
        baseFilter,
        or(
          ilike(workOrderObservationsTable.authorName, `%${search}%`),
          ilike(workOrderObservationsTable.content, `%${search}%`),
          ilike(workOrderObservationsTable.createdBy, `%${search}%`),
        ),
      )
    : baseFilter;

  const sortCol = sortColumnMap[sortBy] ?? workOrderObservationsTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(workOrderObservationsTable).where(whereClause),
    db
      .select()
      .from(workOrderObservationsTable)
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
      authorName: row.authorName,
      content: row.content,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
    })),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getWorkOrderObservationById(id: bigint): Promise<ObservationRow | null> {
  const rows = await db
    .select()
    .from(workOrderObservationsTable)
    .where(eq(workOrderObservationsTable.id, id))
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id.toString(),
    authorName: row.authorName,
    content: row.content,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
  };
}

export async function createWorkOrderObservation(
  workOrderId: bigint,
  input: { authorName: string; content: string; createdBy: string },
): Promise<{ id: string }> {
  const [row] = await db
    .insert(workOrderObservationsTable)
    .values({ workOrderId, ...input })
    .returning({ id: workOrderObservationsTable.id });

  return { id: row.id.toString() };
}

export async function updateWorkOrderObservation(
  id: bigint,
  input: { authorName?: string; content?: string },
): Promise<void> {
  await db
    .update(workOrderObservationsTable)
    .set(input)
    .where(eq(workOrderObservationsTable.id, id));
}

export async function deleteWorkOrderObservation(id: bigint): Promise<void> {
  await db.delete(workOrderObservationsTable).where(eq(workOrderObservationsTable.id, id));
}

// Kept for backward compatibility with getWorkOrderObservationsAction
export async function getWorkOrderObservations(workOrderId: bigint) {
  const rows = await db
    .select({
      id: workOrderObservationsTable.id,
      authorName: workOrderObservationsTable.authorName,
      content: workOrderObservationsTable.content,
      createdAt: workOrderObservationsTable.createdAt,
    })
    .from(workOrderObservationsTable)
    .where(eq(workOrderObservationsTable.workOrderId, workOrderId));

  return rows.map((row) => ({
    id: row.id.toString(),
    authorName: row.authorName,
    content: row.content,
    createdAt: row.createdAt,
  }));
}
