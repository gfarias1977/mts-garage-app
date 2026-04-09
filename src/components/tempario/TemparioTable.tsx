'use client';

import { useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/i18n';
import { type TemparioRow, type TemparioSortColumn } from '@/data/tempario';
import { buildTemparioUrl } from './urlHelpers';

type SortableCol = {
  key: TemparioSortColumn;
  labelKey: string;
  sortable: true;
  minWidth?: string;
};

type PlainCol = {
  key: string;
  labelKey: string;
  sortable: false;
  minWidth?: string;
};

type ColDef = SortableCol | PlainCol;

const COLUMNS: ColDef[] = [
  { key: 'fecha',           labelKey: 'tempario.col.fecha',           sortable: true,  minWidth: '100px' },
  { key: 'mes',             labelKey: 'tempario.col.mes',             sortable: true,  minWidth: '60px'  },
  { key: 'ot',              labelKey: 'tempario.col.ot',              sortable: true,  minWidth: '100px' },
  { key: 'aprobacion',      labelKey: 'tempario.col.aprobacion',      sortable: true,  minWidth: '120px' },
  { key: 'patente',         labelKey: 'tempario.col.patente',         sortable: true,  minWidth: '90px'  },
  { key: 'responsable',     labelKey: 'tempario.col.responsable',     sortable: true,  minWidth: '130px' },
  { key: 'km',              labelKey: 'tempario.col.km',              sortable: false, minWidth: '60px'  },
  { key: 'cliente',         labelKey: 'tempario.col.cliente',         sortable: true,  minWidth: '130px' },
  { key: 'modelo',          labelKey: 'tempario.col.modelo',          sortable: false, minWidth: '90px'  },
  { key: 'descripcionMO',   labelKey: 'tempario.col.descripcion_mo',  sortable: true,  minWidth: '180px' },
  { key: 'hrsTrabajoRate',  labelKey: 'tempario.col.hrs_trabajo',     sortable: true,  minWidth: '100px' },
  { key: 'valorManoDeObra', labelKey: 'tempario.col.valor_mo',        sortable: true,  minWidth: '150px' },
  { key: 'repuesto',        labelKey: 'tempario.col.repuestos',       sortable: true,  minWidth: '160px' },
  { key: 'cantidad',        labelKey: 'tempario.col.cantidad',        sortable: true,  minWidth: '80px'  },
  { key: 'valorRepuesto',   labelKey: 'tempario.col.valor_repuestos', sortable: true,  minWidth: '130px' },
  { key: 'porcentaje',      labelKey: 'tempario.col.porcentaje',      sortable: true,  minWidth: '60px'  },
  { key: 'gestionRepuesto', labelKey: 'tempario.col.gestion_repuesto',sortable: false, minWidth: '130px' },
  { key: 'observacion',     labelKey: 'tempario.col.observacion',     sortable: true,  minWidth: '180px' },
  { key: 'gestionRepuesto2',labelKey: 'tempario.col.gestion_repuesto_2', sortable: false, minWidth: '130px' },
  { key: 'totalRepuesto',   labelKey: 'tempario.col.total_repuesto',  sortable: true,  minWidth: '120px' },
  { key: 'totalClp',        labelKey: 'tempario.col.total_clp',       sortable: false, minWidth: '100px' },
  { key: 'tipo',            labelKey: 'tempario.col.tipo',            sortable: false, minWidth: '80px'  },
];

interface TemparioTableProps {
  rows: TemparioRow[];
  sortBy: TemparioSortColumn;
  sortDir: 'asc' | 'desc';
  searchParams: URLSearchParams;
  isPending: boolean;
  startTransition: (fn: () => void) => void;
}

export function TemparioTable({
  rows,
  sortBy,
  sortDir,
  searchParams,
  isPending,
  startTransition,
}: TemparioTableProps) {
  const { t } = useI18n();
  const router = useRouter();

  function handleSort(col: TemparioSortColumn) {
    const newDir = sortBy === col && sortDir === 'asc' ? 'desc' : 'asc';
    startTransition(() => {
      router.replace(buildTemparioUrl(searchParams, { sortBy: col, sortDir: newDir, page: '1' }));
    });
  }

  function SortIcon({ col }: { col: TemparioSortColumn }) {
    if (sortBy !== col) return <ChevronsUpDown size={14} className="opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  }

  function renderCell(row: TemparioRow, key: string): React.ReactNode {
    const dash = '—';
    switch (key) {
      case 'fecha':
        return row.fecha ? format(new Date(row.fecha), 'dd/MM/yyyy') : dash;
      case 'mes':
        return row.mes != null ? row.mes : dash;
      case 'ot':
        return row.ot;
      case 'aprobacion':
        return row.aprobacionDesc ?? row.aprobacion ?? dash;
      case 'patente':
        return row.patente;
      case 'responsable':
        return row.responsable ?? dash;
      case 'km':
        return dash;
      case 'cliente':
        return row.cliente ?? dash;
      case 'modelo':
        return dash;
      case 'descripcionMO':
        return row.descripcionMO ?? dash;
      case 'hrsTrabajoRate':
        return row.hrsTrabajoRate ?? dash;
      case 'valorManoDeObra':
        return row.valorManoDeObra ?? dash;
      case 'repuesto':
        return row.repuesto ?? dash;
      case 'cantidad':
        return row.cantidad ?? dash;
      case 'valorRepuesto':
        return row.valorRepuesto ?? dash;
      case 'porcentaje':
        return row.porcentaje ?? dash;
      case 'gestionRepuesto':
        return dash;
      case 'observacion':
        return row.observacion ?? dash;
      case 'gestionRepuesto2':
        return dash;
      case 'totalRepuesto':
        return row.totalRepuesto ?? dash;
      case 'totalClp':
        return dash;
      case 'tipo':
        return dash;
      default:
        return dash;
    }
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                style={{ minWidth: col.minWidth }}
                className="whitespace-nowrap"
              >
                {col.sortable ? (
                  <button
                    className="flex items-center gap-1 font-semibold hover:text-foreground transition-colors"
                    onClick={() => handleSort(col.key as TemparioSortColumn)}
                  >
                    {t(col.labelKey as Parameters<typeof t>[0])}
                    <SortIcon col={col.key as TemparioSortColumn} />
                  </button>
                ) : (
                  <span className="font-semibold">
                    {t(col.labelKey as Parameters<typeof t>[0])}
                  </span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {COLUMNS.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMNS.length} className="text-center py-10 text-muted-foreground">
                {t('tempario.no_data')}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow key={`${row.workOrderId}-${row.sparePartId ?? 'null'}-${i}`}>
                {COLUMNS.map((col) => (
                  <TableCell key={col.key} className="whitespace-nowrap max-w-[200px] truncate" title={String(renderCell(row, col.key))}>
                    {renderCell(row, col.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
