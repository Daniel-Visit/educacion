import React from 'react';
import { BarChart3, FileText, Users, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

interface ResultadosHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  totalCount?: number;
  totalLabel?: string;
  showBackButton?: boolean;
  backHref?: string;
  showExportButton?: boolean;
  onExport?: () => void;
  children?: React.ReactNode;
}

export default function ResultadosHeader({
  title,
  subtitle,
  icon = <BarChart3 className="h-6 w-6 text-white" />,
  totalCount,
  totalLabel = "Total",
  showBackButton = false,
  backHref = "/resultados-evaluaciones",
  showExportButton = false,
  onExport,
  children
}: ResultadosHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-lg mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link href={backHref}>
              <button className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
          )}
          <div className="bg-white/20 p-2 rounded-lg">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-emerald-100 text-sm">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalCount !== undefined && (
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-200" />
                <div>
                  <p className="text-emerald-200 text-xs">{totalLabel}</p>
                  <p className="text-lg font-bold">{totalCount}</p>
                </div>
              </div>
            </div>
          )}
          {showExportButton && onExport && (
            <button 
              onClick={onExport}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
          )}
        </div>
      </div>

      {children && (
        <div className="bg-white/10 rounded-lg p-4">
          {children}
        </div>
      )}
    </div>
  );
} 