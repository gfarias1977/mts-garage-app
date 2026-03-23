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
import { deleteVehicleAction } from '@/app/(dashboard)/vehicles/actions';

interface VehicleDeleteDialogProps {
  open: boolean;
  vehicleId: string | null;
  onClose: () => void;
}

export function VehicleDeleteDialog({ open, vehicleId, onClose }: VehicleDeleteDialogProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!vehicleId) return;
    setLoading(true);
    const result = await deleteVehicleAction({ id: vehicleId });
    setLoading(false);
    if (result.success) {
      toast.success(t('vehicles.deleted'));
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
          <DialogTitle>{t('vehicles.delete_title')}</DialogTitle>
          <DialogDescription>{t('vehicles.delete_confirm')}</DialogDescription>
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
