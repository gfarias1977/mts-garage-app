'use client';

import { formatDate } from '@/lib/utils';
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n';
import { type VehicleRow, type SortColumn } from '@/data/vehicles';
import { VehicleRowActions } from './VehicleRowActions';
import { buildUrl } from './urlHelpers';

type ActionType = 'edit' | 'delete';

interface VehiclesTableProps {
  rows: VehicleRow[];
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
  searchParams: URLSearchParams;
  navigate: (url: string) => void;
  onAction: (type: ActionType, id: string) => void;
}

const COLUMNS: { key: SortColumn; labelKey: string }[] = [
  { key: 'id', labelKey: 'vehicles.col.id' },
  { key: 'clientName', labelKey: 'vehicles.col.client' },
  { key: 'name', labelKey: 'vehicles.col.name' },
  { key: 'email', labelKey: 'vehicles.col.email' },
  { key: 'phone', labelKey: 'vehicles.col.phone' },
  { key: 'createdAt', labelKey: 'vehicles.col.created_at' },
  { key: 'createdBy', labelKey: 'vehicles.col.created_by' },
  { key: 'status', labelKey: 'vehicles.col.status' },
];

export function VehiclesTable({
  rows,
  sortBy,
  sortDir,
  searchParams,
  navigate,
  onAction,
}: VehiclesTableProps) {
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
            <TableHead>{t('vehicles.col.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                {t('vehicles.no_data')}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell>{row.clientName}</TableCell>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.email ?? '—'}</TableCell>
                <TableCell>{row.phone ?? '—'}</TableCell>
                <TableCell>
                  {formatDate(row.createdAt)}
                </TableCell>
                <TableCell>{row.createdBy}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.status}</Badge>
                </TableCell>
                <TableCell>
                  <VehicleRowActions id={row.id} onAction={onAction} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
