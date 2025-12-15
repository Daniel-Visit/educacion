'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
}

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  stats?: StatItem[];
  variant?: 'gradient' | 'simple' | 'minimal';
  className?: string;
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
  stats,
  variant = 'gradient',
  className,
}: PageHeaderProps) {
  return (
    <div
      data-testid="page-header"
      className={cn(
        'rounded-xl mb-4',
        variant === 'gradient' &&
          'bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg',
        variant === 'simple' && 'bg-white border border-gray-200 p-4 shadow-sm',
        variant === 'minimal' && 'pb-4 border-b border-gray-100',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg',
              variant === 'gradient' ? 'bg-white/20' : 'bg-indigo-100'
            )}
          >
            <Icon
              className={cn(
                variant === 'gradient' ? 'text-white' : 'text-indigo-600'
              )}
              size={20}
            />
          </div>
          <div>
            <h1
              className={cn(
                'text-xl font-bold',
                variant === 'gradient' ? 'text-white' : 'text-gray-900'
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  'text-sm',
                  variant === 'gradient' ? 'text-indigo-100' : 'text-gray-500'
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {stats && stats.length > 0 && (
            <div
              data-testid="header-stats"
              className="hidden md:flex items-center gap-4"
            >
              {stats.map((stat, i) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                      variant === 'gradient'
                        ? 'bg-white/10'
                        : 'bg-gray-50 border border-gray-100'
                    )}
                  >
                    {StatIcon && (
                      <StatIcon
                        className={cn(
                          variant === 'gradient'
                            ? 'text-indigo-200'
                            : 'text-indigo-500'
                        )}
                        size={14}
                      />
                    )}
                    <div className="text-center">
                      <div
                        className={cn(
                          'text-sm font-bold',
                          variant === 'gradient'
                            ? 'text-white'
                            : 'text-gray-900'
                        )}
                      >
                        {stat.value}
                      </div>
                      <div
                        className={cn(
                          'text-xs',
                          variant === 'gradient'
                            ? 'text-indigo-200'
                            : 'text-gray-500'
                        )}
                      >
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
