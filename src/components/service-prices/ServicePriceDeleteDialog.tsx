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
import { deleteServicePriceAction } from '@/app/(dashboard)/services/[serviceId]/prices/actions';

interface ServicePriceDeleteDialogProps {
  open: boolean;
  id: string | null;
  serviceId: string;
  onClose: () => void;
}

export function ServicePriceDeleteDialog({ open, id, serviceId, onClose }: ServicePriceDeleteDialogProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!id) return;
    setLoading(true);
    const result = await deleteServicePriceAction({ id, serviceId });
    setLoading(false);
    if (result.success) {
      toast.success(t('service_prices.deleted'));
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
          <DialogTitle>{t('service_prices.delete_title')}</DialogTitle>
          <DialogDescription>{t('service_prices.delete_confirm')}</DialogDescription>
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
