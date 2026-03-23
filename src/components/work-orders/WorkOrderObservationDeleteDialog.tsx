'use client';

import { useState } from 'react';
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
import { deleteWorkOrderObservationAction } from '@/app/(dashboard)/work-orders/actions';

interface WorkOrderObservationDeleteDialogProps {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export function WorkOrderObservationDeleteDialog({
  open,
  id,
  onClose,
}: WorkOrderObservationDeleteDialogProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!id) return;
    setLoading(true);
    const result = await deleteWorkOrderObservationAction(id);
    setLoading(false);
    if (result.success) {
      toast.success(t('work_orders.observations.deleted'));
      onClose();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('work_orders.observations.delete_title')}</DialogTitle>
          <DialogDescription>{t('work_orders.observations.delete_confirm')}</DialogDescription>
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
