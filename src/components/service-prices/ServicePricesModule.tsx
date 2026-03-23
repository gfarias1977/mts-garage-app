'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type GetServicePricesResult, type SortColumn } from '@/data/servicePrices';
import { Progress } from '@/components/ui/progress';
import { ServicePricesToolbar } from './ServicePricesToolbar';
import { ServicePricesTable } from './ServicePricesTable';
import { ServicePricesPagination } from './ServicePricesPagination';
import { ServicePriceEditModal } from './ServicePriceEditModal';
import { ServicePriceDeleteDialog } from './ServicePriceDeleteDialog';

type ActiveModal =
  | { type: 'edit'; id: string | null }
  | { type: 'delete'; id: string }
  | null;

interface ServicePricesModuleProps {
  result: GetServicePricesResult;
  serviceId: string;
  page: number;
  pageSize: number;
  search: string;
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
}

export function ServicePricesModule({
  result,
  serviceId,
  page,
  pageSize,
  search,
  sortBy,
  sortDir,
}: ServicePricesModuleProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(url: string) {
    startTransition(() => router.replace(url));
  }

  function handleAction(type: 'edit' | 'delete', id: string) {
    setActiveModal({ type, id } as ActiveModal);
  }

  return (
    <div className="flex flex-col gap-4">
      <ServicePricesToolbar
        search={search}
        serviceId={serviceId}
        searchParams={searchParams}
        navigate={navigate}
        onNew={() => setActiveModal({ type: 'edit', id: null })}
      />
      {isPending && <Progress value={null} className="w-full" />}
      <ServicePricesTable
        rows={result.rows}
        sortBy={sortBy}
        sortDir={sortDir}
        serviceId={serviceId}
        searchParams={searchParams}
        navigate={navigate}
        onAction={handleAction}
      />
      <ServicePricesPagination
        page={page}
        pageSize={pageSize}
        total={result.total}
        totalPages={result.totalPages}
        serviceId={serviceId}
        searchParams={searchParams}
        navigate={navigate}
      />
      <ServicePriceEditModal
        open={activeModal?.type === 'edit'}
        id={activeModal?.type === 'edit' ? activeModal.id : null}
        serviceId={serviceId}
        onClose={() => setActiveModal(null)}
      />
      <ServicePriceDeleteDialog
        open={activeModal?.type === 'delete'}
        id={activeModal?.type === 'delete' ? activeModal.id : null}
        serviceId={serviceId}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
