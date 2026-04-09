'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId } from '@/data/users';
import {
  getTempario,
  getTemparioExportRows,
  type GetTemparioResult,
  type TemparioRow,
  type TemparioSortColumn,
} from '@/data/tempario';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function resolveUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');
  const user = await getUserByClerkId(clerkId);
  if (!user) redirect('/sign-in');
  return user;
}

export async function getTemparioDataAction(input: {
  search: string;
  dateFrom: string;
  dateTo: string;
  sortBy: TemparioSortColumn;
  sortDir: 'asc' | 'desc';
  page: number;
  pageSize: number;
}): Promise<ActionResult<GetTemparioResult>> {
  try {
    const user = await resolveUser();
    const data = await getTempario({ userId: user.id, ...input });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error desconocido' };
  }
}

export async function getTemparioExportAction(input: {
  search: string;
  dateFrom: string;
  dateTo: string;
  sortBy: TemparioSortColumn;
  sortDir: 'asc' | 'desc';
}): Promise<ActionResult<TemparioRow[]>> {
  try {
    const user = await resolveUser();
    const rows = await getTemparioExportRows({ userId: user.id, ...input });
    return { success: true, data: rows };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error desconocido' };
  }
}
