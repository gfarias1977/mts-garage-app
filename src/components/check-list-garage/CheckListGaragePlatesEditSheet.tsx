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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n';
import {
  getCheckListGaragePlateByIdAction,
  createCheckListGaragePlateAction,
  updateCheckListGaragePlateAction,
} from '@/app/(dashboard)/check-list-garage/actions';

const STATUS_OPTIONS = [
  { value: 'A', label: 'Activo' },
  { value: 'I', label: 'Inactivo' },
];

const schema = z.object({
  vehiclePlate: z.string().max(20).optional(),
  status: z.string().min(1).max(10),
});

type FormValues = z.infer<typeof schema>;

interface CheckListGaragePlatesEditSheetProps {
  open: boolean;
  id: string | null;
  checkListGarageId: string;
  onClose: () => void;
}

export function CheckListGaragePlatesEditSheet({
  open,
  id,
  checkListGarageId,
  onClose,
}: CheckListGaragePlatesEditSheetProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const isNew = id === null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vehiclePlate: '', status: 'A' },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ vehiclePlate: '', status: 'A' });

    if (id) {
      setLoading(true);
      getCheckListGaragePlateByIdAction(id).then((result) => {
        if (result.success && result.data) {
          form.reset({
            vehiclePlate: result.data.vehiclePlate ?? '',
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
      result = await createCheckListGaragePlateAction(checkListGarageId, values);
    } else {
      result = await updateCheckListGaragePlateAction(id as string, values);
    }

    if (result.success) {
      toast.success(
        isNew
          ? t('check_list_garage_plates.created')
          : t('check_list_garage_plates.updated'),
      );
      onClose();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isNew
              ? t('check_list_garage_plates.new')
              : t('check_list_garage_plates.edit_title')}
          </SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}

        {!loading && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="clgp-plate">{t('check_list_garage_plates.field.vehicle_plate')}</Label>
              <Input id="clgp-plate" {...form.register('vehiclePlate')} />
              {form.formState.errors.vehiclePlate && (
                <p className="text-sm text-destructive">{form.formState.errors.vehiclePlate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clgp-status">{t('check_list_garage_plates.field.status')}</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => v && form.setValue('status', v, { shouldValidate: true })}
              >
                <SelectTrigger id="clgp-status" className="w-full">
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
      </SheetContent>
    </Sheet>
  );
}
