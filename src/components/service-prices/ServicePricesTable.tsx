'use client';

import { formatDate } from '@/lib/utils';
import { ChevronsUpDown, ChevronUp, ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n';
import { type ServicePriceRow, type SortColumn } from '@/data/servicePrices';
import { ServicePriceRowActions } from './ServicePriceRowActions';
import { buildUrl } from './urlHelpers';

type ActionType = 'edit' | 'delete';

interface ServicePricesTableProps {
  rows: ServicePriceRow[];
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
  serviceId: string;
  searchParams: URLSearchParams;
  navigate: (url: string) => void;
  onAction: (type: ActionType, id: string) => void;
}

const COLUMNS: { key: SortColumn; labelKey: string }[] = [
  { key: 'id', labelKey: 'service_prices.col.id' },
  { key: 'price', labelKey: 'service_prices.col.price' },
  { key: 'estimatedHourlyRate', labelKey: 'service_prices.col.hourly_rate' },
  { key: 'currency', labelKey: 'service_prices.col.currency' },
  { key: 'isCurrent', labelKey: 'service_prices.col.is_current' },
  { key: 'createdAt', labelKey: 'service_prices.col.created_at' },
  { key: 'createdBy', labelKey: 'service_prices.col.created_by' },
];

export function ServicePricesTable({
  rows,
  sortBy,
  sortDir,
  serviceId,
  searchParams,
  navigate,
  onAction,
}: ServicePricesTableProps) {
  const { t } = useI18n();

  function handleSort(col: SortColumn) {
    const newDir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
    navigate(buildUrl(searchParams, serviceId, { sortBy: col, sortDir: newDir, page: '1' }));
  }

  function SortIcon({ col }: { col: SortColumn }) {
    if (sortBy !== col) return <ChevronsUpDown className="ml-1 inline size-3" />;
    return sortDir === 'asc'
      ? <ChevronUp className="ml-1 inline size-3" />
      : <ChevronDown className="ml-1 inline size-3" />;
  }

  function formatAmount(value: string | null) {
    if (!value) return '—';
    return Number(value).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableHead key={col.key}>
                <button
                  onClick={() => handleSort(col.key)}
                  className="flex items-center font-medium hover:text-foreground"
                >
                  {t(col.labelKey as Parameters<typeof t>[0])}
                  <SortIcon col={col.key} />
                </button>
              </TableHead>
            ))}
            <TableHead>{t('service_prices.col.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                {t('service_prices.no_data')}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell className="font-medium tabular-nums">
                  {formatAmount(row.price)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatAmount(row.estimatedHourlyRate)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{row.currency}</Badge>
                </TableCell>
                <TableCell>
                  {row.isCurrent ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : (
                    <Circle size={16} className="text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell>
                  {formatDate(row.createdAt)}
                </TableCell>
                <TableCell>{row.createdBy}</TableCell>
                <TableCell>
                  <ServicePriceRowActions id={row.id} onAction={onAction} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
