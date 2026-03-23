'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { deleteWorkOrderAction } from '@/app/(dashboard)/work-orders/actions';

interface WorkOrderDeleteDialogProps {
  open: boolean;
  workOrderId: string | null;
  onClose: () => void;
}

export function WorkOrderDeleteDialog({ open, workOrderId, onClose }: WorkOrderDeleteDialogProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!workOrderId) return;
    setLoading(true);
    const result = await deleteWorkOrderAction({ id: workOrderId });
    setLoading(false);
    if (result.success) {
      toast.success(t('work_orders.deleted'));
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('work_orders.delete_title')}</DialogTitle>
          <DialogDescription>{t('work_orders.delete_confirm')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
