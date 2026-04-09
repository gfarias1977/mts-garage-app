'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n';
import {
  getCheckListGarageByIdAction,
  createCheckListGarageAction,
  updateCheckListGarageAction,
} from '@/app/(dashboard)/check-list-garage/actions';

const STATUS_OPTIONS = [
  { value: 'A', label: 'Activo' },
  { value: 'I', label: 'Inactivo' },
];

const schema = z.object({
  description: z.string().min(1).max(100),
  status: z.string().min(1).max(10),
});

type FormValues = z.infer<typeof schema>;

interface CheckListGarageEditModalProps {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export function CheckListGarageEditModal({ open, id, onClose }: CheckListGarageEditModalProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isNew = id === null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { description: '', status: 'A' },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ description: '', status: 'A' });

    if (id) {
      setLoading(true);
      getCheckListGarageByIdAction(id).then((result) => {
        if (result.success && result.data) {
          form.reset({
            description: result.data.description,
            status: result.data.status,
          });
        }
        setLoading(false);
      });
    }
  }, [open, id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: FormValues) {
    let result;
    if (isNew) {
      result = await createCheckListGarageAction(values);
    } else {
      result = await updateCheckListGarageAction(id as string, values);
    }

    if (result.success) {
      toast.success(isNew ? t('check_list_garage.created') : t('check_list_garage.updated'));
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isNew ? t('check_list_garage.new') : t('check_list_garage.edit_title')}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col gap-4 pt-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}

        {!loading && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="clg-description">{t('check_list_garage.field.description')}</Label>
              <Input id="clg-description" {...form.register('description')} />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clg-status">{t('check_list_garage.field.status')}</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => v && form.setValue('status', v, { shouldValidate: true })}
              >
                <SelectTrigger id="clg-status" className="w-full">
                  <SelectValue>
                    {STATUS_OPTIONS.find((o) => o.value === form.watch('status'))?.label ?? ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
