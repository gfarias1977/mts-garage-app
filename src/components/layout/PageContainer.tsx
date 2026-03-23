import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbSegment[];
}

export function PageContainer({ children, title, breadcrumbs }: PageContainerProps) {
  return (
    <div className="flex flex-col gap-6">
      {(title || breadcrumbs) && (
        <div className="flex flex-col gap-1">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, i) => {
                  const isLast = i === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={i}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href ?? '#'}>{crumb.label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          {title && <h1 className="text-2xl font-semibold">{title}</h1>}
        </div>
      )}
      {children}
    </div>
  );
}
