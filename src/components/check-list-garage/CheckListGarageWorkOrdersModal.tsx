'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n';
import { getCheckListGarageWorkOrdersPagedAction } from '@/app/(dashboard)/check-list-garage/actions';
import type {
  GetCheckListGarageWorkOrdersResult,
  CheckListGarageWorkOrderSortColumn,
} from '@/data/checkListGarageWorkOrders';

interface CheckListGarageWorkOrdersModalProps {
  open: boolean;
  vehiclePlate: string;
  onClose: () => void;
}

export function CheckListGarageWorkOrdersModal({
  open,
  vehiclePlate,
  onClose,
}: CheckListGarageWorkOrdersModalProps) {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<CheckListGarageWorkOrderSortColumn>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [data, setData] = useState<GetCheckListGarageWorkOrdersResult | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(() => {
    if (!vehiclePlate) return;
    setLoading(true);
    getCheckListGarageWorkOrdersPagedAction({
      vehiclePlate,
      page,
      pageSize,
      search,
      sortBy,
      sortDir,
    }).then((result) => {
      if (result.success) setData(result.data);
      setLoading(false);
    });
  }, [vehiclePlate, page, pageSize, search, sortBy, sortDir]);

  useEffect(() => {
    if (!open) return;
    loadData();
  }, [open, loadData]);

  function handleSearchChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  }

  function handleSort(col: CheckListGarageWorkOrderSortColumn) {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
    setPage(1);
  }

  function SortIcon({ col }: { col: CheckListGarageWorkOrderSortColumn }) {
    if (sortBy !== col) return <ChevronsUpDown className="ml-1 inline h-3 w-3" />;
    return sortDir === 'asc'
      ? <ChevronUp className="ml-1 inline h-3 w-3" />
      : <ChevronDown className="ml-1 inline h-3 w-3" />;
  }

  const totalPages = data?.totalPages ?? 1;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:w-auto sm:max-w-[90vw] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('check_list_garage_work_orders.title')}
            {vehiclePlate && (
              <span className="ml-2 font-mono text-sm text-muted-foreground">— {vehiclePlate}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading && <Progress value={null} className="w-full" />}

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('check_list_garage_work_orders.search')}
            className="max-w-xs"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('id')}>
                  {t('check_list_garage_work_orders.col.id')}
                  <SortIcon col="id" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('workOrderId')}>
                  {t('check_list_garage_work_orders.col.work_order_id')}
                  <SortIcon col="workOrderId" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('clientId')}>
                  {t('check_list_garage_work_orders.col.client_id')}
                  <SortIcon col="clientId" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('mechanicId')}>
                  {t('check_list_garage_work_orders.col.mechanic_id')}
                  <SortIcon col="mechanicId" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('vehiclePlate')}>
                  {t('check_list_garage_work_orders.col.vehicle_plate')}
                  <SortIcon col="vehiclePlate" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                  {t('check_list_garage_work_orders.col.created_at')}
                  <SortIcon col="createdAt" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('createdBy')}>
                  {t('check_list_garage_work_orders.col.created_by')}
                  <SortIcon col="createdBy" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('status')}>
                  {t('check_list_garage_work_orders.col.status')}
                  <SortIcon col="status" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data || data.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                    {t('check_list_garage_work_orders.no_data')}
                  </TableCell>
                </TableRow>
              ) : (
                data.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.id}</TableCell>
                    <TableCell className="font-mono text-xs">{row.workOrderId}</TableCell>
                    <TableCell>{row.clientId}</TableCell>
                    <TableCell>{row.mechanicId ?? '—'}</TableCell>
                    <TableCell>{row.vehiclePlate}</TableCell>
                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                    <TableCell>{row.createdBy}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('table.rows_per_page')}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page <= 1}>
              {t('table.first')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
              {t('table.prev')}
            </Button>
            <span className="px-2 text-sm">
              {t('table.page')} {page} {t('table.of')} {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
              {t('table.next')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
              {t('table.last')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
