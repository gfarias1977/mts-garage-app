'use client';

import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useI18n } from '@/i18n';
import { type WorkOrderDetail } from '@/data/workOrders';
import { WorkOrderForm } from './WorkOrderForm';
import { buildUrl } from './urlHelpers';

interface Lookups {
  clients: { id: string; name: string }[];
  mechanics: { id: string; name: string }[];
  vehicles: { id: string; name: string }[];
  maintenanceTypes: { id: string; name: string }[];
  statuses: { id: string; description: string }[];
}

interface WorkOrderEditSheetProps {
  open: boolean;
  isNew: boolean;
  workOrder: WorkOrderDetail | null;
  lookups: Lookups | null;
  searchParams: URLSearchParams;
}

export function WorkOrderEditSheet({
  open,
  isNew,
  workOrder,
  lookups,
  searchParams,
}: WorkOrderEditSheetProps) {
  const { t } = useI18n();
  const router = useRouter();

  function handleClose() {
    router.replace(buildUrl(searchParams, { edit: null }));
  }

  function handleSuccess() {
    handleClose();
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isNew ? t('work_orders.new') : t('work_orders.edit_title')}
          </SheetTitle>
        </SheetHeader>
        {open && lookups && (
          <div className="p-4">
            <WorkOrderForm
              isNew={isNew}
              workOrder={workOrder}
              lookups={lookups}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
