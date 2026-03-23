'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
import { createWorkOrderAction, updateWorkOrderAction } from '@/app/(dashboard)/work-orders/actions';
import { type WorkOrderDetail } from '@/data/workOrders';

const schema = z.object({
  code: z.string().min(1).max(50),
  clientId: z.string().min(1),
  mechanicId: z.string().optional(),
  vehiclePlate: z.string().min(1).max(20),
  maintenanceType: z.string().min(1),
  status: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

interface Lookups {
  clients: { id: string; name: string }[];
  mechanics: { id: string; name: string }[];
  vehicles: { id: string; name: string }[];
  maintenanceTypes: { id: string; name: string }[];
  statuses: { id: string; description: string }[];
}

interface WorkOrderFormProps {
  isNew: boolean;
  workOrder: WorkOrderDetail | null;
  lookups: Lookups;
  onSuccess: () => void;
}

export function WorkOrderForm({ isNew, workOrder, lookups, onSuccess }: WorkOrderFormProps) {
  const { t } = useI18n();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: workOrder?.code ?? '',
      clientId: workOrder?.clientId ?? '',
      mechanicId: workOrder?.mechanicId ?? '',
      vehiclePlate: workOrder?.vehiclePlate ?? '',
      maintenanceType: workOrder?.maintenanceTypeId ?? '',
      status: workOrder?.statusCode ?? '',
    },
  });

  async function onSubmit(values: FormValues) {
    let result;
    if (isNew) {
      result = await createWorkOrderAction(values);
    } else {
      result = await updateWorkOrderAction({ ...values, id: workOrder!.id });
    }

    if (result.success) {
      toast.success(isNew ? t('work_orders.created') : t('work_orders.updated'));
      onSuccess();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="code">{t('work_orders.field.code')}</Label>
        <Input id="code" {...form.register('code')} />
        {form.formState.errors.code && (
          <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientId">{t('work_orders.field.client')}</Label>
        <Select
          value={form.watch('clientId')}
          onValueChange={(v) => form.setValue('clientId', v ?? '', { shouldValidate: true })}
        >
          <SelectTrigger id="clientId" className="w-full">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {lookups.clients.map((c) => (
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

      <div className="space-y-2">
        <Label htmlFor="mechanicId">{t('work_orders.field.mechanic')}</Label>
        <Select
          value={form.watch('mechanicId') ?? ''}
          onValueChange={(v) => form.setValue('mechanicId', v ?? undefined)}
        >
          <SelectTrigger id="mechanicId" className="w-full">
            <SelectValue placeholder="Seleccionar...">
              {lookups.mechanics.find((m) => m.id === form.watch('mechanicId'))?.name ?? ''}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {lookups.mechanics.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehiclePlate">{t('work_orders.field.plate')}</Label>
        <Select
          value={form.watch('vehiclePlate')}
          onValueChange={(v) => form.setValue('vehiclePlate', v ?? '', { shouldValidate: true })}
        >
          <SelectTrigger id="vehiclePlate" className="w-full">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {lookups.vehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.id} — {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.vehiclePlate && (
          <p className="text-sm text-destructive">{form.formState.errors.vehiclePlate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maintenanceType">{t('work_orders.field.maintenance')}</Label>
        <Select
          value={form.watch('maintenanceType')}
          onValueChange={(v) => form.setValue('maintenanceType', v ?? '', { shouldValidate: true })}
        >
          <SelectTrigger id="maintenanceType" className="w-full">
            <SelectValue placeholder="Seleccionar...">
              {lookups.maintenanceTypes.find((m) => m.id === form.watch('maintenanceType'))?.name ?? ''}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {lookups.maintenanceTypes.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.maintenanceType && (
          <p className="text-sm text-destructive">{form.formState.errors.maintenanceType.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">{t('work_orders.field.status')}</Label>
        <Select
          value={form.watch('status')}
          onValueChange={(v) => form.setValue('status', v ?? '', { shouldValidate: true })}
        >
          <SelectTrigger id="status" className="w-full">
            <SelectValue placeholder="Seleccionar...">
              {lookups.statuses.find((s) => s.id === form.watch('status'))?.description ?? ''}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {lookups.statuses.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.status && (
          <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
