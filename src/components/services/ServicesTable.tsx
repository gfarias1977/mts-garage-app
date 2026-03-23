'use client';

import { formatDate } from '@/lib/utils';
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n';
import { type ServiceRow, type SortColumn } from '@/data/services';
import { ServiceRowActions, type ActionType } from './ServiceRowActions';
import { buildUrl } from './urlHelpers';

interface ServicesTableProps {
  rows: ServiceRow[];
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
  searchParams: URLSearchParams;
  navigate: (url: string) => void;
  onAction: (type: ActionType, id: string) => void;
}


const COLUMNS: { key: SortColumn; labelKey: string }[] = [
  { key: 'id', labelKey: 'services.col.id' },
  { key: 'categoryName', labelKey: 'services.col.category' },
  { key: 'name', labelKey: 'services.col.name' },
  { key: 'description', labelKey: 'services.col.description' },
  { key: 'createdAt', labelKey: 'services.col.created_at' },
  { key: 'createdBy', labelKey: 'services.col.created_by' },
  { key: 'status', labelKey: 'services.col.status' },
];

export function ServicesTable({
  rows,
  sortBy,
  sortDir,
  searchParams,
  navigate,
  onAction,
}: ServicesTableProps) {
  const { t } = useI18n();

  function handleSort(col: SortColumn) {
    const newDir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
    navigate(buildUrl(searchParams, { sortBy: col, sortDir: newDir, page: '1' }));
  }

  function SortIcon({ col }: { col: SortColumn }) {
    if (sortBy !== col) return <ChevronsUpDown className="ml-1 inline size-3" />;
    return sortDir === 'asc'
      ? <ChevronUp className="ml-1 inline size-3" />
      : <ChevronDown className="ml-1 inline size-3" />;
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
            <TableHead>{t('services.col.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                {t('services.no_data')}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell>{row.categoryName}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                  {row.description ?? '—'}
                </TableCell>
                <TableCell>
                  {formatDate(row.createdAt)}
                </TableCell>
                <TableCell>{row.createdBy}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.status}</Badge>
                </TableCell>
                <TableCell>
                  <ServiceRowActions id={row.id} onAction={onAction} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
