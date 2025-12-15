'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import {
  Home,
  MessageSquare,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Sparkles,
  ClipboardList,
  Users,
  CircleMinus,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

import { steps } from '@/components/entrevista/constants';
import { Avatar } from '@/components/ui/Avatar';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

const navigation = [
  { name: 'Inicio', href: '/', icon: Home, testId: 'nav-dashboard' },
  {
    name: 'Planificación IA',
    href: '/planificacion-anual',
    icon: Calendar,
    testId: 'nav-planificacion',
    submenu: [
      { name: 'Configuración', href: '/horarios' },
      { name: 'Planificación Anual', href: '/planificacion-anual' },
      { name: 'Planificaciones', href: '/planificacion-anual/listado' },
    ],
  },
  {
    name: 'Clases IA',
    href: '/editor',
    icon: Sparkles,
    testId: 'nav-clases',
    submenu: [
      { name: 'Planificación de Clase', href: '/editor?tipo=planificacion' },
      { name: 'Recursos Pedagógicos', href: '/editor?tipo=material' },
    ],
  },
  {
    name: 'Evaluación IA',
    href: '/evaluaciones',
    icon: ClipboardList,
    testId: 'nav-evaluaciones',
    submenu: [
      { name: 'Evaluaciones', href: '/evaluaciones' },
      { name: 'Matrices', href: '/matrices' },
    ],
  },
  {
    name: 'Resultados',
    href: '/resultados-evaluaciones',
    icon: CheckCircle2,
    testId: 'nav-resultados',
    submenu: [
      { name: 'Informe de Resultados', href: '/resultados-evaluaciones' },
      { name: 'Cargar Resultados', href: '/correccion-evaluaciones' },
    ],
  },
  {
    name: 'Entrevista',
    href: '/entrevista',
    icon: MessageSquare,
    testId: 'nav-entrevista',
    isInterview: true,
  },
];

