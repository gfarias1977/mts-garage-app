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
  getClientByIdAction,
  getClientLookupsAction,
  createClientAction,
  updateClientAction,
} from '@/app/(dashboard)/clients/actions';

const STATUS_LABELS: Record<string, string> = { A: 'Activo', I: 'Inactivo' };

const schema = z.object({
  id: z.string().min(1).max(10),
  clientType: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  email: z.string().max(150).optional(),
  phone: z.string().max(30).optional(),
  status: z.string().length(1),
});

type FormValues = z.infer<typeof schema>;

interface ClientEditModalProps {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export function ClientEditModal({ open, id, onClose }: ClientEditModalProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientTypes, setClientTypes] = useState<{ id: string; name: string }[]>([]);
  const isNew = id === null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { id: '', clientType: '', name: '', email: '', phone: '', status: 'A' },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ id: '', clientType: '', name: '', email: '', phone: '', status: 'A' });
    setLoading(true);

    if (id) {
      Promise.all([getClientByIdAction(id), getClientLookupsAction()]).then(
        ([clientResult, lookupsResult]) => {
          if (lookupsResult.success) setClientTypes(lookupsResult.data.clientTypes);
          if (clientResult.success && clientResult.data) {
            form.reset({
              id: clientResult.data.id,
              clientType: clientResult.data.clientType,
              name: clientResult.data.name,
              email: clientResult.data.email ?? '',
              phone: clientResult.data.phone ?? '',
              status: clientResult.data.status,
            });
          }
          setLoading(false);
        },
      );
    } else {
      getClientLookupsAction().then((result) => {
        if (result.success) setClientTypes(result.data.clientTypes);
        setLoading(false);
      });
    }
  }, [open, id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: FormValues) {
    let result;
    if (isNew) {
      result = await createClientAction(values);
    } else {
      result = await updateClientAction(values);
    }

    if (result.success) {
      toast.success(isNew ? t('clients.created') : t('clients.updated'));
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
            {isNew ? t('clients.new') : t('clients.edit_title')}
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
              <Label htmlFor="cli-id">{t('clients.field.id')}</Label>
              <Input id="cli-id" {...form.register('id')} disabled={!isNew} />
              {form.formState.errors.id && (
                <p className="text-sm text-destructive">{form.formState.errors.id.message}</p>
              )}
            </div>

            {/* Tipo de cliente */}
            <div className="space-y-2">
              <Label htmlFor="cli-type">{t('clients.field.client_type')}</Label>
              <Select
                value={form.watch('clientType')}
                onValueChange={(v) => form.setValue('clientType', v ?? '', { shouldValidate: true })}
              >
                <SelectTrigger id="cli-type" className="w-full">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {clientTypes.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      {ct.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.clientType && (
                <p className="text-sm text-destructive">{form.formState.errors.clientType.message}</p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="cli-name">{t('clients.field.name')}</Label>
              <Input id="cli-name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="cli-email">{t('clients.field.email')}</Label>
              <Input id="cli-email" type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="cli-phone">{t('clients.field.phone')}</Label>
              <Input id="cli-phone" {...form.register('phone')} />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="cli-status">{t('clients.field.status')}</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => form.setValue('status', v ?? 'A', { shouldValidate: true })}
              >
                <SelectTrigger id="cli-status" className="w-full">
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
