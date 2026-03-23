import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { getUserByClerkId } from '@/data/users';
import { getClients, type SortColumn } from '@/data/clients';
import { ClientsModule } from '@/components/clients/ClientsModule';

const VALID_SORT_COLUMNS: SortColumn[] = [
  'id', 'clientTypeName', 'name', 'email', 'phone', 'createdAt', 'createdBy', 'status',
];

type SP = Promise<{
  page?: string;
  pageSize?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
}>;

export default async function ClientsPage({ searchParams }: { searchParams: SP }) {
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

  const result = await getClients({ search, sortBy, sortDir, page, pageSize });

  return (
    <PageContainer
      title="Clientes"
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Clientes' },
      ]}
    >
      <ClientsModule
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
