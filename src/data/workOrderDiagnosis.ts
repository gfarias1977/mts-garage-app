import { db } from '@/db';
import { workOrderDiagnosisTable } from '@/db/schema';
import { asc, desc, eq, ilike, or, sql, and } from 'drizzle-orm';

export type DiagnosisRow = {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | null;
  createdBy: string;
};

export type DiagnosisSortColumn = 'id' | 'authorName' | 'content' | 'createdAt' | 'createdBy';

export type GetDiagnosisResult = {
  rows: DiagnosisRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const sortColumnMap = {
  id: workOrderDiagnosisTable.id,
  authorName: workOrderDiagnosisTable.authorName,
  content: workOrderDiagnosisTable.content,
  createdAt: workOrderDiagnosisTable.createdAt,
  createdBy: workOrderDiagnosisTable.createdBy,
} as const;

export async function getWorkOrderDiagnosisPaged(params: {
  workOrderId: bigint;
  search?: string;
  sortBy?: DiagnosisSortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetDiagnosisResult> {
  const {
    workOrderId,
    search,
    sortBy = 'id',
    sortDir = 'desc',
    page = 1,
    pageSize = 10,
  } = params;

  const baseFilter = eq(workOrderDiagnosisTable.workOrderId, workOrderId);

  const whereClause = search
    ? and(
        baseFilter,
        or(
          ilike(workOrderDiagnosisTable.authorName, `%${search}%`),
          ilike(workOrderDiagnosisTable.content, `%${search}%`),
          ilike(workOrderDiagnosisTable.createdBy, `%${search}%`),
        ),
      )
    : baseFilter;

  const sortCol = sortColumnMap[sortBy] ?? workOrderDiagnosisTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(workOrderDiagnosisTable).where(whereClause),
    db
      .select()
      .from(workOrderDiagnosisTable)
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

export async function getWorkOrderDiagnosisById(id: bigint): Promise<DiagnosisRow | null> {
  const rows = await db
    .select()
    .from(workOrderDiagnosisTable)
    .where(eq(workOrderDiagnosisTable.id, id))
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

export async function createWorkOrderDiagnosis(
  workOrderId: bigint,
  input: { authorName: string; content: string; createdBy: string },
): Promise<{ id: string }> {
  const [row] = await db
    .insert(workOrderDiagnosisTable)
    .values({ workOrderId, ...input })
    .returning({ id: workOrderDiagnosisTable.id });

  return { id: row.id.toString() };
}

export async function updateWorkOrderDiagnosis(
  id: bigint,
  input: { authorName?: string; content?: string },
): Promise<void> {
  await db
    .update(workOrderDiagnosisTable)
    .set(input)
    .where(eq(workOrderDiagnosisTable.id, id));
}

export async function deleteWorkOrderDiagnosis(id: bigint): Promise<void> {
  await db.delete(workOrderDiagnosisTable).where(eq(workOrderDiagnosisTable.id, id));
}
