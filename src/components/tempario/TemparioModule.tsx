'use client';

import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { type GetTemparioResult, type TemparioSortColumn } from '@/data/tempario';
import { TemparioToolbar } from './TemparioToolbar';
import { TemparioTable } from './TemparioTable';
import { TemparioPagination } from './TemparioPagination';

interface TemparioModuleProps {
  result: GetTemparioResult;
  page: number;
  pageSize: number;
  search: string;
  sortBy: TemparioSortColumn;
  sortDir: 'asc' | 'desc';
  dateFrom: string;
  dateTo: string;
}

export function TemparioModule({
  result,
  page,
  pageSize,
  search,
  sortBy,
  sortDir,
  dateFrom,
  dateTo,
}: TemparioModuleProps) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <TemparioToolbar
        search={search}
        dateFrom={dateFrom}
        dateTo={dateTo}
        searchParams={searchParams}
        startTransition={startTransition}
        filterParams={{ search, dateFrom, dateTo, sortBy, sortDir }}
      />
      <TemparioTable
        rows={result.rows}
        sortBy={sortBy}
        sortDir={sortDir}
        searchParams={searchParams}
        isPending={isPending}
        startTransition={startTransition}
      />
      <TemparioPagination
        page={page}
        pageSize={pageSize}
        total={result.total}
        totalPages={result.totalPages}
        searchParams={searchParams}
        startTransition={startTransition}
      />
    </div>
  );
}
