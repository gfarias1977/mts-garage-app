'use client';

import { Pencil, Trash2, DollarSign } from 'lucide-react';
import { useI18n } from '@/i18n';

export type ActionType = 'edit' | 'delete' | 'prices';

interface ServiceRowActionsProps {
  id: string;
  onAction: (type: ActionType, id: string) => void;
}

export function ServiceRowActions({ id, onAction }: ServiceRowActionsProps) {
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
        className="rounded p-1 hover:bg-muted transition-colors text-primary"
        title={t('services.view_prices')}
        onClick={() => onAction('prices', id)}
      >
        <DollarSign size={15} />
      </button>
    </div>
  );
}
