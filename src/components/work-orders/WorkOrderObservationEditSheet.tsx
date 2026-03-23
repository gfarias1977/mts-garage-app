'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
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
import { useI18n } from '@/i18n';
import {
  getWorkOrderObservationByIdAction,
  createWorkOrderObservationAction,
  updateWorkOrderObservationAction,
} from '@/app/(dashboard)/work-orders/actions';

const schema = z.object({
  authorName: z.string().min(1).max(100),
  content: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

interface WorkOrderObservationEditSheetProps {
  open: boolean;
  id: string | null;
  workOrderId: string;
  onClose: () => void;
}

export function WorkOrderObservationEditSheet({
  open,
  id,
  workOrderId,
  onClose,
}: WorkOrderObservationEditSheetProps) {
  const { t } = useI18n();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const isNew = id === null;

  const clerkName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ')
    : '';

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { authorName: '', content: '' },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ authorName: clerkName, content: '' });

    if (id) {
      setLoading(true);
      getWorkOrderObservationByIdAction(id).then((result) => {
        if (result.success && result.data) {
          form.reset({
            authorName: result.data.authorName,
            content: result.data.content,
          });
        }
        setLoading(false);
      });
    }
  }, [open, id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: FormValues) {
    let result;
    if (isNew) {
      result = await createWorkOrderObservationAction(workOrderId, values);
    } else {
      result = await updateWorkOrderObservationAction(id!, values);
    }

    if (result.success) {
      toast.success(isNew ? t('work_orders.observations.created') : t('work_orders.observations.updated'));
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
            {isNew ? t('work_orders.observations.new') : t('work_orders.observations.edit_title')}
          </SheetTitle>
        </SheetHeader>

        {loading && (
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {!loading && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="obs-author">{t('work_orders.observations.field.author')}</Label>
              <Input
                id="obs-author"
                readOnly
                className="bg-muted text-muted-foreground cursor-default"
                {...form.register('authorName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="obs-content">{t('work_orders.observations.field.content')}</Label>
              <textarea
                id="obs-content"
                rows={5}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register('content')}
              />
              {form.formState.errors.content && (
                <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
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
