'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { type GetWorkOrdersResult, type SortColumn } from '@/data/workOrders';
import { WorkOrdersToolbar } from './WorkOrdersToolbar';
import { WorkOrdersTable } from './WorkOrdersTable';
import { WorkOrdersPagination } from './WorkOrdersPagination';
import { WorkOrderDeleteDialog } from './WorkOrderDeleteDialog';
import { WorkOrderEditModal } from './WorkOrderEditModal';
import { WorkOrderServicesModal } from './WorkOrderServicesModal';
import { WorkOrderSparePartsModal } from './WorkOrderSparePartsModal';
import { WorkOrderObservationsModal } from './WorkOrderObservationsModal';
import { WorkOrderQuoteModal } from './WorkOrderQuoteModal';

type ActiveModal =
  | { type: 'edit'; id: string | null }
  | { type: 'delete'; id: string }
  | { type: 'services'; id: string }
  | { type: 'spareParts'; id: string }
  | { type: 'observations'; id: string }
  | { type: 'quote'; id: string }
  | null;

interface WorkOrdersModuleProps {
  result: GetWorkOrdersResult;
  page: number;
  pageSize: number;
  search: string;
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
}

export function WorkOrdersModule({
  result,
  page,
  pageSize,
  search,
  sortBy,
  sortDir,
}: WorkOrdersModuleProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const searchParams = useSearchParams();

  function handleAction(type: 'edit' | 'delete' | 'services' | 'spareParts' | 'observations' | 'quote', id: string) {
    setActiveModal({ type, id } as ActiveModal);
  }

  return (
    <div className="flex flex-col gap-4">
      <WorkOrdersToolbar
        search={search}
        sortBy={sortBy}
        sortDir={sortDir}
        searchParams={searchParams}
        onNew={() => setActiveModal({ type: 'edit', id: null })}
      />
      <WorkOrdersTable
        rows={result.rows}
        sortBy={sortBy}
        sortDir={sortDir}
        searchParams={searchParams}
        onAction={handleAction}
      />
      <WorkOrdersPagination
        page={page}
        pageSize={pageSize}
        total={result.total}
        totalPages={result.totalPages}
        searchParams={searchParams}
      />
      <WorkOrderEditModal
        open={activeModal?.type === 'edit'}
        id={activeModal?.type === 'edit' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
      <WorkOrderDeleteDialog
        open={activeModal?.type === 'delete'}
        workOrderId={activeModal?.type === 'delete' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
      <WorkOrderServicesModal
        open={activeModal?.type === 'services'}
        workOrderId={activeModal?.type === 'services' ? activeModal.id : ''}
        onClose={() => setActiveModal(null)}
      />
      <WorkOrderSparePartsModal
        open={activeModal?.type === 'spareParts'}
        workOrderId={activeModal?.type === 'spareParts' ? activeModal.id : ''}
        onClose={() => setActiveModal(null)}
      />
      <WorkOrderObservationsModal
        open={activeModal?.type === 'observations'}
        workOrderId={activeModal?.type === 'observations' ? activeModal.id : ''}
        onClose={() => setActiveModal(null)}
      />
      <WorkOrderQuoteModal
        open={activeModal?.type === 'quote'}
        workOrderId={activeModal?.type === 'quote' ? activeModal.id : ''}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
