import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { getUserByClerkId } from '@/data/users';
import { getMaintenanceTypes, type SortColumn } from '@/data/maintenanceTypes';
import { MaintenanceTypesModule } from '@/components/maintenance-types/MaintenanceTypesModule';

const VALID_SORT_COLUMNS: SortColumn[] = ['id', 'name', 'createdAt', 'createdBy', 'status'];

type SP = Promise<{
  page?: string;
  pageSize?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
}>;

export default async function MaintenanceTypesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await getUserByClerkId(clerkId);
  if (!user) redirect('/sign-in');

  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const pageSize = [10, 20, 50].includes(parseInt(sp.pageSize ?? '10', 10))
    ? parseInt(sp.pageSize ?? '10', 10)
    : 10;
  const search = sp.search ?? '';
  const sortBy: SortColumn = VALID_SORT_COLUMNS.includes(sp.sortBy as SortColumn)
    ? (sp.sortBy as SortColumn)
    : 'id';
  const sortDir: 'asc' | 'desc' = sp.sortDir === 'desc' ? 'desc' : 'asc';

  const result = await getMaintenanceTypes({ search, sortBy, sortDir, page, pageSize });

  return (
    <PageContainer
      title="Tipos de Mantenimiento"
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Tipos de Mantenimiento' },
      ]}
    >
      <MaintenanceTypesModule
        result={result}
        page={page}
        pageSize={pageSize}
        search={search}
        sortBy={sortBy}
        sortDir={sortDir}
      />
    </PageContainer>
  );
}
