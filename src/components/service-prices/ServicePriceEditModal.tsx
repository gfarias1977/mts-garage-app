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
import { useI18n } from '@/i18n';
import {
  getServicePriceByIdAction,
  createServicePriceAction,
  updateServicePriceAction,
} from '@/app/(dashboard)/services/[serviceId]/prices/actions';

const schema = z.object({
  price: z.string().min(1).regex(/^\d+(\.\d{1,2})?$/, 'Ingrese un precio válido (ej: 1500.00)'),
  estimatedHourlyRate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Ingrese una tarifa válida')
    .optional()
    .or(z.literal('')),
  currency: z.string().min(1).max(10),
  isCurrent: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface ServicePriceEditModalProps {
  open: boolean;
  id: string | null;
  serviceId: string;
  onClose: () => void;
}

export function ServicePriceEditModal({ open, id, serviceId, onClose }: ServicePriceEditModalProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isNew = id === null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { price: '', estimatedHourlyRate: '', currency: 'CLP', isCurrent: false },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ price: '', estimatedHourlyRate: '', currency: 'CLP', isCurrent: false });

    if (id) {
      setLoading(true);
      getServicePriceByIdAction(id, serviceId).then((result) => {
        if (result.success && result.data) {
          form.reset({
            price: result.data.price,
            estimatedHourlyRate: result.data.estimatedHourlyRate ?? '',
            currency: result.data.currency,
            isCurrent: result.data.isCurrent,
          });
        }
        setLoading(false);
      });
    }
  }, [open, id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: FormValues) {
    const payload = {
      serviceId,
      price: values.price,
      estimatedHourlyRate: values.estimatedHourlyRate || undefined,
      currency: values.currency,
      isCurrent: values.isCurrent,
    };

    let result;
    if (isNew) {
      result = await createServicePriceAction(payload);
    } else {
      result = await updateServicePriceAction({ ...payload, id: id! });
    }

    if (result.success) {
      toast.success(isNew ? t('service_prices.created') : t('service_prices.updated'));
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
            {isNew ? t('service_prices.new') : t('service_prices.edit_title')}
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
            {/* Precio */}
            <div className="space-y-2">
              <Label htmlFor="srp-price">{t('service_prices.field.price')}</Label>
              <Input
                id="srp-price"
                placeholder="0.00"
                {...form.register('price')}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>

            {/* Tarifa H/H estimada */}
            <div className="space-y-2">
              <Label htmlFor="srp-rate">{t('service_prices.field.hourly_rate')}</Label>
              <Input
                id="srp-rate"
                placeholder="0.00"
                {...form.register('estimatedHourlyRate')}
              />
              {form.formState.errors.estimatedHourlyRate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.estimatedHourlyRate.message}
                </p>
              )}
            </div>

            {/* Moneda */}
            <div className="space-y-2">
              <Label htmlFor="srp-currency">{t('service_prices.field.currency')}</Label>
              <Input
                id="srp-currency"
                maxLength={10}
                {...form.register('currency')}
              />
              {form.formState.errors.currency && (
                <p className="text-sm text-destructive">{form.formState.errors.currency.message}</p>
              )}
            </div>

            {/* Precio vigente */}
            <div className="flex items-center gap-3">
              <input
                id="srp-current"
                type="checkbox"
                className="h-4 w-4 rounded border border-input"
                {...form.register('isCurrent')}
              />
              <Label htmlFor="srp-current" className="cursor-pointer">
                {t('service_prices.field.is_current')}
              </Label>
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
