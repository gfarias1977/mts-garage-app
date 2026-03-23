'use client';

import { formatDate } from '@/lib/utils';
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n';
import { type ClientTypeRow, type SortColumn } from '@/data/clientTypes';
import { ClientTypeRowActions } from './ClientTypeRowActions';
import { buildUrl } from './urlHelpers';

type ActionType = 'edit' | 'delete';

interface ClientTypesTableProps {
  rows: ClientTypeRow[];
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
  searchParams: URLSearchParams;
  navigate: (url: string) => void;
  onAction: (type: ActionType, id: string) => void;
}

const COLUMNS: { key: SortColumn; labelKey: string }[] = [
  { key: 'id', labelKey: 'client_types.col.id' },
  { key: 'name', labelKey: 'client_types.col.name' },
  { key: 'createdAt', labelKey: 'client_types.col.created_at' },
  { key: 'createdBy', labelKey: 'client_types.col.created_by' },
  { key: 'status', labelKey: 'client_types.col.status' },
];

export function ClientTypesTable({
  rows,
  sortBy,
  sortDir,
  searchParams,
  navigate,
  onAction,
}: ClientTypesTableProps) {
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
            <TableHead>{t('client_types.col.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                {t('client_types.no_data')}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  {formatDate(row.createdAt)}
                </TableCell>
                <TableCell>{row.createdBy}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.status}</Badge>
                </TableCell>
                <TableCell>
                  <ClientTypeRowActions id={row.id} onAction={onAction} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
