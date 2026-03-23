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
import { deleteServiceCategoryAction } from '@/app/(dashboard)/service-categories/actions';

interface ServiceCategoryDeleteDialogProps {
  open: boolean;
  serviceCategoryId: string | null;
  onClose: () => void;
}

export function ServiceCategoryDeleteDialog({
  open,
  serviceCategoryId,
  onClose,
}: ServiceCategoryDeleteDialogProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!serviceCategoryId) return;
    setLoading(true);
    const result = await deleteServiceCategoryAction({ id: serviceCategoryId });
    setLoading(false);
    if (result.success) {
      toast.success(t('service_categories.deleted'));
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
          <DialogTitle>{t('service_categories.delete_title')}</DialogTitle>
          <DialogDescription>{t('service_categories.delete_confirm')}</DialogDescription>
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
