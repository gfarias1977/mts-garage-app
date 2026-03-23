'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type GetMaintenanceTypesResult, type SortColumn } from '@/data/maintenanceTypes';
import { Progress } from '@/components/ui/progress';
import { MaintenanceTypesToolbar } from './MaintenanceTypesToolbar';
import { MaintenanceTypesTable } from './MaintenanceTypesTable';
import { MaintenanceTypesPagination } from './MaintenanceTypesPagination';
import { MaintenanceTypeEditModal } from './MaintenanceTypeEditModal';
import { MaintenanceTypeDeleteDialog } from './MaintenanceTypeDeleteDialog';

type ActiveModal =
  | { type: 'edit'; id: string | null }
  | { type: 'delete'; id: string }
  | null;

interface MaintenanceTypesModuleProps {
  result: GetMaintenanceTypesResult;
  page: number;
  pageSize: number;
  search: string;
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
}

export function MaintenanceTypesModule({
  result,
  page,
  pageSize,
  search,
  sortBy,
  sortDir,
}: MaintenanceTypesModuleProps) {
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
      <MaintenanceTypesToolbar
        search={search}
        searchParams={searchParams}
        navigate={navigate}
        onNew={() => setActiveModal({ type: 'edit', id: null })}
      />
      {isPending && <Progress value={null} className="w-full" />}
      <MaintenanceTypesTable
        rows={result.rows}
        sortBy={sortBy}
        sortDir={sortDir}
        searchParams={searchParams}
        navigate={navigate}
        onAction={handleAction}
      />
      <MaintenanceTypesPagination
        page={page}
        pageSize={pageSize}
        total={result.total}
        totalPages={result.totalPages}
        searchParams={searchParams}
        navigate={navigate}
      />
      <MaintenanceTypeEditModal
        open={activeModal?.type === 'edit'}
        id={activeModal?.type === 'edit' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
      <MaintenanceTypeDeleteDialog
        open={activeModal?.type === 'delete'}
        maintenanceTypeId={activeModal?.type === 'delete' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
