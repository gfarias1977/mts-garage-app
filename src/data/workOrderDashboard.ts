import { db } from '@/db';
import {
  workOrdersTable,
  workOrdersStatusTable,
  workOrderServicesTable,
  sparePartsTable,
} from '@/db/schema';
import { and, eq, gte, lt, sql } from 'drizzle-orm';
import {
  startOfISOWeek,
  startOfMonth,
  subWeeks,
  addWeeks,
  subMonths,
  addMonths,
} from 'date-fns';

export type WorkOrderStatusStat = {
  statusCode: string;
  description: string;
  count: number;
};

export type WorkOrderDashboardStats = {
  totalAllTime: number;
  byStatus: WorkOrderStatusStat[];
  countThisWeek: number;
  countLastWeek: number;
  countThisMonth: number;
  countLastMonth: number;
  revenueThisWeek: number;
  revenueLastWeek: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
};

export async function getWorkOrderDashboardStats(
  userId: bigint,
): Promise<WorkOrderDashboardStats> {
  const now = new Date();
  const thisWeekStart = startOfISOWeek(now);
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const nextWeekStart = addWeeks(thisWeekStart, 1);
  const nextMonthStart = addMonths(thisMonthStart, 1);

  const countInWindow = (start: Date, end: Date) =>
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(workOrdersTable)
      .where(
        and(
          eq(workOrdersTable.userId, userId),
          gte(workOrdersTable.createdAt, start),
          lt(workOrdersTable.createdAt, end),
        ),
      );

  const serviceRevenueInWindow = (start: Date, end: Date) =>
    db
      .select({
        total: sql<number>`cast(coalesce(sum(${workOrderServicesTable.actualPriceRate}), 0) as float8)`,
      })
      .from(workOrderServicesTable)
      .innerJoin(workOrdersTable, eq(workOrderServicesTable.workOrderId, workOrdersTable.id))
      .where(
        and(
          eq(workOrdersTable.userId, userId),
          gte(workOrdersTable.createdAt, start),
          lt(workOrdersTable.createdAt, end),
        ),
      );

  const spareRevenueInWindow = (start: Date, end: Date) =>
    db
      .select({
        total: sql<number>`cast(coalesce(sum(${sparePartsTable.totalCost}), 0) as float8)`,
      })
      .from(sparePartsTable)
      .innerJoin(workOrdersTable, eq(sparePartsTable.workOrderId, workOrdersTable.id))
      .where(
        and(
          eq(workOrdersTable.userId, userId),
          gte(workOrdersTable.createdAt, start),
          lt(workOrdersTable.createdAt, end),
        ),
      );

  const [
    totalRow,
    byStatusRows,
    countThisWeekRow,
    countLastWeekRow,
    countThisMonthRow,
    countLastMonthRow,
    svcRevThisWeekRow,
    sprRevThisWeekRow,
    svcRevLastWeekRow,
    sprRevLastWeekRow,
    svcRevThisMonthRow,
    sprRevThisMonthRow,
    svcRevLastMonthRow,
    sprRevLastMonthRow,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(workOrdersTable)
      .where(eq(workOrdersTable.userId, userId)),
    db
      .select({
        statusCode: workOrdersTable.status,
        description: workOrdersStatusTable.description,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(workOrdersTable)
      .leftJoin(workOrdersStatusTable, eq(workOrdersTable.status, workOrdersStatusTable.id))
      .where(eq(workOrdersTable.userId, userId))
      .groupBy(workOrdersTable.status, workOrdersStatusTable.description)
      .orderBy(workOrdersTable.status),
    countInWindow(thisWeekStart, nextWeekStart),
    countInWindow(lastWeekStart, thisWeekStart),
    countInWindow(thisMonthStart, nextMonthStart),
    countInWindow(lastMonthStart, thisMonthStart),
    serviceRevenueInWindow(thisWeekStart, nextWeekStart),
    spareRevenueInWindow(thisWeekStart, nextWeekStart),
    serviceRevenueInWindow(lastWeekStart, thisWeekStart),
    spareRevenueInWindow(lastWeekStart, thisWeekStart),
    serviceRevenueInWindow(thisMonthStart, nextMonthStart),
    spareRevenueInWindow(thisMonthStart, nextMonthStart),
    serviceRevenueInWindow(lastMonthStart, thisMonthStart),
    spareRevenueInWindow(lastMonthStart, thisMonthStart),
  ]);

  return {
    totalAllTime: Number(totalRow[0]?.count ?? 0),
    byStatus: byStatusRows.map((r) => ({
      statusCode: r.statusCode,
      description: r.description ?? r.statusCode,
      count: Number(r.count),
    })),
    countThisWeek: Number(countThisWeekRow[0]?.count ?? 0),
    countLastWeek: Number(countLastWeekRow[0]?.count ?? 0),
    countThisMonth: Number(countThisMonthRow[0]?.count ?? 0),
    countLastMonth: Number(countLastMonthRow[0]?.count ?? 0),
    revenueThisWeek: Number(svcRevThisWeekRow[0]?.total ?? 0) + Number(sprRevThisWeekRow[0]?.total ?? 0),
    revenueLastWeek: Number(svcRevLastWeekRow[0]?.total ?? 0) + Number(sprRevLastWeekRow[0]?.total ?? 0),
    revenueThisMonth: Number(svcRevThisMonthRow[0]?.total ?? 0) + Number(sprRevThisMonthRow[0]?.total ?? 0),
    revenueLastMonth: Number(svcRevLastMonthRow[0]?.total ?? 0) + Number(sprRevLastMonthRow[0]?.total ?? 0),
  };
}
