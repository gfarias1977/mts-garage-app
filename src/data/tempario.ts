import { db } from '@/db';
import {
  workOrdersTable,
  clientsTable,
  mechanicsTable,
  workOrdersStatusTable,
  workOrderServicesTable,
  sparePartsTable,
} from '@/db/schema';
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

export type TemparioRow = {
  workOrderId: string;
  sparePartId: string | null;
  fecha: Date | null;
  mes: number | null;
  ot: string;
  aprobacion: string;
  aprobacionDesc: string | null;
  patente: string;
  responsable: string | null;
  cliente: string | null;
  descripcionMO: string | null;
  observacion: string | null;
  hrsTrabajoRate: string | null;
  valorManoDeObra: string | null;
  repuesto: string | null;
  cantidad: string | null;
  valorRepuesto: string | null;
  porcentaje: string | null;
  totalRepuesto: string | null;
};

export type TemparioSortColumn =
  | 'fecha'
  | 'mes'
  | 'ot'
  | 'aprobacion'
  | 'patente'
  | 'responsable'
  | 'cliente'
  | 'descripcionMO'
  | 'hrsTrabajoRate'
  | 'valorManoDeObra'
  | 'repuesto'
  | 'cantidad'
  | 'valorRepuesto'
  | 'porcentaje'
  | 'observacion'
  | 'totalRepuesto';

export type GetTemparioResult = {
  rows: TemparioRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type TemparioParams = {
  userId: bigint;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: TemparioSortColumn;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
};

const diagnosisSubquery = sql<string | null>`(
  SELECT string_agg(wod_content, ' | ' ORDER BY wod_id)
  FROM work_order_diagnosis
  WHERE wod_wor_id = ${workOrdersTable.id}
)`;

const observationsSubquery = sql<string | null>`(
  SELECT string_agg(woo_content, ' | ' ORDER BY woo_id)
  FROM work_order_observations
  WHERE woo_wor_id = ${workOrdersTable.id}
)`;

const sortColumnMap: Record<TemparioSortColumn, SQL> = {
  fecha: workOrdersTable.createdAt as unknown as SQL,
  mes: sql`extract(month from ${workOrdersTable.createdAt})`,
  ot: workOrdersTable.code as unknown as SQL,
  aprobacion: workOrdersStatusTable.description as unknown as SQL,
  patente: workOrdersTable.vehiclePlate as unknown as SQL,
  responsable: mechanicsTable.name as unknown as SQL,
  cliente: clientsTable.name as unknown as SQL,
  descripcionMO: sql`(SELECT string_agg(wod_content, ' | ' ORDER BY wod_id) FROM work_order_diagnosis WHERE wod_wor_id = ${workOrdersTable.id})`,
  hrsTrabajoRate: workOrderServicesTable.actualHourlyRate as unknown as SQL,
  valorManoDeObra: workOrderServicesTable.actualPriceRate as unknown as SQL,
  repuesto: sparePartsTable.description as unknown as SQL,
  cantidad: sparePartsTable.quantity as unknown as SQL,
  valorRepuesto: sparePartsTable.cost as unknown as SQL,
  porcentaje: sparePartsTable.adicionalCost as unknown as SQL,
  observacion: sql`(SELECT string_agg(woo_content, ' | ' ORDER BY woo_id) FROM work_order_observations WHERE woo_wor_id = ${workOrdersTable.id})`,
  totalRepuesto: sparePartsTable.totalCost as unknown as SQL,
};

function buildWhereClause(
  userId: bigint,
  search?: string,
  dateFrom?: string,
  dateTo?: string,
) {
  const conditions: (SQL | undefined)[] = [
    eq(workOrdersTable.userId, userId),
  ];

  if (dateFrom) {
    conditions.push(gte(workOrdersTable.createdAt, new Date(dateFrom)));
  }

  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(workOrdersTable.createdAt, end));
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(workOrdersTable.code, term),
        ilike(clientsTable.name, term),
        ilike(mechanicsTable.name, term),
        ilike(workOrdersTable.vehiclePlate, term),
        ilike(workOrdersStatusTable.description, term),
        ilike(sparePartsTable.description, term),
      ),
    );
  }

  return and(...(conditions.filter(Boolean) as SQL[]));
}

