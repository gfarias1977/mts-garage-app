'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DownloadIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { buildTemparioUrl } from './urlHelpers';
import { getTemparioExportAction } from '@/app/(dashboard)/tempario/actions';
import { type TemparioSortColumn } from '@/data/tempario';

interface TemparioToolbarProps {
  search: string;
  dateFrom: string;
  dateTo: string;
  searchParams: URLSearchParams;
  startTransition: (fn: () => void) => void;
  filterParams: {
    search: string;
    dateFrom: string;
    dateTo: string;
    sortBy: TemparioSortColumn;
    sortDir: 'asc' | 'desc';
  };
}

export function TemparioToolbar({
  search,
  dateFrom,
  dateTo,
  searchParams,
  startTransition,
  filterParams,
}: TemparioToolbarProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(search);
  const [exporting, setExporting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  function handleSearch(value: string) {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        router.replace(
          buildTemparioUrl(searchParams, { search: value || null, page: '1' }),
        );
      });
    }, 300);
  }

  function handleDateFrom(value: string) {
    startTransition(() => {
      router.replace(
        buildTemparioUrl(searchParams, { dateFrom: value || null, page: '1' }),
      );
    });
  }

  function handleDateTo(value: string) {
    startTransition(() => {
      router.replace(
        buildTemparioUrl(searchParams, { dateTo: value || null, page: '1' }),
      );
    });
  }

  async function handleExport() {
    setExporting(true);
    try {
      const result = await getTemparioExportAction(filterParams);
      if (!result.success) throw new Error(result.error);

      const XLSX = await import('xlsx');
      const wsData = result.data.map((row) => ({
        FECHA: row.fecha ? format(new Date(row.fecha), 'dd/MM/yyyy') : '',
        MES: row.mes ?? '',
        OT: row.ot,
        APROBACION: row.aprobacionDesc ?? row.aprobacion,
        PATENTE: row.patente,
        RESPONSABLE: row.responsable ?? '',
        KM: '',
        CLIENTE: row.cliente ?? '',
        MODELO: '',
        'DESCRIPCION M.O': row.descripcionMO ?? '',
        'HRS. TRABAJO': row.hrsTrabajoRate != null ? parseFloat(row.hrsTrabajoRate) : '',
        'VALOR MANO DE OBRA': row.valorManoDeObra != null ? parseFloat(row.valorManoDeObra) : '',
        REPUESTOS: row.repuesto ?? '',
        CANTIDAD: row.cantidad != null ? parseFloat(row.cantidad) : '',
        'VALOR REPUESTOS': row.valorRepuesto != null ? parseFloat(row.valorRepuesto) : '',
        '%': row.porcentaje != null ? parseFloat(row.porcentaje) : '',
        'GESTION REPUESTO': '',
        OBSERVACION: row.observacion ?? '',
        'GESTION REPUESTO 2': '',
        'TOTAL REPUESTO': row.totalRepuesto != null ? parseFloat(row.totalRepuesto) : '',
        'TOTAL CLP': '',
        TIPO: '',
        OBSERVACION2: '',
        OC: '',
        FACTURADO: '',
      }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tempario');
      const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([buf], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tempario_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Error al exportar');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-8 w-64"
          placeholder={t('tempario.search')}
          value={localSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t('tempario.date_from')}</span>
        <Input
          type="date"
          className="w-40"
          value={dateFrom}
          onChange={(e) => handleDateFrom(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t('tempario.date_to')}</span>
        <Input
          type="date"
          className="w-40"
          value={dateTo}
          onChange={(e) => handleDateTo(e.target.value)}
        />
      </div>

      <Button
        variant="outline"
        className="ml-auto gap-2"
        onClick={handleExport}
        disabled={exporting}
      >
        <DownloadIcon size={16} />
        {exporting ? t('tempario.exporting') : t('tempario.export')}
      </Button>
    </div>
  );
}
