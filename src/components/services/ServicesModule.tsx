'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type GetServicesResult, type SortColumn } from '@/data/services';
import { Progress } from '@/components/ui/progress';
import { ServicesToolbar } from './ServicesToolbar';
import { ServicesTable } from './ServicesTable';
import { ServicesPagination } from './ServicesPagination';
import { ServiceEditModal } from './ServiceEditModal';
import { ServiceDeleteDialog } from './ServiceDeleteDialog';

type ActiveModal =
  | { type: 'edit'; id: string | null }
  | { type: 'delete'; id: string }
  | null;

interface ServicesModuleProps {
  result: GetServicesResult;
  page: number;
  pageSize: number;
  search: string;
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
}

export function ServicesModule({
  result,
  page,
  pageSize,
  search,
  sortBy,
  sortDir,
}: ServicesModuleProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(url: string) {
    startTransition(() => router.replace(url));
  }

  function handleAction(type: 'edit' | 'delete' | 'prices', id: string) {
    if (type === 'prices') {
      router.push(`/services/${id}/prices`);
      return;
    }
    setActiveModal({ type, id } as ActiveModal);
  }

  return (
    <div className="flex flex-col gap-4">
      <ServicesToolbar
        search={search}
        searchParams={searchParams}
        navigate={navigate}
        onNew={() => setActiveModal({ type: 'edit', id: null })}
      />
      {isPending && <Progress value={null} className="w-full" />}
      <ServicesTable
        rows={result.rows}
        sortBy={sortBy}
        sortDir={sortDir}
        searchParams={searchParams}
        navigate={navigate}
        onAction={handleAction}
      />
      <ServicesPagination
        page={page}
        pageSize={pageSize}
        total={result.total}
        totalPages={result.totalPages}
        searchParams={searchParams}
        navigate={navigate}
      />
      <ServiceEditModal
        open={activeModal?.type === 'edit'}
        id={activeModal?.type === 'edit' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
      <ServiceDeleteDialog
        open={activeModal?.type === 'delete'}
        serviceId={activeModal?.type === 'delete' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