function buildBaseQuery(userId: bigint, search?: string, dateFrom?: string, dateTo?: string) {
  const whereClause = buildWhereClause(userId, search, dateFrom, dateTo);

  return db
    .select({
      workOrderId: workOrdersTable.id,
      sparePartId: sparePartsTable.id,
      fecha: workOrdersTable.createdAt,
      mes: sql<number | null>`extract(month from ${workOrdersTable.createdAt})`,
      ot: workOrdersTable.code,
      aprobacion: workOrdersTable.status,
      aprobacionDesc: workOrdersStatusTable.description,
      patente: workOrdersTable.vehiclePlate,
      responsable: mechanicsTable.name,
      cliente: clientsTable.name,
      descripcionMO: diagnosisSubquery,
      observacion: observationsSubquery,
      hrsTrabajoRate: workOrderServicesTable.actualHourlyRate,
      valorManoDeObra: workOrderServicesTable.actualPriceRate,
      repuesto: sparePartsTable.description,
      cantidad: sparePartsTable.quantity,
      valorRepuesto: sparePartsTable.cost,
      porcentaje: sparePartsTable.adicionalCost,
      totalRepuesto: sparePartsTable.totalCost,
    })
    .from(workOrdersTable)
    .leftJoin(clientsTable, eq(workOrdersTable.clientId, clientsTable.id))
    .leftJoin(mechanicsTable, eq(workOrdersTable.mechanicId, mechanicsTable.id))
    .leftJoin(workOrdersStatusTable, eq(workOrdersTable.status, workOrdersStatusTable.id))
    .leftJoin(workOrderServicesTable, eq(workOrderServicesTable.workOrderId, workOrdersTable.id))
    .leftJoin(sparePartsTable, eq(sparePartsTable.serviceId, workOrderServicesTable.id))
    .where(whereClause);
}

function mapRow(row: {
  workOrderId: bigint;
  sparePartId: bigint | null;
  fecha: Date | null;
  mes: number | null;
  ot: string;
  aprobacion: string;
  aprobacionDesc: string | null;
  patente: string;
  responsable: string | null;
  cliente: string | null;
  descripcionMO: string | null;
  observacion: string | null;
  hrsTrabajoRate: string | null;
  valorManoDeObra: string | null;
  repuesto: string | null;
  cantidad: string | null;
  valorRepuesto: string | null;
  porcentaje: string | null;
  totalRepuesto: string | null;
}): TemparioRow {
  return {
    workOrderId: String(row.workOrderId),
    sparePartId: row.sparePartId != null ? String(row.sparePartId) : null,
    fecha: row.fecha,
    mes: row.mes,
    ot: row.ot,
    aprobacion: row.aprobacion,
    aprobacionDesc: row.aprobacionDesc,
    patente: row.patente,
    responsable: row.responsable,
    cliente: row.cliente,
    descripcionMO: row.descripcionMO,
    observacion: row.observacion,
    hrsTrabajoRate: row.hrsTrabajoRate,
    valorManoDeObra: row.valorManoDeObra,
    repuesto: row.repuesto,
    cantidad: row.cantidad,
    valorRepuesto: row.valorRepuesto,
    porcentaje: row.porcentaje,
    totalRepuesto: row.totalRepuesto,
  };
}

export async function getTempario(params: TemparioParams): Promise<GetTemparioResult> {
  const {
    userId,
    search,
    dateFrom,
    dateTo,
    sortBy = 'fecha',
    sortDir = 'desc',
    page = 1,
    pageSize = 20,
  } = params;

  const whereClause = buildWhereClause(userId, search, dateFrom, dateTo);
  const offset = (page - 1) * pageSize;
  const sortCol = sortColumnMap[sortBy];
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(workOrdersTable)
      .leftJoin(clientsTable, eq(workOrdersTable.clientId, clientsTable.id))
      .leftJoin(mechanicsTable, eq(workOrdersTable.mechanicId, mechanicsTable.id))
      .leftJoin(workOrdersStatusTable, eq(workOrdersTable.status, workOrdersStatusTable.id))
      .leftJoin(workOrderServicesTable, eq(workOrderServicesTable.workOrderId, workOrdersTable.id))
      .leftJoin(sparePartsTable, eq(sparePartsTable.serviceId, workOrderServicesTable.id))
      .where(whereClause),
    buildBaseQuery(userId, search, dateFrom, dateTo)
      .orderBy(orderClause)
      .limit(pageSize)
      .offset(offset),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    rows: rows.map(mapRow),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getTemparioExportRows(
  params: Omit<TemparioParams, 'page' | 'pageSize'>,
): Promise<TemparioRow[]> {
  const { userId, search, dateFrom, dateTo, sortBy = 'fecha', sortDir = 'desc' } = params;
  const sortCol = sortColumnMap[sortBy];
  const orderClause = sortDir === 'asc' ? asc(sortCol) : desc(sortCol);

  const rows = await buildBaseQuery(userId, search, dateFrom, dateTo).orderBy(orderClause);

  return rows.map(mapRow);
}
