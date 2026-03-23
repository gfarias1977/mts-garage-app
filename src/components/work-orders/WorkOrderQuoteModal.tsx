'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/i18n';
import { getWorkOrderQuoteDataAction } from '@/app/(dashboard)/work-orders/actions';
import type { WorkOrderQuoteData } from '@/data/workOrderQuote';

const WorkOrderQuotePdfViewer = dynamic(
  () => import('./WorkOrderQuotePdfViewer').then((m) => ({ default: m.WorkOrderQuotePdfViewer })),
  { ssr: false },
);

interface WorkOrderQuoteModalProps {
  open: boolean;
  workOrderId: string;
  onClose: () => void;
}

export function WorkOrderQuoteModal({ open, workOrderId, onClose }: WorkOrderQuoteModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState<WorkOrderQuoteData | null>(null);
  const [sellerName, setSellerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !workOrderId) return;
    setLoading(true);
    setError(null);
    setQuoteData(null);
    setBlobUrl(null);
    getWorkOrderQuoteDataAction(workOrderId).then((result) => {
      if (result.success) {
        setQuoteData(result.data.quoteData);
        setSellerName(result.data.sellerName);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });
  }, [open, workOrderId]);

  const handleBlobReady = useCallback((url: string) => setBlobUrl(url), []);

  function handleDownload() {
    if (!blobUrl || !quoteData) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `cotizacion-${quoteData.workOrderCode}.pdf`;
    a.click();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="overflow-hidden"
        style={{ width: '72vw', maxWidth: '72vw', height: '63vh', display: 'flex', flexDirection: 'column', padding: 0, gap: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <DialogTitle>{t('work_orders.view_quote')}</DialogTitle>
          <div className="flex items-center gap-2 mr-7">
            {blobUrl && (
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="mr-1 h-4 w-4" />
                Descargar
              </Button>
            )}
          </div>
        </div>

        {loading && <Progress value={null} className="w-full shrink-0" />}

        {error && (
          <div className="flex items-center justify-center flex-1 text-destructive text-sm p-4">
            {error}
          </div>
        )}

        {!loading && !error && quoteData && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <WorkOrderQuotePdfViewer
              quoteData={quoteData}
              sellerName={sellerName}
              onBlobReady={handleBlobReady}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
