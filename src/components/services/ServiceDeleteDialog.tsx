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
import { deleteServiceAction } from '@/app/(dashboard)/services/actions';

interface ServiceDeleteDialogProps {
  open: boolean;
  serviceId: string | null;
  onClose: () => void;
}

export function ServiceDeleteDialog({ open, serviceId, onClose }: ServiceDeleteDialogProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!serviceId) return;
    setLoading(true);
    const result = await deleteServiceAction({ id: serviceId });
    setLoading(false);
    if (result.success) {
      toast.success(t('services.deleted'));
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
          <DialogTitle>{t('services.delete_title')}</DialogTitle>
          <DialogDescription>{t('services.delete_confirm')}</DialogDescription>
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
