'use client';

import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n';
import { type WorkOrderRow, type SortColumn } from '@/data/workOrders';
import { WorkOrderRowActions } from './WorkOrderRowActions';
import { buildUrl } from './urlHelpers';

type ActionType = 'edit' | 'delete' | 'services' | 'spareParts' | 'observations' | 'quote';

interface WorkOrdersTableProps {
  rows: WorkOrderRow[];
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
  searchParams: URLSearchParams;
  onAction: (type: ActionType, id: string) => void;
}

const COLUMNS: { key: SortColumn; labelKey: string }[] = [
  { key: 'id', labelKey: 'work_orders.col.id' },
  { key: 'code', labelKey: 'work_orders.col.code' },
  { key: 'clientName', labelKey: 'work_orders.col.client' },
  { key: 'mechanicName', labelKey: 'work_orders.col.mechanic' },
  { key: 'vehiclePlate', labelKey: 'work_orders.col.plate' },
  { key: 'maintenanceTypeName', labelKey: 'work_orders.col.maintenance' },
  { key: 'statusDescription', labelKey: 'work_orders.col.status' },
  { key: 'createdAt', labelKey: 'work_orders.col.created_at' },
];

export function WorkOrdersTable({
  rows,
  sortBy,
  sortDir,
  searchParams,
  onAction,
}: WorkOrdersTableProps) {
  const { t } = useI18n();
  const router = useRouter();

  function handleSort(col: SortColumn) {
    const newDir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
    router.replace(buildUrl(searchParams, { sortBy: col, sortDir: newDir, page: '1' }));
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
            <TableHead>{t('work_orders.col.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                {t('work_orders.no_data')}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell className="font-medium">{row.code}</TableCell>
                <TableCell>{row.clientName}</TableCell>
                <TableCell>{row.mechanicName ?? '—'}</TableCell>
                <TableCell>{row.vehiclePlate}</TableCell>
                <TableCell>{row.maintenanceTypeName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.statusDescription}</Badge>
                </TableCell>
                <TableCell>
                  {formatDate(row.createdAt)}
                </TableCell>
                <TableCell>
                  <WorkOrderRowActions
                    id={row.id}
                    onAction={onAction}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
