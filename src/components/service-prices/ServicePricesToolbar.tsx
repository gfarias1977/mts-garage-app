'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { buildUrl } from './urlHelpers';

interface ServicePricesToolbarProps {
  search: string;
  serviceId: string;
  searchParams: URLSearchParams;
  navigate: (url: string) => void;
  onNew: () => void;
}

export function ServicePricesToolbar({
  search,
  serviceId,
  searchParams,
  navigate,
  onNew,
}: ServicePricesToolbarProps) {
  const { t } = useI18n();
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearch(value);
      const timeout = setTimeout(() => {
        navigate(buildUrl(searchParams, serviceId, { search: value || null, page: '1' }));
      }, 300);
      return () => clearTimeout(timeout);
    },
    [navigate, searchParams, serviceId],
  );

  return (
    <div className="flex items-center justify-between gap-2">
      <Input
        placeholder={t('service_prices.search')}
        value={localSearch}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-9 w-64"
      />
      <Button onClick={onNew} size="sm">
        <PlusIcon className="size-4" />
        {t('service_prices.new')}
      </Button>
    </div>
  );
}
