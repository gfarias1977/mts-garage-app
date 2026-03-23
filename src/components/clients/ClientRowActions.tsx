'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useI18n } from '@/i18n';

type ActionType = 'edit' | 'delete';

interface ClientRowActionsProps {
  id: string;
  onAction: (type: ActionType, id: string) => void;
}

export function ClientRowActions({ id, onAction }: ClientRowActionsProps) {
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
    </div>
  );
}
