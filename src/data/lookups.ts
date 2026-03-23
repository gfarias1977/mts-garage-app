import { db } from '@/db';
import {
  clientsTable,
  clientTypesTable,
  mechanicsTable,
  serviceCategoriesTable,
  vehiclesTable,
  maintenanceTypesTable,
  workOrdersStatusTable,
} from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getServiceCategoriesForSelect(userId: bigint) {
  const rows = await db
    .select({ id: serviceCategoriesTable.id, name: serviceCategoriesTable.name })
    .from(serviceCategoriesTable)
    .where(eq(serviceCategoriesTable.userId, userId));
  return rows.map((r) => ({ id: r.id.toString(), name: r.name }));
}

export async function getClientTypesForSelect() {
  const rows = await db
    .select({ id: clientTypesTable.id, name: clientTypesTable.name })
    .from(clientTypesTable);
  return rows;
}

export async function getClientsForSelect() {
  const rows = await db
    .select({ id: clientsTable.id, name: clientsTable.name })
    .from(clientsTable);
  return rows;
}

export async function getMechanicsForSelect() {
  const rows = await db
    .select({ id: mechanicsTable.id, name: mechanicsTable.name })
    .from(mechanicsTable);
  return rows;
}

export async function getVehiclesForSelect() {
  const rows = await db
    .select({ id: vehiclesTable.id, name: vehiclesTable.name })
    .from(vehiclesTable);
  return rows;
}

export async function getMaintenanceTypesForSelect() {
  const rows = await db
    .select({ id: maintenanceTypesTable.id, name: maintenanceTypesTable.name })
    .from(maintenanceTypesTable);
  return rows;
}

export async function getStatusesForSelect() {
  const rows = await db
    .select({ id: workOrdersStatusTable.id, description: workOrdersStatusTable.description })
    .from(workOrdersStatusTable);
  return rows;
}
