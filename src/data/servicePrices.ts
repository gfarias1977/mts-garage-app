import { db } from '@/db';
import { servicePricesTable, servicesTable } from '@/db/schema';
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

export type ServicePriceRow = {
  id: string;
  serviceId: string;
  price: string;
  estimatedHourlyRate: string | null;
  currency: string;
  isCurrent: boolean;
  createdAt: Date | null;
  createdBy: string;
};

export type SortColumn =
  | 'id'
  | 'price'
  | 'estimatedHourlyRate'
  | 'currency'
  | 'isCurrent'
  | 'createdAt'
  | 'createdBy';

export type GetServicePricesResult = {
  rows: ServicePriceRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  serviceName: string;
};

const sortColumnMap = {
  id: servicePricesTable.id,
  price: servicePricesTable.price,
  estimatedHourlyRate: servicePricesTable.estimatedHourlyRate,
  currency: servicePricesTable.currency,
  isCurrent: servicePricesTable.isCurrent,
  createdAt: servicePricesTable.createdAt,
  createdBy: servicePricesTable.createdBy,
} as const;

export async function getServicePrices(params: {
  serviceId: bigint;
  userId: bigint;
  search?: string;
  sortBy?: SortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}): Promise<GetServicePricesResult> {
  const {
    serviceId,
    userId,
    search,
    sortBy = 'id',
    sortDir = 'desc',
    page = 1,
    pageSize = 10,
  } = params;

  // Verify service belongs to user and get its name
  const serviceRows = await db
    .select({ name: servicesTable.name })
    .from(servicesTable)
    .where(and(eq(servicesTable.id, serviceId), eq(servicesTable.userId, userId)))
    .limit(1);

  const serviceName = serviceRows[0]?.name ?? '';

  const serviceFilter = eq(servicePricesTable.serviceId, serviceId);

  const whereClause = search
    ? and(
        serviceFilter,
        or(
          ilike(servicePricesTable.currency, `%${search}%`),
          ilike(servicePricesTable.createdBy, `%${search}%`),
          ilike(servicePricesTable.price, `%${search}%`),
        ),
      )
    : serviceFilter;

  const sortCol = sortColumnMap[sortBy] ?? servicePricesTable.id;
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);
  const offset = (page - 1) * pageSize;

  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(servicePricesTable).where(whereClause),
    db
      .select()
      .from(servicePricesTable)
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
      serviceId: row.serviceId.toString(),
      price: row.price,
      estimatedHourlyRate: row.estimatedHourlyRate ?? null,
      currency: row.currency,
      isCurrent: row.isCurrent,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
    })),
    total,
    page,
    pageSize,
    totalPages,
    serviceName,
  };
}

export async function getServicePriceById(
  id: bigint,
  serviceId: bigint,
): Promise<ServicePriceRow | null> {
  const rows = await db
    .select()
    .from(servicePricesTable)
    .where(and(eq(servicePricesTable.id, id), eq(servicePricesTable.serviceId, serviceId)))
    .limit(1);

  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id: row.id.toString(),
    serviceId: row.serviceId.toString(),
    price: row.price,
    estimatedHourlyRate: row.estimatedHourlyRate ?? null,
    currency: row.currency,
    isCurrent: row.isCurrent,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
  };
}

export async function createServicePrice(
  serviceId: bigint,
  input: {
    price: string;
    estimatedHourlyRate?: string;
    currency: string;
    isCurrent: boolean;
    createdBy: string;
  },
): Promise<{ id: string }> {
  const [row] = await db
    .insert(servicePricesTable)
    .values({
      serviceId,
      price: input.price,
      estimatedHourlyRate: input.estimatedHourlyRate ?? null,
      currency: input.currency,
      isCurrent: input.isCurrent,
      createdBy: input.createdBy,
    })
    .returning({ id: servicePricesTable.id });

  return { id: row.id.toString() };
}

export async function updateServicePrice(
  id: bigint,
  serviceId: bigint,
  input: {
    price?: string;
    estimatedHourlyRate?: string | null;
    currency?: string;
    isCurrent?: boolean;
  },
): Promise<void> {
  await db
    .update(servicePricesTable)
    .set(input)
    .where(and(eq(servicePricesTable.id, id), eq(servicePricesTable.serviceId, serviceId)));
}

export async function deleteServicePrice(id: bigint, serviceId: bigint): Promise<void> {
  await db
    .delete(servicePricesTable)
    .where(and(eq(servicePricesTable.id, id), eq(servicePricesTable.serviceId, serviceId)));
}
