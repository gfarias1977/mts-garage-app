'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n';
import { buildUrl } from './urlHelpers';

interface ClientsPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  searchParams: URLSearchParams;
  navigate: (url: string) => void;
}

export function ClientsPagination({
  page,
  pageSize,
  total,
  totalPages,
  searchParams,
  navigate,
}: ClientsPaginationProps) {
  const { t } = useI18n();

  function go(newPage: number) {
    navigate(buildUrl(searchParams, { page: String(newPage) }));
  }

  function handlePageSize(value: string | null) {
    if (!value) return;
    navigate(buildUrl(searchParams, { pageSize: value, page: '1' }));
  }

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{t('table.rows_per_page')}</span>
        <Select value={String(pageSize)} onValueChange={handlePageSize}>
          <SelectTrigger size="sm" className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          {t('table.page')} {page} {t('table.of')} {totalPages} ({total} registros)
        </span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => go(1)}>
            {t('table.first')}
          </Button>
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => go(page - 1)}>
            {t('table.prev')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => go(page + 1)}
          >
            {t('table.next')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => go(totalPages)}
          >
            {t('table.last')}
          </Button>
        </div>
      </div>
    </div>
  );
}
