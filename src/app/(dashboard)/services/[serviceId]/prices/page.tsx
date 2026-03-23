import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { getUserByClerkId } from '@/data/users';
import { getServicePrices, type SortColumn } from '@/data/servicePrices';
import { ServicePricesModule } from '@/components/service-prices/ServicePricesModule';

const VALID_SORT_COLUMNS: SortColumn[] = [
  'id', 'price', 'estimatedHourlyRate', 'currency', 'isCurrent', 'createdAt', 'createdBy',
];

type Params = Promise<{ serviceId: string }>;
type SP = Promise<{
  page?: string;
  pageSize?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
}>;

export default async function ServicePricesPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SP;
}) {
  const { serviceId } = await params;
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
  const sortDir: 'asc' | 'desc' = sp.sortDir === 'asc' ? 'asc' : 'desc';

  const result = await getServicePrices({
    serviceId: BigInt(serviceId),
    userId: user.id,
    search,
    sortBy,
    sortDir,
    page,
    pageSize,
  });

  if (!result.serviceName) notFound();

  return (
    <PageContainer
      title={`Precios — ${result.serviceName}`}
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Servicios', href: '/services' },
        { label: result.serviceName, href: '/services' },
        { label: 'Precios' },
      ]}
    >
      <ServicePricesModule
        result={result}
        serviceId={serviceId}
        page={page}
        pageSize={pageSize}
        search={search}
        sortBy={sortBy}
        sortDir={sortDir}
      />
    </PageContainer>
  );
}
