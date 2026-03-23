import { db } from '@/db';
import { workOrdersTable, clientsTable, workOrderServicesTable, servicesTable, sparePartsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type QuoteServiceRow = {
  workOrderServiceId: string;
  serviceName: string;
  note: string;
  estimatedHourlyRate: string | null;
  actualHourlyRate: string | null;
  estimatedPriceRate: string | null;
  actualPriceRate: string | null;
  discount: string | null;
};

export type QuoteSparePartRow = {
  workOrderServiceId: string;
  description: string;
  cost: string;
};

export type WorkOrderQuoteData = {
  workOrderId: string;
  workOrderCode: string;
  vehiclePlate: string;
  createdAt: Date | null;
  createdBy: string;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  services: QuoteServiceRow[];
  spareParts: QuoteSparePartRow[];
};

export async function getWorkOrderQuoteData(workOrderId: bigint): Promise<WorkOrderQuoteData | null> {
  const [workOrder] = await db
    .select({
      id: workOrdersTable.id,
      code: workOrdersTable.code,
      vehiclePlate: workOrdersTable.vehiclePlate,
      createdAt: workOrdersTable.createdAt,
      createdBy: workOrdersTable.createdBy,
      clientId: workOrdersTable.clientId,
      clientName: clientsTable.name,
      clientEmail: clientsTable.email,
      clientPhone: clientsTable.phone,
    })
    .from(workOrdersTable)
    .innerJoin(clientsTable, eq(workOrdersTable.clientId, clientsTable.id))
    .where(eq(workOrdersTable.id, workOrderId))
    .limit(1);

  if (!workOrder) return null;

  const services = await db
    .select({
      workOrderServiceId: workOrderServicesTable.id,
      serviceName: servicesTable.name,
      note: workOrderServicesTable.note,
      estimatedHourlyRate: workOrderServicesTable.estimatedHourlyRate,
      actualHourlyRate: workOrderServicesTable.actualHourlyRate,
      estimatedPriceRate: workOrderServicesTable.estimatedPriceRate,
      actualPriceRate: workOrderServicesTable.actualPriceRate,
      discount: workOrderServicesTable.discount,
    })
    .from(workOrderServicesTable)
    .innerJoin(servicesTable, eq(workOrderServicesTable.serviceId, servicesTable.id))
    .where(eq(workOrderServicesTable.workOrderId, workOrderId));

  const spareParts = await db
    .select({
      workOrderServiceId: sparePartsTable.serviceId,
      description: sparePartsTable.description,
      cost: sparePartsTable.cost,
    })
    .from(sparePartsTable)
    .where(eq(sparePartsTable.workOrderId, workOrderId));

  return {
    workOrderId: workOrder.id.toString(),
    workOrderCode: workOrder.code,
    vehiclePlate: workOrder.vehiclePlate,
    createdAt: workOrder.createdAt,
    createdBy: workOrder.createdBy,
    client: {
      id: workOrder.clientId,
      name: workOrder.clientName,
      email: workOrder.clientEmail ?? null,
      phone: workOrder.clientPhone ?? null,
    },
    services: services.map((s) => ({
      workOrderServiceId: s.workOrderServiceId.toString(),
      serviceName: s.serviceName,
      note: s.note,
      estimatedHourlyRate: s.estimatedHourlyRate ?? null,
      actualHourlyRate: s.actualHourlyRate ?? null,
      estimatedPriceRate: s.estimatedPriceRate ?? null,
      actualPriceRate: s.actualPriceRate ?? null,
      discount: s.discount ?? null,
    })),
    spareParts: spareParts.map((sp) => ({
      workOrderServiceId: sp.workOrderServiceId.toString(),
      description: sp.description,
      cost: sp.cost,
    })),
  };
}
