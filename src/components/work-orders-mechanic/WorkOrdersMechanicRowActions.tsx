'use client';

import { Pencil, Eye, Stethoscope } from 'lucide-react';
import { useI18n } from '@/i18n';

type ActionType = 'edit' | 'observations' | 'diagnosis';

interface WorkOrdersMechanicRowActionsProps {
  id: string;
  onAction: (type: ActionType, id: string) => void;
}

export function WorkOrdersMechanicRowActions({ id, onAction }: WorkOrdersMechanicRowActionsProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-1">
      <button
        className="rounded p-1 hover:bg-muted transition-colors"
        title={t('common.edit')}
        onClick={() => onAction('edit', id)}
      >
        <Pencil size={15} />
      </button>
      <button
        className="rounded p-1 hover:bg-muted transition-colors"
        title={t('work_orders.view_diagnosis')}
        onClick={() => onAction('diagnosis', id)}
      >
        <Stethoscope size={15} />
      </button>
      <button
        className="rounded p-1 hover:bg-muted transition-colors"
        title={t('work_orders.view_observations')}
        onClick={() => onAction('observations', id)}
      >
        <Eye size={15} />
      </button>
    </div>
  );
}