function SidebarContent({ userRole, user }: { userRole: string; user?: User }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [currentInterviewStep, setCurrentInterviewStep] = useState(0);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isMenuExpanded = (menuName: string) => expandedMenus.includes(menuName);
  const isActive = (href: string) => pathname === href;
  const isSubmenuActive = (href: string) => pathname === href;

  const getCurrentInterviewStep = useCallback(() => {
    if (pathname === '/entrevista') {
      const stepParam = searchParams.get('step');
      return stepParam ? parseInt(stepParam) : 0;
    }
    return 0;
  }, [pathname, searchParams]);

  useEffect(() => {
    setCurrentInterviewStep(getCurrentInterviewStep());
  }, [getCurrentInterviewStep]);

  // Close expanded menus when sidebar collapses
  useEffect(() => {
    if (isCollapsed) {
      setExpandedMenus([]);
    }
  }, [isCollapsed]);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        data-testid="sidebar"
        className={cn(
          'h-full min-h-0 flex flex-col bg-white/70 backdrop-blur-md border-r border-[#f0f0fa] overflow-hidden transition-all duration-300',
          isCollapsed ? 'w-16 px-2 py-6' : 'w-72 px-6 py-6'
        )}
      >
        {/* Header with logo and toggle */}
        <div
          className={cn(
            'flex items-center mb-6',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div
            className={cn(
              'flex items-center',
              isCollapsed ? 'justify-center' : 'gap-4'
            )}
          >
            <div
              className={cn(
                'bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center rounded-2xl flex-shrink-0',
                isCollapsed ? 'w-10 h-10' : 'w-14 h-14'
              )}
            >
              <BookOpen className="text-white" size={isCollapsed ? 20 : 32} />
            </div>
            {!isCollapsed && (
              <div>
                <div className="text-2xl font-extrabold text-indigo-900">
                  EdK
                </div>
                <div className="text-sm text-purple-500 font-medium">
                  Soluciones IA en educación
                </div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              data-testid="sidebar-toggle"
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-indigo-50 transition-colors text-indigo-500"
              aria-label="Colapsar sidebar"
            >
              <PanelLeftClose size={20} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-testid="sidebar-toggle"
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center p-2 mb-4 rounded-xl hover:bg-indigo-50 transition-colors text-indigo-500"
                aria-label="Expandir sidebar"
              >
                <PanelLeft size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expandir menú</TooltipContent>
          </Tooltip>
        )}

        {/* User avatar */}
        {user && (
          <div
            className={cn(
              'mb-4',
              isCollapsed
                ? 'flex justify-center'
                : 'flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100'
            )}
          >
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Avatar user={user} size="sm" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="font-semibold">{user.name || 'Usuario'}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Avatar user={user} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-indigo-900 truncate">
                    {user.name || 'Usuario'}
                  </div>
                  <div className="text-sm text-indigo-600 truncate">
                    {user.email}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2 min-h-0 overflow-y-auto">
          {navigation.map(item => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = isMenuExpanded(item.name);
            const isItemActive =
              isActive(item.href) ||
              (hasSubmenu &&
                item.submenu?.some(sub => isSubmenuActive(sub.href)));
            const isInterview = item.isInterview;

            // Collapsed state - show only icons with tooltips
            if (isCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      data-testid={item.testId}
                      className={cn(
                        'w-full flex items-center justify-center p-3 rounded-xl transition-all',
                        isItemActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                          : 'text-indigo-500 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
                      )}
                    >
                      <div className="relative">
                        <Icon size={22} />
                        {isInterview && (
                          <Sparkles
                            className="absolute -top-1 -right-1 text-yellow-400"
                            size={10}
                          />
                        )}
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex flex-col gap-1">
                    <span className="font-semibold">{item.name}</span>
                    {hasSubmenu && (
                      <div className="text-xs text-gray-500">
                        {item.submenu?.map(sub => sub.name).join(', ')}
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            // Expanded state - full navigation
            return (
              <div key={item.name}>
                {hasSubmenu || isInterview ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    data-testid={item.testId}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-base text-left focus:outline-none',
                      isItemActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'text-indigo-900 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
                    )}
                  >
                    <div className="relative">
                      <Icon
                        className={
                          isItemActive ? 'text-white' : 'text-indigo-500'
                        }
                        size={22}
                      />
                      {isInterview && (
                        <Sparkles
                          className="absolute -top-1 -right-1 text-yellow-400"
                          size={12}
                        />
                      )}
                    </div>
                    <span className="flex-1">{item.name}</span>
                    {isExpanded ? (
                      <ChevronDown
                        className={
                          isItemActive ? 'text-white' : 'text-indigo-500'
                        }
                        size={18}
                      />
                    ) : (
                      <ChevronRight
                        className={
                          isItemActive ? 'text-white' : 'text-indigo-500'
                        }
                        size={18}
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    data-testid={item.testId}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-base text-left focus:outline-none',
                      isItemActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'text-indigo-900 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
                    )}
                  >
                    <Icon
                      className={
                        isItemActive ? 'text-white' : 'text-indigo-500'
                      }
                      size={22}
                    />
                    <span>{item.name}</span>
                    {isItemActive && (
                      <span className="ml-auto w-2 h-2 bg-white/80 rounded-full" />
                    )}
                  </Link>
                )}

                {/* Submenu normal */}
                {hasSubmenu && isExpanded && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.submenu.map(subItem => {
                      const isSubActive = isSubmenuActive(subItem.href);
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={cn(
                            'block px-4 py-2 rounded-xl transition-all text-sm font-medium text-left focus:outline-none',
                            isSubActive
                              ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200'
                              : 'text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
                          )}
                        >
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Interview submenu */}
                {isInterview && isExpanded && (
                  <div className="mt-4 space-y-3 mb-4">
                    <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 max-w-[210px] mx-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                          Progreso
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-indigo-400 h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${((currentInterviewStep + 1) / steps.length) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-600">
                          {currentInterviewStep + 1}/{steps.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {steps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isStepActive = idx === currentInterviewStep;
                        const isStepCompleted = idx < currentInterviewStep;
                        const canNavigate = idx <= currentInterviewStep + 1;

                        return (
                          <Link
                            key={step.key}
                            href={`/entrevista?step=${idx}`}
                            className={cn(
                              'group relative block px-2 py-2 rounded-lg transition-all duration-300 text-xs font-medium text-left focus:outline-none max-w-[210px] mx-auto',
                              isStepActive
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg transform scale-105'
                                : isStepCompleted
                                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 hover:from-green-100 hover:to-emerald-100'
                                  : 'text-gray-500 hover:bg-gray-50',
                              !canNavigate && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'relative flex items-center justify-center w-6 h-6 rounded-md transition-all',
                                  isStepActive
                                    ? 'bg-white/20'
                                    : isStepCompleted
                                      ? 'bg-green-100'
                                      : 'bg-gray-100'
                                )}
                              >
                                {isStepCompleted ? (
                                  <CheckCircle2
                                    className="text-green-600"
                                    size={12}
                                  />
                                ) : (
                                  <StepIcon
                                    className={cn(
                                      isStepActive
                                        ? 'text-white'
                                        : isStepCompleted
                                          ? 'text-green-600'
                                          : 'text-gray-400'
                                    )}
                                    size={12}
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 flex items-center">
                                <div className="font-semibold truncate">
                                  {step.label}
                                </div>
                                {isStepCompleted && (
                                  <span className="ml-auto text-green-600 flex items-center">
                                    <CheckCircle2 size={14} />
                                  </span>
                                )}
                              </div>
                              {isStepActive && (
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse flex-shrink-0"></div>
                              )}
                            </div>
                            {canNavigate && !isStepActive && (
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            )}
                          </Link>
                        );
                      })}
                    </div>

                    <div className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 max-w-[210px] mx-auto">
                      <div className="text-xs text-indigo-600 text-center">
                        <div className="font-semibold mb-1">
                          Guía Personalizada
                        </div>
                        <div className="text-gray-500 text-xs">
                          Completa para recomendaciones
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Admin users link */}
          {userRole === 'admin' && (
            <div className="mt-2">
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/admin/users"
                      data-testid="nav-admin"
                      className={cn(
                        'w-full flex items-center justify-center p-3 rounded-xl transition-all',
                        pathname === '/admin/users'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                          : 'text-indigo-500 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
                      )}
                    >
                      <Users size={22} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Gestión de Usuarios
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/admin/users"
                  data-testid="nav-admin"
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-2xl transition-all font-semibold text-base text-left focus:outline-none',
                    pathname === '/admin/users'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-indigo-900 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
                  )}
                >
                  <Users
                    className={
                      pathname === '/admin/users'
                        ? 'text-white'
                        : 'text-indigo-500'
                    }
                    size={22}
                  />
                  <span>Gestión de Usuarios</span>
                  {pathname === '/admin/users' && (
                    <span className="ml-auto w-2 h-2 bg-white/80 rounded-full" />
                  )}
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* Logout button */}
        <div className="mt-auto pt-2 border-t border-gray-100 flex-shrink-0">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      });
                      if (response.ok) {
                        await signOut({ callbackUrl: '/auth/login' });
                      } else {
                        await signOut({ callbackUrl: '/auth/login' });
                      }
                    } catch {
                      await signOut({ callbackUrl: '/auth/login' });
                    }
                  }}
                  className="w-full flex items-center justify-center p-3 rounded-xl transition-all text-indigo-500 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                >
                  <CircleMinus size={22} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Cerrar sesión</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                  });
                  if (response.ok) {
                    await signOut({ callbackUrl: '/auth/login' });
                  } else {
                    await signOut({ callbackUrl: '/auth/login' });
                  }
                } catch {
                  await signOut({ callbackUrl: '/auth/login' });
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-2xl transition-all font-semibold text-base text-left focus:outline-none text-indigo-900 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
            >
              <CircleMinus className="text-indigo-500" size={22} />
              <span>Cerrar sesión</span>
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

export default function Sidebar({
  userRole,
  user,
}: {
  userRole: string;
  user?: User;
}) {
  return (
    <Suspense
      fallback={<div className="w-72 h-full bg-white/70 animate-pulse"></div>}
    >
      <SidebarContent userRole={userRole} user={user} />
    </Suspense>
  );
}
