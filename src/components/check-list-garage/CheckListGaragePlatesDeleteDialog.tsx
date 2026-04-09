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
import { deleteCheckListGaragePlateAction } from '@/app/(dashboard)/check-list-garage/actions';

interface CheckListGaragePlatesDeleteDialogProps {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export function CheckListGaragePlatesDeleteDialog({
  open,
  id,
  onClose,
}: CheckListGaragePlatesDeleteDialogProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!id) return;
    setLoading(true);
    const result = await deleteCheckListGaragePlateAction({ id });
    setLoading(false);
    if (result.success) {
      toast.success(t('check_list_garage_plates.deleted'));
      onClose();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('check_list_garage_plates.delete_title')}</DialogTitle>
          <DialogDescription>{t('check_list_garage_plates.delete_confirm')}</DialogDescription>
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
