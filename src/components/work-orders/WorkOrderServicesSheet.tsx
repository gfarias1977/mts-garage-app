'use client';

import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useI18n } from '@/i18n';
import { buildUrl } from './urlHelpers';

export interface ServiceRow {
  id: string;
  serviceName: string;
  note: string;
  estimatedHourlyRate: string | null;
  actualHourlyRate: string | null;
  estimatedPriceRate: string | null;
  actualPriceRate: string | null;
  discount: string | null;
  status: string;
  createdAt: Date | null;
}

interface WorkOrderServicesSheetProps {
  open: boolean;
  data: ServiceRow[];
  searchParams: URLSearchParams;
}

export function WorkOrderServicesSheet({ open, data, searchParams }: WorkOrderServicesSheetProps) {
  const { t } = useI18n();
  const router = useRouter();

  function handleClose() {
    router.replace(buildUrl(searchParams, { view: null, wor: null }));
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('work_orders.services.title')}</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('work_orders.services.col.service')}</TableHead>
                  <TableHead>{t('work_orders.services.col.note')}</TableHead>
                  <TableHead>{t('work_orders.services.col.est_hourly')}</TableHead>
                  <TableHead>{t('work_orders.services.col.act_hourly')}</TableHead>
                  <TableHead>{t('work_orders.services.col.est_price')}</TableHead>
                  <TableHead>{t('work_orders.services.col.act_price')}</TableHead>
                  <TableHead>{t('work_orders.services.col.discount')}</TableHead>
                  <TableHead>{t('work_orders.services.col.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                      No se encontraron datos.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.serviceName}</TableCell>
                      <TableCell>{row.note}</TableCell>
                      <TableCell>{row.estimatedHourlyRate ?? '—'}</TableCell>
                      <TableCell>{row.actualHourlyRate ?? '—'}</TableCell>
                      <TableCell>{row.estimatedPriceRate ?? '—'}</TableCell>
                      <TableCell>{row.actualPriceRate ?? '—'}</TableCell>
                      <TableCell>{row.discount ?? '—'}</TableCell>
                      <TableCell>{row.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
