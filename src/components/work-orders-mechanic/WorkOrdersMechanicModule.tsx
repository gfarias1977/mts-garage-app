'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { type GetWorkOrdersResult, type SortColumn } from '@/data/workOrders';
import { WorkOrdersToolbar } from '@/components/work-orders/WorkOrdersToolbar';
import { WorkOrdersMechanicTable } from './WorkOrdersMechanicTable';
import { WorkOrdersPagination } from '@/components/work-orders/WorkOrdersPagination';
import { WorkOrderViewModal } from './WorkOrderViewModal';
import { WorkOrderObservationsModal } from '@/components/work-orders/WorkOrderObservationsModal';
import { WorkOrderDiagnosisModal } from '@/components/work-orders/WorkOrderDiagnosisModal';

type ActiveModal =
  | { type: 'edit'; id: string }
  | { type: 'observations'; id: string }
  | { type: 'diagnosis'; id: string }
  | null;

interface WorkOrdersMechanicModuleProps {
  result: GetWorkOrdersResult;
  page: number;
  pageSize: number;
  search: string;
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
}

export function WorkOrdersMechanicModule({
  result,
  page,
  pageSize,
  search,
  sortBy,
  sortDir,
}: WorkOrdersMechanicModuleProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const searchParams = useSearchParams();

  function handleAction(type: 'edit' | 'observations' | 'diagnosis', id: string) {
    setActiveModal({ type, id } as ActiveModal);
  }

  return (
    <div className="flex flex-col gap-4">
      <WorkOrdersToolbar
        search={search}
        sortBy={sortBy}
        sortDir={sortDir}
        searchParams={searchParams}
        showNew={false}
      />
      <WorkOrdersMechanicTable
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
      <WorkOrderViewModal
        open={activeModal?.type === 'edit'}
        id={activeModal?.type === 'edit' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
      <WorkOrderObservationsModal
        open={activeModal?.type === 'observations'}
        workOrderId={activeModal?.type === 'observations' ? activeModal.id : ''}
        onClose={() => setActiveModal(null)}
      />
      <WorkOrderDiagnosisModal
        open={activeModal?.type === 'diagnosis'}
        workOrderId={activeModal?.type === 'diagnosis' ? activeModal.id : ''}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
