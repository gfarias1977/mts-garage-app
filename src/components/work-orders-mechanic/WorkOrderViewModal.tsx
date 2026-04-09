'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/i18n';
import { type WorkOrderDetail } from '@/data/workOrders';
import { getWorkOrderByIdAction } from '@/app/(dashboard)/work-orders/actions';
import { WorkOrderViewForm } from './WorkOrderViewForm';

interface WorkOrderViewModalProps {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export function WorkOrderViewModal({ open, id, onClose }: WorkOrderViewModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [workOrder, setWorkOrder] = useState<WorkOrderDetail | null>(null);

  useEffect(() => {
    if (!open || !id) return;
    setLoading(true);
    setWorkOrder(null);

    getWorkOrderByIdAction(id).then((result) => {
      if (result.success) setWorkOrder(result.data ?? null);
      setLoading(false);
    });
  }, [open, id]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:w-auto sm:max-w-[90vw] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('work_orders.edit_title')}</DialogTitle>
        </DialogHeader>
        {loading && (
          <div className="flex flex-col gap-4 pt-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}
        {!loading && workOrder && (
          <WorkOrderViewForm workOrder={workOrder} />
        )}
      </DialogContent>
    </Dialog>
  );
}
