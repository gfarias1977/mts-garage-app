'use client';

import { useEffect, useRef, useState } from 'react';
import type { WorkOrderQuoteData } from '@/data/workOrderQuote';

interface WorkOrderQuotePdfViewerProps {
  quoteData: WorkOrderQuoteData;
  sellerName: string;
  onBlobReady?: (url: string) => void;
}

export function WorkOrderQuotePdfViewer({ quoteData, sellerName, onBlobReady }: WorkOrderQuotePdfViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      try {
        const { pdf } = await import('@react-pdf/renderer');
        const { WorkOrderQuotePdf } = await import('./WorkOrderQuotePdf');
        const blob = await pdf(
          <WorkOrderQuotePdf quoteData={quoteData} sellerName={sellerName} />,
        ).toBlob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        onBlobReady?.(url);
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = url;
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error generating PDF');
      }
    }

    generate();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteData.workOrderId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive text-sm p-4">
        {error}
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4">
        Generando PDF...
      </div>
    );
  }

  return (
    <iframe
      src={blobUrl}
      style={{ width: '100%', height: '100%', display: 'block', border: 'none' }}
      title="Presupuesto PDF"
    />
  );
}
