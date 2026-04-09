import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { getUserByClerkId } from '@/data/users';
import { getTempario, type TemparioSortColumn } from '@/data/tempario';
import { TemparioModule } from '@/components/tempario/TemparioModule';

const VALID_SORT_COLUMNS: TemparioSortColumn[] = [
  'fecha',
  'mes',
  'ot',
  'aprobacion',
  'patente',
  'responsable',
  'cliente',
  'descripcionMO',
  'hrsTrabajoRate',
  'valorManoDeObra',
  'repuesto',
  'cantidad',
  'valorRepuesto',
  'porcentaje',
  'observacion',
  'totalRepuesto',
];

type SP = Promise<{
  page?: string;
  pageSize?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function TemparioPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await getUserByClerkId(clerkId);
  if (!user) redirect('/sign-in');

  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const pageSize = [10, 20, 50].includes(parseInt(sp.pageSize ?? '20', 10))
    ? parseInt(sp.pageSize ?? '20', 10)
    : 20;
  const search = sp.search ?? '';
  const sortBy: TemparioSortColumn = VALID_SORT_COLUMNS.includes(sp.sortBy as TemparioSortColumn)
    ? (sp.sortBy as TemparioSortColumn)
    : 'fecha';
  const sortDir: 'asc' | 'desc' = sp.sortDir === 'asc' ? 'asc' : 'desc';
  const dateFrom = sp.dateFrom ?? '';
  const dateTo = sp.dateTo ?? '';

  const result = await getTempario({
    userId: user.id,
    search,
    sortBy,
    sortDir,
    page,
    pageSize,
    dateFrom,
    dateTo,
  });

  return (
    <PageContainer
      title="Tempario"
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Tempario' },
      ]}
    >
      <TemparioModule
        result={result}
        page={page}
        pageSize={pageSize}
        search={search}
        sortBy={sortBy}
        sortDir={sortDir}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </PageContainer>
  );
}
