'use client';

import { Pencil, Trash2, Wrench, Package, Eye, FileText } from 'lucide-react';
import { useI18n } from '@/i18n';

type ActionType = 'edit' | 'delete' | 'services' | 'spareParts' | 'observations' | 'quote';

interface WorkOrderRowActionsProps {
  id: string;
  onAction: (type: ActionType, id: string) => void;
}

export function WorkOrderRowActions({ id, onAction }: WorkOrderRowActionsProps) {
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
        className="rounded p-1 hover:bg-muted transition-colors text-destructive"
        title={t('common.delete')}
        onClick={() => onAction('delete', id)}
      >
        <Trash2 size={15} />
      </button>
      <button
        className="rounded p-1 hover:bg-muted transition-colors"
        title={t('work_orders.view_services')}
        onClick={() => onAction('services', id)}
      >
        <Wrench size={15} />
      </button>
      <button
        className="rounded p-1 hover:bg-muted transition-colors"
        title={t('work_orders.view_spare_parts')}
        onClick={() => onAction('spareParts', id)}
      >
        <Package size={15} />
      </button>
      <button
        className="rounded p-1 hover:bg-muted transition-colors"
        title={t('work_orders.view_observations')}
        onClick={() => onAction('observations', id)}
      >
        <Eye size={15} />
      </button>
      <button
        className="rounded p-1 hover:bg-muted transition-colors"
        title={t('work_orders.view_quote')}
        onClick={() => onAction('quote', id)}
      >
        <FileText size={15} />
      </button>
    </div>
  );
}
