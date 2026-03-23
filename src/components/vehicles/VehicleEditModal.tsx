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
  getVehicleByIdAction,
  getVehicleLookupsAction,
  createVehicleAction,
  updateVehicleAction,
} from '@/app/(dashboard)/vehicles/actions';

const STATUS_LABELS: Record<string, string> = { A: 'Activo', I: 'Inactivo' };

const schema = z.object({
  id: z.string().min(1).max(10),
  clientId: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  email: z.string().max(150).optional(),
  phone: z.string().max(30).optional(),
  status: z.string().length(1),
});

type FormValues = z.infer<typeof schema>;

interface VehicleEditModalProps {
  open: boolean;
  id: string | null;
  onClose: () => void;
}

export function VehicleEditModal({ open, id, onClose }: VehicleEditModalProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const isNew = id === null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { id: '', clientId: '', name: '', email: '', phone: '', status: 'A' },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ id: '', clientId: '', name: '', email: '', phone: '', status: 'A' });
    setLoading(true);

    if (id) {
      Promise.all([getVehicleByIdAction(id), getVehicleLookupsAction()]).then(
        ([vehicleResult, lookupsResult]) => {
          if (lookupsResult.success) setClients(lookupsResult.data.clients);
          if (vehicleResult.success && vehicleResult.data) {
            form.reset({
              id: vehicleResult.data.id,
              clientId: vehicleResult.data.clientId,
              name: vehicleResult.data.name,
              email: vehicleResult.data.email ?? '',
              phone: vehicleResult.data.phone ?? '',
              status: vehicleResult.data.status,
            });
          }
          setLoading(false);
        },
      );
    } else {
      getVehicleLookupsAction().then((result) => {
        if (result.success) setClients(result.data.clients);
        setLoading(false);
      });
    }
  }, [open, id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: FormValues) {
    let result;
    if (isNew) {
      result = await createVehicleAction(values);
    } else {
      result = await updateVehicleAction(values);
    }

    if (result.success) {
      toast.success(isNew ? t('vehicles.created') : t('vehicles.updated'));
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
            {isNew ? t('vehicles.new') : t('vehicles.edit_title')}
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
            {/* Patente / Placa */}
            <div className="space-y-2">
              <Label htmlFor="veh-id">{t('vehicles.field.id')}</Label>
              <Input id="veh-id" {...form.register('id')} disabled={!isNew} />
              {form.formState.errors.id && (
                <p className="text-sm text-destructive">{form.formState.errors.id.message}</p>
              )}
            </div>

            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="veh-client">{t('vehicles.field.client')}</Label>
              <Select
                value={form.watch('clientId')}
                onValueChange={(v) => form.setValue('clientId', v ?? '', { shouldValidate: true })}
              >
                <SelectTrigger id="veh-client" className="w-full">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.clientId && (
                <p className="text-sm text-destructive">{form.formState.errors.clientId.message}</p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="veh-name">{t('vehicles.field.name')}</Label>
              <Input id="veh-name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="veh-email">{t('vehicles.field.email')}</Label>
              <Input id="veh-email" type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="veh-phone">{t('vehicles.field.phone')}</Label>
              <Input id="veh-phone" {...form.register('phone')} />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="veh-status">{t('vehicles.field.status')}</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => form.setValue('status', v ?? 'A', { shouldValidate: true })}
              >
                <SelectTrigger id="veh-status" className="w-full">
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
