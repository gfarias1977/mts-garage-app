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
  getClientTypeByIdAction,
  createClientTypeAction,
  updateClientTypeAction,
} from '@/app/(dashboard)/client-types/actions';

const STATUS_LABELS: Record<string, string> = { A: 'Activo', I: 'Inactivo' };

const schema = z.object({
  id: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  status: z.string().length(1),
});

type FormValues = z.infer<typeof schema>;

interface ClientTypeEditModalProps {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export function ClientTypeEditModal({ open, id, onClose }: ClientTypeEditModalProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isNew = id === null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { id: '', name: '', status: 'A' },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ id: '', name: '', status: 'A' });

    if (id) {
      setLoading(true);
      getClientTypeByIdAction(id).then((result) => {
        if (result.success && result.data) {
          form.reset({
            id: result.data.id,
            name: result.data.name,
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
      result = await createClientTypeAction(values);
    } else {
      result = await updateClientTypeAction(values);
    }

    if (result.success) {
      toast.success(isNew ? t('client_types.created') : t('client_types.updated'));
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
            {isNew ? t('client_types.new') : t('client_types.edit_title')}
          </DialogTitle>
        </DialogHeader>
        {loading && (
          <div className="flex flex-col gap-4 pt-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}
        {!loading && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="ct-id">{t('client_types.field.id')}</Label>
              <Input
                id="ct-id"
                {...form.register('id')}
                disabled={!isNew}
              />
              {form.formState.errors.id && (
                <p className="text-sm text-destructive">{form.formState.errors.id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ct-name">{t('client_types.field.name')}</Label>
              <Input id="ct-name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ct-status">{t('client_types.field.status')}</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => form.setValue('status', v ?? 'A', { shouldValidate: true })}
              >
                <SelectTrigger id="ct-status" className="w-full">
                  <SelectValue>{STATUS_LABELS[form.watch('status')] ?? ''}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Activo</SelectItem>
                  <SelectItem value="I">Inactivo</SelectItem>
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
