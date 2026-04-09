'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n';
import { type WorkOrderDetail } from '@/data/workOrders';

interface WorkOrderViewFormProps {
  workOrder: WorkOrderDetail;
}

export function WorkOrderViewForm({ workOrder }: WorkOrderViewFormProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label>{t('work_orders.field.code')}</Label>
        <Input value={workOrder.code} disabled />
      </div>

      <div className="space-y-2">
        <Label>{t('work_orders.field.client')}</Label>
        <Input value={workOrder.clientName} disabled />
      </div>

      <div className="space-y-2">
        <Label>{t('work_orders.field.mechanic')}</Label>
        <Input value={workOrder.mechanicName ?? '—'} disabled />
      </div>

      <div className="space-y-2">
        <Label>{t('work_orders.field.plate')}</Label>
        <Input value={workOrder.vehiclePlate} disabled />
      </div>

      <div className="space-y-2">
        <Label>{t('work_orders.field.maintenance')}</Label>
        <Input value={workOrder.maintenanceTypeName} disabled />
      </div>

      <div className="space-y-2">
        <Label>{t('work_orders.field.status')}</Label>
        <Input value={workOrder.statusDescription} disabled />
      </div>
    </div>
  );
}
