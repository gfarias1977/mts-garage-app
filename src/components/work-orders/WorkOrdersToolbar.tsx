'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { buildUrl } from './urlHelpers';
import { type SortColumn } from '@/data/workOrders';

interface WorkOrdersToolbarProps {
  search: string;
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
  searchParams: URLSearchParams;
  onNew: () => void;
}

export function WorkOrdersToolbar({ search, searchParams, onNew }: WorkOrdersToolbarProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearch(value);
      const timeout = setTimeout(() => {
        router.replace(
          buildUrl(searchParams, { search: value || null, page: '1' }),
        );
      }, 300);
      return () => clearTimeout(timeout);
    },
    [router, searchParams],
  );

  return (
    <div className="flex items-center justify-between gap-2">
      <Input
        placeholder={t('work_orders.search')}
        value={localSearch}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-9 w-64"
      />
      <Button onClick={onNew} size="sm">
        <PlusIcon className="size-4" />
        {t('work_orders.new')}
      </Button>
    </div>
  );
}
