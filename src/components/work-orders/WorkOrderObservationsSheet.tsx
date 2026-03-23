'use client';

import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
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

export interface ObservationRow {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | null;
}

interface WorkOrderObservationsSheetProps {
  open: boolean;
  data: ObservationRow[];
  searchParams: URLSearchParams;
}

export function WorkOrderObservationsSheet({ open, data, searchParams }: WorkOrderObservationsSheetProps) {
  const { t } = useI18n();
  const router = useRouter();

  function handleClose() {
    router.replace(buildUrl(searchParams, { view: null, wor: null }));
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('work_orders.observations.title')}</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('work_orders.observations.col.author')}</TableHead>
                  <TableHead>{t('work_orders.observations.col.content')}</TableHead>
                  <TableHead>{t('work_orders.observations.col.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                      No se encontraron datos.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.authorName}</TableCell>
                      <TableCell>{row.content}</TableCell>
                      <TableCell>
                        {formatDate(row.createdAt)}
                      </TableCell>
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
