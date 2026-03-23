'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/i18n';
import { type WorkOrderDetail } from '@/data/workOrders';
import { getWorkOrderByIdAction, getLookupsAction } from '@/app/(dashboard)/work-orders/actions';
import { WorkOrderForm } from './WorkOrderForm';

interface Lookups {
  clients: { id: string; name: string }[];
  mechanics: { id: string; name: string }[];
  vehicles: { id: string; name: string }[];
  maintenanceTypes: { id: string; name: string }[];
  statuses: { id: string; description: string }[];
}

interface WorkOrderEditModalProps {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export function WorkOrderEditModal({ open, id, onClose }: WorkOrderEditModalProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [workOrder, setWorkOrder] = useState<WorkOrderDetail | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setLookups(null);
    setWorkOrder(null);

    if (id) {
      Promise.all([getWorkOrderByIdAction(id), getLookupsAction()]).then(
        ([woResult, lookupsResult]) => {
          if (woResult.success) setWorkOrder(woResult.data ?? null);
          if (lookupsResult.success) setLookups(lookupsResult.data);
          setLoading(false);
        },
      );
    } else {
      getLookupsAction().then((result) => {
        if (result.success) setLookups(result.data);
        setLoading(false);
      });
    }
  }, [open, id]);

  function handleSuccess() {
    onClose();
    router.refresh();
  }

  const isNew = id === null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isNew ? t('work_orders.new') : t('work_orders.edit_title')}
          </DialogTitle>
        </DialogHeader>
        {loading && (
          <div className="flex flex-col gap-4 pt-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}
        {!loading && lookups && (
          <WorkOrderForm
            isNew={isNew}
            workOrder={workOrder}
            lookups={lookups}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
