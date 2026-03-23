'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  UserCog,
  Car,
  ClipboardList,
  Wrench,
  Settings2,
  Layers,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Gauge,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLayoutStore } from '@/store/layout';
import { useI18n, type TranslationKey } from '@/i18n';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const nav = [
  {
    groupKey: 'nav.customers' as TranslationKey,
    items: [
      { key: 'nav.clients' as TranslationKey, href: '/clients', icon: Users },
      { key: 'nav.client_types' as TranslationKey, href: '/client-types', icon: UserCog },
      { key: 'nav.vehicles' as TranslationKey, href: '/vehicles', icon: Car },
    ],
  },
  {
    groupKey: 'nav.workshop' as TranslationKey,
    items: [
      { key: 'nav.work_orders' as TranslationKey, href: '/work-orders', icon: ClipboardList },
      { key: 'nav.mechanics' as TranslationKey, href: '/mechanics', icon: Wrench },
      { key: 'nav.maintenance_types' as TranslationKey, href: '/maintenance-types', icon: Settings2 },
    ],
  },
  {
    groupKey: 'nav.services_group' as TranslationKey,
    items: [
      { key: 'nav.services' as TranslationKey, href: '/services', icon: Layers },
      { key: 'nav.service_categories' as TranslationKey, href: '/service-categories', icon: LayoutGrid },
    ],
  },
];

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  const content = (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors',
        'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]',
        active && 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text-active)] font-medium',
        collapsed && 'justify-center px-2',
      )}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={content} />
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export function Sidebar() {
  const { collapsed, position, toggleCollapsed } = useLayoutStore();
  const { t } = useI18n();
  const pathname = usePathname();

  const router = useRouter();
  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  /* ── Top position: horizontal nav ─────────────────────────── */
  if (position === 'top') {
    return (
      <nav
        className="flex items-center gap-1 px-4 h-12 bg-[var(--sidebar-bg)] border-b border-border"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-2 mr-6 font-semibold text-[var(--sidebar-text-active)]">
          <Gauge size={20} />
          <span className="text-sm">MTS Garage</span>
        </Link>

        {nav.map((group) => (
          <DropdownMenu key={group.groupKey}>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] transition-colors">
              {t(group.groupKey)}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      'flex items-center gap-2 cursor-pointer',
                      isActive(item.href) && 'text-[var(--sidebar-text-active)] font-medium',
                    )}
                  >
                    <Icon size={16} />
                    {t(item.key)}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </nav>
    );
  }

  /* ── Left / Right position: vertical aside ─────────────────── */
  return (
    <aside
      className={cn(
        'flex flex-col bg-[var(--sidebar-bg)] border-r border-border transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-4 font-semibold text-[var(--sidebar-text-active)]',
          collapsed && 'justify-center px-2',
        )}
      >
        <Gauge size={22} className="shrink-0" />
        {!collapsed && <span className="text-base">MTS Garage</span>}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {nav.map((group) => (
          <div key={group.groupKey}>
            {!collapsed && (
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--sidebar-text)] opacity-60">
                {t(group.groupKey)}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={t(item.key)}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <button
          onClick={toggleCollapsed}
          title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          className={cn(
            'flex w-full items-center gap-2 rounded px-3 py-2 text-sm',
            'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] transition-colors',
            collapsed && 'justify-center px-2',
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>{t('sidebar.collapse')}</span>}
        </button>
      </div>
    </aside>
  );
}
