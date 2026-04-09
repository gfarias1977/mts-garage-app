'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type GetCheckListGarageResult, type SortColumn } from '@/data/checkListGarage';
import { Progress } from '@/components/ui/progress';
import { CheckListGarageToolbar } from './CheckListGarageToolbar';
import { CheckListGarageTable } from './CheckListGarageTable';
import { CheckListGaragePagination } from './CheckListGaragePagination';
import { CheckListGarageEditModal } from './CheckListGarageEditModal';
import { CheckListGarageDeleteDialog } from './CheckListGarageDeleteDialog';
import { CheckListGaragePlatesModal } from './CheckListGaragePlatesModal';

type ActiveModal =
  | { type: 'edit'; id: string | null }
  | { type: 'delete'; id: string }
  | { type: 'vehicles'; id: string }
  | null;

interface CheckListGarageModuleProps {
  result: GetCheckListGarageResult;
  page: number;
  pageSize: number;
  search: string;
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
}

export function CheckListGarageModule({
  result,
  page,
  pageSize,
  search,
  sortBy,
  sortDir,
}: CheckListGarageModuleProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(url: string) {
    startTransition(() => router.replace(url));
  }

  function handleAction(type: 'edit' | 'delete' | 'vehicles', id: string) {
    setActiveModal({ type, id } as ActiveModal);
  }

  return (
    <div className="flex flex-col gap-4">
      <CheckListGarageToolbar
        search={search}
        searchParams={searchParams}
        navigate={navigate}
        onNew={() => setActiveModal({ type: 'edit', id: null })}
      />
      {isPending && <Progress value={null} className="w-full" />}
      <CheckListGarageTable
        rows={result.rows}
        sortBy={sortBy}
        sortDir={sortDir}
        searchParams={searchParams}
        navigate={navigate}
        onAction={handleAction}
      />
      <CheckListGaragePagination
        page={page}
        pageSize={pageSize}
        total={result.total}
        totalPages={result.totalPages}
        searchParams={searchParams}
        navigate={navigate}
      />
      <CheckListGarageEditModal
        open={activeModal?.type === 'edit'}
        id={activeModal?.type === 'edit' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
      <CheckListGarageDeleteDialog
        open={activeModal?.type === 'delete'}
        id={activeModal?.type === 'delete' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
      <CheckListGaragePlatesModal
        open={activeModal?.type === 'vehicles'}
        checkListGarageId={activeModal?.type === 'vehicles' ? activeModal.id : ''}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
