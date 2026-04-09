'use client';

import { Gauge, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import type { WorkOrderDashboardStats, WorkOrderStatusStat } from '@/data/workOrderDashboard';

interface WelcomeHeroProps {
  stats: WorkOrderDashboardStats;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function computeDelta(
  current: number,
  previous: number,
): { label: string; sign: 'positive' | 'negative' | 'neutral' } {
  if (previous === 0) {
    return current > 0
      ? { label: '+100%', sign: 'positive' }
      : { label: '—', sign: 'neutral' };
  }
  const pct = ((current - previous) / previous) * 100;
  const sign: 'positive' | 'negative' | 'neutral' =
    pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'neutral';
  const label = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
  return { label, sign };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

// ── Status color map ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  A: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  P: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  C: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  X: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  I: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

// ── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  current?: number;
  previous?: number;
  vsLabel: string;
}

function KpiCard({ title, value, current, previous, vsLabel }: KpiCardProps) {
  const delta =
    current !== undefined && previous !== undefined
      ? computeDelta(current, previous)
      : null;

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </span>
      <span className="text-3xl font-bold tabular-nums">{value}</span>
      {delta && (
        <span
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            delta.sign === 'positive'
              ? 'text-emerald-600 dark:text-emerald-400'
              : delta.sign === 'negative'
                ? 'text-destructive'
                : 'text-muted-foreground',
          )}
        >
          {delta.sign === 'positive' ? (
            <TrendingUp size={12} />
          ) : delta.sign === 'negative' ? (
            <TrendingDown size={12} />
          ) : (
            <Minus size={12} />
          )}
          {delta.label} {vsLabel}
        </span>
      )}
    </div>
  );
}

function StatusCard({ statusCode, description, count }: WorkOrderStatusStat) {
  const colorClass =
    STATUS_COLORS[statusCode] ?? 'bg-secondary text-secondary-foreground';
  return (
    <div
      className={cn(
        'rounded-lg px-4 py-3 flex flex-col gap-0.5 min-w-[120px]',
        colorClass,
      )}
    >
      <span className="text-2xl font-bold tabular-nums">{count}</span>
      <span className="text-xs font-medium leading-tight">{description}</span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function WelcomeHero({ stats }: WelcomeHeroProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Hero header */}
      <div className="flex flex-col items-center justify-center gap-3 pt-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
          <Gauge size={32} className="text-accent-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{t('welcome.title')}</h1>
          <p className="text-base text-muted-foreground">{t('welcome.subtitle')}</p>
        </div>
      </div>

      {/* Row 1 — order counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title={t('welcome.kpi.total')}
          value={stats.totalAllTime}
          vsLabel={t('welcome.kpi.vs_last_period')}
        />
        <KpiCard
          title={t('welcome.kpi.this_week')}
          value={stats.countThisWeek}
          current={stats.countThisWeek}
          previous={stats.countLastWeek}
          vsLabel={t('welcome.kpi.vs_last_period')}
        />
        <KpiCard
          title={t('welcome.kpi.this_month')}
          value={stats.countThisMonth}
          current={stats.countThisMonth}
          previous={stats.countLastMonth}
          vsLabel={t('welcome.kpi.vs_last_period')}
        />
      </div>

      {/* Row 2 — revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          title={t('welcome.kpi.revenue_week')}
          value={formatCurrency(stats.revenueThisWeek)}
          current={stats.revenueThisWeek}
          previous={stats.revenueLastWeek}
          vsLabel={t('welcome.kpi.vs_last_period')}
        />
        <KpiCard
          title={t('welcome.kpi.revenue_month')}
          value={formatCurrency(stats.revenueThisMonth)}
          current={stats.revenueThisMonth}
          previous={stats.revenueLastMonth}
          vsLabel={t('welcome.kpi.vs_last_period')}
        />
      </div>

      {/* Row 3 — status breakdown */}
      {stats.byStatus.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            {t('welcome.kpi.by_status')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {stats.byStatus.map((s) => (
              <StatusCard
                key={s.statusCode}
                statusCode={s.statusCode}
                description={s.description}
                count={s.count}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
