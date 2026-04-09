'use client';

import { Car, Pencil, Trash2 } from 'lucide-react';
import { useI18n } from '@/i18n';

type ActionType = 'edit' | 'delete' | 'vehicles';

interface CheckListGarageRowActionsProps {
  id: string;
  onAction: (type: ActionType, id: string) => void;
}

export function CheckListGarageRowActions({ id, onAction }: CheckListGarageRowActionsProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-1">
      <button
        className="rounded p-1 hover:bg-muted transition-colors"
        title={t('check_list_garage.view_vehicles')}
        onClick={() => onAction('vehicles', id)}
      >
        <Car size={15} />
      </button>
      <button
        className="rounded p-1 hover:bg-muted transition-colors"
        title={t('common.edit')}
        onClick={() => onAction('edit', id)}
      >
        <Pencil size={15} />
      </button>
      <button
        className="rounded p-1 hover:bg-muted transition-colors"
        title={t('common.delete')}
        onClick={() => onAction('delete', id)}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
