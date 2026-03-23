'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n';
import {
  getWorkOrderServiceByIdAction,
  getServicesForSelectAction,
  createWorkOrderServiceAction,
  updateWorkOrderServiceAction,
} from '@/app/(dashboard)/work-orders/actions';

const STATUS_LABELS: Record<string, string> = { A: 'Activo', I: 'Inactivo' };

const optionalNumeric = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Ingrese un valor válido (ej: 1500.00)')
  .optional()
  .or(z.literal(''));

const schema = z.object({
  serviceId: z.string().min(1),
  note: z.string(),
  estimatedHourlyRate: optionalNumeric,
  estimatedPriceRate: optionalNumeric,
  actualHourlyRate: optionalNumeric,
  actualPriceRate: optionalNumeric,
  discount: optionalNumeric,
  status: z.string().min(1).max(1),
});

type FormValues = z.infer<typeof schema>;

interface WorkOrderServiceEditSheetProps {
  open: boolean;
  id: string | null;
  workOrderId: string;
  onClose: () => void;
}

const defaultValues: FormValues = {
  serviceId: '',
  note: '',
  estimatedHourlyRate: '',
  estimatedPriceRate: '',
  actualHourlyRate: '',
  actualPriceRate: '',
  discount: '',
  status: 'A',
};

export function WorkOrderServiceEditSheet({
  open,
  id,
  workOrderId,
  onClose,
}: WorkOrderServiceEditSheetProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const isNew = id === null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues);

    setLoading(true);
    const tasks: Promise<void>[] = [
      getServicesForSelectAction().then((result) => {
        if (result.success) setServices(result.data);
      }),
    ];

    if (id) {
      tasks.push(
        getWorkOrderServiceByIdAction(id).then((result) => {
          if (result.success && result.data) {
            form.reset({
              serviceId: result.data.serviceId,
              note: result.data.note,
              estimatedHourlyRate: result.data.estimatedHourlyRate ?? '',
              estimatedPriceRate: result.data.estimatedPriceRate ?? '',
              actualHourlyRate: result.data.actualHourlyRate ?? '',
              actualPriceRate: result.data.actualPriceRate ?? '',
              discount: result.data.discount ?? '',
              status: result.data.status,
            });
          }
        }),
      );
    }

    Promise.all(tasks).then(() => setLoading(false));
  }, [open, id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: FormValues) {
    let result;
    if (isNew) {
      result = await createWorkOrderServiceAction(workOrderId, values);
    } else {
      result = await updateWorkOrderServiceAction(id!, values);
    }

    if (result.success) {
      toast.success(isNew ? t('work_orders.services.created') : t('work_orders.services.updated'));
      onClose();
    } else {
      toast.error(result.error);
    }
  }

  function NumericField({
    name,
    label,
    id: fieldId,
  }: {
    name: keyof FormValues;
    label: string;
    id: string;
  }) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldId}>{label}</Label>
        <Input id={fieldId} placeholder="0.00" {...form.register(name)} />
        {form.formState.errors[name] && (
          <p className="text-sm text-destructive">
            {form.formState.errors[name]?.message as string}
          </p>
        )}
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isNew ? t('work_orders.services.new') : t('work_orders.services.edit_title')}
          </SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex flex-col gap-4 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        )}

        {!loading && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
            {/* Servicio */}
            <div className="space-y-2">
              <Label htmlFor="wos-service">{t('work_orders.services.field.service')}</Label>
              <Select
                value={form.watch('serviceId')}
                onValueChange={(v) => form.setValue('serviceId', v ?? '', { shouldValidate: true })}
              >
                <SelectTrigger id="wos-service">
                  <SelectValue placeholder="—">
                    {services.find((s) => s.id === form.watch('serviceId'))?.name ?? ''}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.serviceId && (
                <p className="text-sm text-destructive">{form.formState.errors.serviceId.message}</p>
              )}
            </div>

            {/* Nota */}
            <div className="space-y-2">
              <Label htmlFor="wos-note">{t('work_orders.services.field.note')}</Label>
              <textarea
                id="wos-note"
                rows={3}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register('note')}
              />
            </div>

            {/* Numeric fields — 2 per row */}
            <div className="grid grid-cols-2 gap-3">
              <NumericField
                name="estimatedHourlyRate"
                label={t('work_orders.services.field.est_hourly')}
                id="wos-est-hourly"
              />
              <NumericField
                name="actualHourlyRate"
                label={t('work_orders.services.field.act_hourly')}
                id="wos-act-hourly"
              />
              <NumericField
                name="estimatedPriceRate"
                label={t('work_orders.services.field.est_price')}
                id="wos-est-price"
              />
              <NumericField
                name="actualPriceRate"
                label={t('work_orders.services.field.act_price')}
                id="wos-act-price"
              />
              <NumericField
                name="discount"
                label={t('work_orders.services.field.discount')}
                id="wos-discount"
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="wos-status">{t('work_orders.services.field.status')}</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => form.setValue('status', v ?? '', { shouldValidate: true })}
              >
                <SelectTrigger id="wos-status">
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
      </SheetContent>
    </Sheet>
  );
}
