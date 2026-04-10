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
  getWorkOrderSparePartByIdAction,
  getWorkOrderServicesForSelectAction,
  createWorkOrderSparePartAction,
  updateWorkOrderSparePartAction,
} from '@/app/(dashboard)/work-orders/actions';

const STATUS_LABELS: Record<string, string> = { A: 'Activo', I: 'Inactivo' };

const numericFieldRegex = /^\d+(\.\d{1,2})?$/;

const INCREMENTAL_OPTIONS = Array.from({ length: 21 }, (_, i) => String(i * 5));

const schema = z.object({
  serviceId: z.string().min(1),
  description: z.string().min(1).max(255),
  cost: z.string().min(1).regex(numericFieldRegex, 'Ingrese un costo válido (ej: 1500.00)'),
  incrementalPercentage: z.string().min(1),
  adicionalCost: z.string().regex(numericFieldRegex, 'Ingrese un costo adicional válido (ej: 100.00)'),
  totalCost: z.string().regex(numericFieldRegex, 'Ingrese un costo total válido (ej: 1600.00)'),
  status: z.string().min(1).max(1),
});

type FormValues = z.infer<typeof schema>;

interface WorkOrderSparePartEditSheetProps {
  open: boolean;
  id: string | null;
  workOrderId: string;
  onClose: () => void;
}

export function WorkOrderSparePartEditSheet({
  open,
  id,
  workOrderId,
  onClose,
}: WorkOrderSparePartEditSheetProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<{ id: string; serviceName: string }[]>([]);
  const isNew = id === null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { serviceId: '', description: '', cost: '', incrementalPercentage: '0', adicionalCost: '0.00', totalCost: '0.00', status: 'A' },
  });

  const cost = form.watch('cost');
  const incrementalPercentage = form.watch('incrementalPercentage');

  useEffect(() => {
    const costNum = parseFloat(cost) || 0;
    const pctNum = parseFloat(incrementalPercentage) || 0;
    const adicional = costNum * pctNum / 100;
    const total = costNum + adicional;
    form.setValue('adicionalCost', adicional.toFixed(2));
    form.setValue('totalCost', total.toFixed(2));
  }, [cost, incrementalPercentage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    form.reset({ serviceId: '', description: '', cost: '', incrementalPercentage: '0', adicionalCost: '0.00', totalCost: '0.00', status: 'A' });

    setLoading(true);
    const tasks: Promise<void>[] = [
      getWorkOrderServicesForSelectAction(workOrderId).then((result) => {
        if (result.success) setServices(result.data);
      }),
    ];

    if (id) {
      tasks.push(
        getWorkOrderSparePartByIdAction(id).then((result) => {
          if (result.success && result.data) {
            form.reset({
              serviceId: result.data.serviceId,
              description: result.data.description,
              cost: result.data.cost,
              incrementalPercentage: result.data.incrementalPercentage ?? '0',
              adicionalCost: result.data.adicionalCost,
              totalCost: result.data.totalCost,
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
      result = await createWorkOrderSparePartAction(workOrderId, values);
    } else {
      result = await updateWorkOrderSparePartAction(id!, values);
    }

    if (result.success) {
      toast.success(isNew ? t('work_orders.spare_parts.created') : t('work_orders.spare_parts.updated'));
      onClose();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isNew ? t('work_orders.spare_parts.new') : t('work_orders.spare_parts.edit_title')}
          </SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}

        {!loading && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
            {/* Servicio */}
            <div className="space-y-2">
              <Label htmlFor="spr-service">{t('work_orders.spare_parts.field.service')}</Label>
              <Select
                value={form.watch('serviceId')}
                onValueChange={(v) => form.setValue('serviceId', v ?? '', { shouldValidate: true })}
              >
                <SelectTrigger id="spr-service">
                  <SelectValue placeholder="—">
                    {services.find((s) => s.id === form.watch('serviceId'))?.serviceName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.serviceName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.serviceId && (
                <p className="text-sm text-destructive">{form.formState.errors.serviceId.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="spr-description">{t('work_orders.spare_parts.field.description')}</Label>
              <Input
                id="spr-description"
                maxLength={255}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Costo */}
            <div className="space-y-2">
              <Label htmlFor="spr-cost">{t('work_orders.spare_parts.field.cost')}</Label>
              <Input
                id="spr-cost"
                placeholder="0.00"
                {...form.register('cost')}
              />
              {form.formState.errors.cost && (
                <p className="text-sm text-destructive">{form.formState.errors.cost.message}</p>
              )}
            </div>

            {/* Porcentaje Incremental */}
            <div className="space-y-2">
              <Label htmlFor="spr-incremental-pct">{t('work_orders.spare_parts.field.incremental_percentage')}</Label>
              <Select
                value={form.watch('incrementalPercentage')}
                onValueChange={(v) => form.setValue('incrementalPercentage', v, { shouldValidate: true })}
              >
                <SelectTrigger id="spr-incremental-pct" className="w-full">
                  <SelectValue placeholder="—">
                    {form.watch('incrementalPercentage') !== ''
                      ? `${form.watch('incrementalPercentage')}%`
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {INCREMENTAL_OPTIONS.map((v) => (
                    <SelectItem key={v} value={v}>{v}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Costo Adicional (calculado) */}
            <div className="space-y-2">
              <Label htmlFor="spr-additional-cost">{t('work_orders.spare_parts.field.additional_cost')}</Label>
              <Input
                id="spr-additional-cost"
                readOnly
                tabIndex={-1}
                className="bg-muted cursor-not-allowed"
                {...form.register('adicionalCost')}
              />
            </div>

            {/* Costo Total (calculado) */}
            <div className="space-y-2">
              <Label htmlFor="spr-total-cost">{t('work_orders.spare_parts.field.total_cost')}</Label>
              <Input
                id="spr-total-cost"
                readOnly
                tabIndex={-1}
                className="bg-muted cursor-not-allowed"
                {...form.register('totalCost')}
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="spr-status">{t('work_orders.spare_parts.field.status')}</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => form.setValue('status', v ?? '', { shouldValidate: true })}
              >
                <SelectTrigger id="spr-status">
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
