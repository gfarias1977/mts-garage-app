'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type GetClientTypesResult, type SortColumn } from '@/data/clientTypes';
import { Progress } from '@/components/ui/progress';
import { ClientTypesToolbar } from './ClientTypesToolbar';
import { ClientTypesTable } from './ClientTypesTable';
import { ClientTypesPagination } from './ClientTypesPagination';
import { ClientTypeEditModal } from './ClientTypeEditModal';
import { ClientTypeDeleteDialog } from './ClientTypeDeleteDialog';

type ActiveModal =
  | { type: 'edit'; id: string | null }
  | { type: 'delete'; id: string }
  | null;

interface ClientTypesModuleProps {
  result: GetClientTypesResult;
  page: number;
  pageSize: number;
  search: string;
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
}

export function ClientTypesModule({
  result,
  page,
  pageSize,
  search,
  sortBy,
  sortDir,
}: ClientTypesModuleProps) {
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
      <ClientTypesToolbar
        search={search}
        searchParams={searchParams}
        navigate={navigate}
        onNew={() => setActiveModal({ type: 'edit', id: null })}
      />
      {isPending && <Progress value={null} className="w-full" />}
      <ClientTypesTable
        rows={result.rows}
        sortBy={sortBy}
        sortDir={sortDir}
        searchParams={searchParams}
        navigate={navigate}
        onAction={handleAction}
      />
      <ClientTypesPagination
        page={page}
        pageSize={pageSize}
        total={result.total}
        totalPages={result.totalPages}
        searchParams={searchParams}
        navigate={navigate}
      />
      <ClientTypeEditModal
        open={activeModal?.type === 'edit'}
        id={activeModal?.type === 'edit' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
      <ClientTypeDeleteDialog
        open={activeModal?.type === 'delete'}
        clientTypeId={activeModal?.type === 'delete' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
