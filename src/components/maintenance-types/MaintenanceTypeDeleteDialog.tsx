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
import { deleteMaintenanceTypeAction } from '@/app/(dashboard)/maintenance-types/actions';

interface MaintenanceTypeDeleteDialogProps {
  open: boolean;
  maintenanceTypeId: string | null;
  onClose: () => void;
}

export function MaintenanceTypeDeleteDialog({
  open,
  maintenanceTypeId,
  onClose,
}: MaintenanceTypeDeleteDialogProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!maintenanceTypeId) return;
    setLoading(true);
    const result = await deleteMaintenanceTypeAction({ id: maintenanceTypeId });
    setLoading(false);
    if (result.success) {
      toast.success(t('maintenance_types.deleted'));
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
          <DialogTitle>{t('maintenance_types.delete_title')}</DialogTitle>
          <DialogDescription>{t('maintenance_types.delete_confirm')}</DialogDescription>
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
