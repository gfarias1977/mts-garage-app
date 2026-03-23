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
  getMechanicByIdAction,
  createMechanicAction,
  updateMechanicAction,
} from '@/app/(dashboard)/mechanics/actions';

const STATUS_LABELS: Record<string, string> = { A: 'Activo', I: 'Inactivo' };

const schema = z.object({
  id: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  address: z.string().max(255).optional(),
  email: z.string().max(150).optional(),
  phone: z.string().max(30).optional(),
  status: z.string().length(1),
});

type FormValues = z.infer<typeof schema>;

interface MechanicEditModalProps {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export function MechanicEditModal({ open, id, onClose }: MechanicEditModalProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isNew = id === null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { id: '', name: '', address: '', email: '', phone: '', status: 'A' },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ id: '', name: '', address: '', email: '', phone: '', status: 'A' });

    if (id) {
      setLoading(true);
      getMechanicByIdAction(id).then((result) => {
        if (result.success && result.data) {
          form.reset({
            id: result.data.id,
            name: result.data.name,
            address: result.data.address ?? '',
            email: result.data.email ?? '',
            phone: result.data.phone ?? '',
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
      result = await createMechanicAction(values);
    } else {
      result = await updateMechanicAction(values);
    }

    if (result.success) {
      toast.success(isNew ? t('mechanics.created') : t('mechanics.updated'));
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
            {isNew ? t('mechanics.new') : t('mechanics.edit_title')}
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
            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="mec-id">{t('mechanics.field.id')}</Label>
              <Input id="mec-id" {...form.register('id')} disabled={!isNew} />
              {form.formState.errors.id && (
                <p className="text-sm text-destructive">{form.formState.errors.id.message}</p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="mec-name">{t('mechanics.field.name')}</Label>
              <Input id="mec-name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="mec-address">{t('mechanics.field.address')}</Label>
              <Input id="mec-address" {...form.register('address')} />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="mec-email">{t('mechanics.field.email')}</Label>
              <Input id="mec-email" type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="mec-phone">{t('mechanics.field.phone')}</Label>
              <Input id="mec-phone" {...form.register('phone')} />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="mec-status">{t('mechanics.field.status')}</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => form.setValue('status', v ?? 'A', { shouldValidate: true })}
              >
                <SelectTrigger id="mec-status" className="w-full">
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
