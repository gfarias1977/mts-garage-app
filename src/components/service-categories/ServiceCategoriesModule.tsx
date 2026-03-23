'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type GetServiceCategoriesResult, type SortColumn } from '@/data/serviceCategories';
import { Progress } from '@/components/ui/progress';
import { ServiceCategoriesToolbar } from './ServiceCategoriesToolbar';
import { ServiceCategoriesTable } from './ServiceCategoriesTable';
import { ServiceCategoriesPagination } from './ServiceCategoriesPagination';
import { ServiceCategoryEditModal } from './ServiceCategoryEditModal';
import { ServiceCategoryDeleteDialog } from './ServiceCategoryDeleteDialog';

type ActiveModal =
  | { type: 'edit'; id: string | null }
  | { type: 'delete'; id: string }
  | null;

interface ServiceCategoriesModuleProps {
  result: GetServiceCategoriesResult;
  page: number;
  pageSize: number;
  search: string;
  sortBy: SortColumn;
  sortDir: 'asc' | 'desc';
}

export function ServiceCategoriesModule({
  result,
  page,
  pageSize,
  search,
  sortBy,
  sortDir,
}: ServiceCategoriesModuleProps) {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(url: string) {
    startTransition(() => router.replace(url));
  }

  function handleAction(type: 'edit' | 'delete', id: string) {
    setActiveModal({ type, id } as ActiveModal);
  }

  return (
    <div className="flex flex-col gap-4">
      <ServiceCategoriesToolbar
        search={search}
        searchParams={searchParams}
        navigate={navigate}
        onNew={() => setActiveModal({ type: 'edit', id: null })}
      />
      {isPending && <Progress value={null} className="w-full" />}
      <ServiceCategoriesTable
        rows={result.rows}
        sortBy={sortBy}
        sortDir={sortDir}
        searchParams={searchParams}
        navigate={navigate}
        onAction={handleAction}
      />
      <ServiceCategoriesPagination
        page={page}
        pageSize={pageSize}
        total={result.total}
        totalPages={result.totalPages}
        searchParams={searchParams}
        navigate={navigate}
      />
      <ServiceCategoryEditModal
        open={activeModal?.type === 'edit'}
        id={activeModal?.type === 'edit' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
      <ServiceCategoryDeleteDialog
        open={activeModal?.type === 'delete'}
        serviceCategoryId={activeModal?.type === 'delete' ? activeModal.id : null}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
