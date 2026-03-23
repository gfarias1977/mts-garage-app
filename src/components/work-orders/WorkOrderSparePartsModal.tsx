'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { ChevronDown, ChevronUp, ChevronsUpDown, Pencil, Trash2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n';
import { getWorkOrderSparePartsPagedAction } from '@/app/(dashboard)/work-orders/actions';
import type { GetSparePartsResult, SparePartSortColumn } from '@/data/workOrderSpareParts';
import { WorkOrderSparePartEditSheet } from './WorkOrderSparePartEditSheet';
import { WorkOrderSparePartDeleteDialog } from './WorkOrderSparePartDeleteDialog';

type ActiveModal =
  | { type: 'edit'; id: string | null }
  | { type: 'delete'; id: string }
  | null;

interface WorkOrderSparePartsModalProps {
  open: boolean;
  workOrderId: string;
  onClose: () => void;
}

export function WorkOrderSparePartsModal({ open, workOrderId, onClose }: WorkOrderSparePartsModalProps) {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SparePartSortColumn>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [data, setData] = useState<GetSparePartsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    getWorkOrderSparePartsPagedAction({
      workOrderId,
      page,
      pageSize,
      search,
      sortBy,
      sortDir,
    }).then((result) => {
      if (result.success) setData(result.data);
      setLoading(false);
    });
  }, [workOrderId, page, pageSize, search, sortBy, sortDir]);

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

  function handleSort(col: SparePartSortColumn) {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setPage(1);
  }

  function SortIcon({ col }: { col: SparePartSortColumn }) {
    if (sortBy !== col) return <ChevronsUpDown className="ml-1 inline h-3 w-3" />;
    return sortDir === 'asc'
      ? <ChevronUp className="ml-1 inline h-3 w-3" />
      : <ChevronDown className="ml-1 inline h-3 w-3" />;
  }

  const totalPages = data?.totalPages ?? 1;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('work_orders.spare_parts.title')}</DialogTitle>
        </DialogHeader>

        {loading && <Progress value={null} className="w-full" />}

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('work_orders.spare_parts.search')}
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
                  {t('work_orders.spare_parts.col.id')}
                  <SortIcon col="id" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('serviceId')}>
                  {t('work_orders.spare_parts.col.service')}
                  <SortIcon col="serviceId" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('description')}>
                  {t('work_orders.spare_parts.col.description')}
                  <SortIcon col="description" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('cost')}>
                  {t('work_orders.spare_parts.col.cost')}
                  <SortIcon col="cost" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('status')}>
                  {t('work_orders.spare_parts.col.status')}
                  <SortIcon col="status" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                  {t('work_orders.spare_parts.col.created_at')}
                  <SortIcon col="createdAt" />
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('createdBy')}>
                  {t('work_orders.spare_parts.col.created_by')}
                  <SortIcon col="createdBy" />
                </TableHead>
                <TableHead>{t('work_orders.spare_parts.col.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data || data.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-muted-foreground">
                    {t('work_orders.spare_parts.no_data')}
                  </TableCell>
                </TableRow>
              ) : (
                data.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.serviceName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{row.description}</TableCell>
                    <TableCell>{row.cost}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>
                      {formatDate(row.createdAt)}
                    </TableCell>
                    <TableCell>{row.createdBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setActiveModal({ type: 'edit', id: row.id })}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">{t('common.edit')}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setActiveModal({ type: 'delete', id: row.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t('common.delete')}</span>
                        </Button>
                      </div>
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

      <WorkOrderSparePartEditSheet
        open={activeModal?.type === 'edit'}
        id={activeModal?.type === 'edit' ? activeModal.id : null}
        workOrderId={workOrderId}
        onClose={() => { setActiveModal(null); loadData(); }}
      />
      <WorkOrderSparePartDeleteDialog
        open={activeModal?.type === 'delete'}
        id={activeModal?.type === 'delete' ? activeModal.id : null}
        onClose={() => { setActiveModal(null); loadData(); }}
      />
    </Dialog>
  );
}
