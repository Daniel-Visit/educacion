'use client'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Edit3, 
  MessageSquare,
  BookOpen,
  ChevronDown,
  ChevronRight,
  UserCircle,
  Info,
  HelpCircle,
  Calendar,
  Layers,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  ClipboardList
} from 'lucide-react'

// Importar constantes de la entrevista
import { steps, preguntaToStep } from '@/components/entrevista/constants'

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },

  { 
    name: 'Evaluación', 
    href: '/evaluaciones', 
    icon: ClipboardList,
    submenu: [
      { name: 'Evaluaciones', href: '/evaluaciones' },
      { name: 'Matrices', href: '/matrices' }
    ]
  },
  { 
    name: 'Resultados', 
    href: '/resultados-evaluaciones', 
    icon: CheckCircle2,
    submenu: [
      { name: 'Ver Resultados', href: '/resultados-evaluaciones' },
      { name: 'Cargar Resultados', href: '/correccion-evaluaciones' }
    ]
  },
  { 
    name: 'Planificación', 
    href: '/planificacion-anual', 
    icon: Calendar,
    submenu: [
      { name: 'Horarios', href: '/horarios' },
      { name: 'Planificación Anual', href: '/planificacion-anual' },
      { name: 'Planificaciones', href: '/planificacion-anual/listado' }
    ]
  },
  { 
    name: 'Editor', 
    href: '/editor', 
    icon: Edit3,
    submenu: [
      { name: 'Planificación de Clase', href: '/editor?tipo=planificacion' },
      { name: 'Material de Apoyo', href: '/editor?tipo=material' }
    ]
  },
  { 
    name: 'Entrevista', 
    href: '/entrevista', 
    icon: MessageSquare,
    isInterview: true
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [currentInterviewStep, setCurrentInterviewStep] = useState(0)

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }

  const isMenuExpanded = (menuName: string) => expandedMenus.includes(menuName)
  const isActive = (href: string) => pathname === href
  const isSubmenuActive = (href: string) => pathname === href

  // Determinar el paso actual de la entrevista
  const getCurrentInterviewStep = () => {
    if (pathname === '/entrevista') {
      const stepParam = searchParams.get('step');
      return stepParam ? parseInt(stepParam) : 0;
    }
    return 0;
  }

  // Actualizar el paso actual cuando cambien los parámetros de URL
  useEffect(() => {
    setCurrentInterviewStep(getCurrentInterviewStep());
  }, [pathname, searchParams]);

  return (
    <aside className="w-80 h-full min-h-0 flex flex-col bg-white/70 backdrop-blur-md py-10 px-6 border-r border-[#f0f0fa] overflow-hidden transition-all">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-500 w-14 h-14 flex items-center justify-center rounded-2xl">
          <BookOpen className="text-white" size={32} />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-indigo-900">Educación</div>
          <div className="text-sm text-purple-500 font-medium">Plataforma docente</div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2 min-h-0 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const hasSubmenu = item.submenu && item.submenu.length > 0
          const isExpanded = isMenuExpanded(item.name)
          const isItemActive = isActive(item.href) || (hasSubmenu && item.submenu?.some(sub => isSubmenuActive(sub.href)))
          const isInterview = item.isInterview
          
          return (
            <div key={item.name}>
              {hasSubmenu || isInterview ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-base text-left focus:outline-none ${isItemActive ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" : "text-indigo-900 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"}`}
                >
                  <div className="relative">
                    <Icon className={isItemActive ? "text-white" : "text-indigo-500"} size={22} />
                    {isInterview && (
                      <Sparkles className="absolute -top-1 -right-1 text-yellow-400" size={12} />
                    )}
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {isExpanded ? (
                    <ChevronDown className={isItemActive ? "text-white" : "text-indigo-500"} size={18} />
                  ) : (
                    <ChevronRight className={isItemActive ? "text-white" : "text-indigo-500"} size={18} />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-base text-left focus:outline-none ${isItemActive ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" : "text-indigo-900 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"}`}
                >
                  <Icon className={isItemActive ? "text-white" : "text-indigo-500"} size={22} />
                  <span>{item.name}</span>
                  {isItemActive && <span className="ml-auto w-2 h-2 bg-white/80 rounded-full" />} 
                </Link>
              )}
              
              {/* Submenu normal */}
              {hasSubmenu && isExpanded && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.submenu.map((subItem) => {
                    const isSubActive = isSubmenuActive(subItem.href)
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`block px-4 py-2 rounded-xl transition-all text-sm font-medium text-left focus:outline-none ${isSubActive ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200" : "text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"}`}
                      >
                        {subItem.name}
                        {isSubActive && <span className="ml-auto w-2 h-2 bg-indigo-500 rounded-full" />}
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Submenu especial para Entrevista */}
              {isInterview && isExpanded && (
                <div className="mt-4 space-y-3 mb-4">
                  {/* Header del submenu de entrevista */}
                  <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 max-w-[210px] mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Progreso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-purple-400 to-indigo-400 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${((currentInterviewStep + 1) / steps.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        {currentInterviewStep + 1}/{steps.length}
                      </span>
                    </div>
                  </div>

                  {/* Pasos de la entrevista */}
                  <div className="space-y-1.5">
                    {steps.map((step, idx) => {
                      const StepIcon = step.icon
                      const isStepActive = idx === currentInterviewStep
                      const isStepCompleted = idx < currentInterviewStep
                      const canNavigate = idx <= currentInterviewStep + 1 // Permitir navegar al siguiente paso
                      
                      return (
                        <Link
                          key={step.key}
                          href={`/entrevista?step=${idx}`}
                          className={`group relative block px-2 py-2 rounded-lg transition-all duration-300 text-xs font-medium text-left focus:outline-none max-w-[210px] mx-auto ${
                            isStepActive 
                              ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg transform scale-105" 
                              : isStepCompleted 
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 hover:from-green-100 hover:to-emerald-100" 
                                : "text-gray-500 hover:bg-gray-50"
                          } ${!canNavigate ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`relative flex items-center justify-center w-6 h-6 rounded-md transition-all ${
                              isStepActive 
                                ? "bg-white/20" 
                                : isStepCompleted 
                                  ? "bg-green-100" 
                                  : "bg-gray-100"
                            }`}>
                              {isStepCompleted ? (
                                <CheckCircle2 className="text-green-600" size={12} />
                              ) : (
                                <StepIcon className={
                                  isStepActive 
                                    ? "text-white" 
                                    : isStepCompleted 
                                      ? "text-green-600" 
                                      : "text-gray-400"
                                } size={12} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex items-center">
                              <div className="font-semibold truncate">{step.label}</div>
                              {isStepCompleted && (
                                <span className="ml-auto text-green-600 flex items-center"><CheckCircle2 size={14} /></span>
                              )}
                            </div>
                            {isStepActive && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse flex-shrink-0"></div>
                            )}
                          </div>
                          
                          {/* Efecto de brillo en hover */}
                          {canNavigate && !isStepActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          )}
                        </Link>
                      )
                    })}
                  </div>

                  {/* Footer del submenu */}
                  <div className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 max-w-[210px] mx-auto">
                    <div className="text-xs text-indigo-600 text-center">
                      <div className="font-semibold mb-1">💡 Guía Personalizada</div>
                      <div className="text-gray-500 text-xs">Completa para recomendaciones</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>
      
      <div className="mt-auto pt-8 text-xs text-gray-500 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Sistema activo
        </div>
        <div className="text-green-600 font-semibold mt-1">● Conectado</div>
      </div>
    </aside>
  )
} 