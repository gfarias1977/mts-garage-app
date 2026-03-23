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
  getServiceByIdAction,
  getServiceLookupsAction,
  createServiceAction,
  updateServiceAction,
} from '@/app/(dashboard)/services/actions';

const STATUS_LABELS: Record<string, string> = { A: 'Activo', I: 'Inactivo' };

const schema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.string().length(1),
});

type FormValues = z.infer<typeof schema>;

interface ServiceEditModalProps {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export function ServiceEditModal({ open, id, onClose }: ServiceEditModalProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const isNew = id === null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { categoryId: '', name: '', description: '', status: 'A' },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ categoryId: '', name: '', description: '', status: 'A' });
    setLoading(true);

    if (id) {
      Promise.all([getServiceByIdAction(id), getServiceLookupsAction()]).then(
        ([serviceResult, lookupsResult]) => {
          if (lookupsResult.success) setCategories(lookupsResult.data.categories);
          if (serviceResult.success && serviceResult.data) {
            form.reset({
              categoryId: serviceResult.data.categoryId,
              name: serviceResult.data.name,
              description: serviceResult.data.description ?? '',
              status: serviceResult.data.status,
            });
          }
          setLoading(false);
        },
      );
    } else {
      getServiceLookupsAction().then((result) => {
        if (result.success) setCategories(result.data.categories);
        setLoading(false);
      });
    }
  }, [open, id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: FormValues) {
    let result;
    if (isNew) {
      result = await createServiceAction(values);
    } else {
      result = await updateServiceAction({ ...values, id: id! });
    }

    if (result.success) {
      toast.success(isNew ? t('services.created') : t('services.updated'));
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isNew ? t('services.new') : t('services.edit_title')}
          </DialogTitle>
        </DialogHeader>
        {loading && (
          <div className="flex flex-col gap-4 pt-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}
        {!loading && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="srv-category">{t('services.field.category')}</Label>
              <Select
                value={form.watch('categoryId')}
                onValueChange={(v) => form.setValue('categoryId', v ?? '', { shouldValidate: true })}
              >
                <SelectTrigger id="srv-category" className="w-full">
                  <SelectValue>
                    {categories.find((c) => c.id === form.watch('categoryId'))?.name ?? 'Seleccionar...'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="srv-name">{t('services.field.name')}</Label>
              <Input id="srv-name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="srv-description">{t('services.field.description')}</Label>
              <Input id="srv-description" {...form.register('description')} />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="srv-status">{t('services.field.status')}</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => form.setValue('status', v ?? 'A', { shouldValidate: true })}
              >
                <SelectTrigger id="srv-status" className="w-full">
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
