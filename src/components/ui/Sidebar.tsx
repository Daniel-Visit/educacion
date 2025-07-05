'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Edit3, 
  MessageSquare,
  BookOpen,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Evaluaciones', href: '/evaluaciones', icon: CheckSquare },
  { name: 'Matrices', href: '/matrices', icon: FileText },
  { 
    name: 'Editor', 
    href: '/editor', 
    icon: Edit3,
    submenu: [
      { name: 'Planificación de Clase', href: '/editor?tipo=planificacion' },
      { name: 'Material de Apoyo', href: '/editor?tipo=material' }
    ]
  },
  { name: 'Entrevista', href: '/entrevista', icon: MessageSquare },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

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

  return (
    <aside className="w-80 h-full min-h-0 flex flex-col bg-white/70 backdrop-blur-md py-10 px-6 border-r border-[#f0f0fa] overflow-y-auto max-h-full transition-all">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-500 w-14 h-14 flex items-center justify-center rounded-2xl">
          <BookOpen className="text-white" size={32} />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-indigo-900">Educación</div>
          <div className="text-sm text-purple-500 font-medium">Plataforma docente</div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2 min-h-0">
        {navigation.map((item) => {
          const Icon = item.icon
          const hasSubmenu = item.submenu && item.submenu.length > 0
          const isExpanded = isMenuExpanded(item.name)
          const isItemActive = isActive(item.href) || (hasSubmenu && item.submenu?.some(sub => isSubmenuActive(sub.href)))
          
          return (
            <div key={item.name}>
              {hasSubmenu ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-base text-left focus:outline-none ${isItemActive ? "bg-indigo-600 text-white shadow-lg" : "text-indigo-900 hover:bg-indigo-100"}`}
                >
                  <Icon className={isItemActive ? "text-white" : "text-indigo-500"} size={22} />
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-base text-left focus:outline-none ${isItemActive ? "bg-indigo-600 text-white shadow-lg" : "text-indigo-900 hover:bg-indigo-100"}`}
                >
                  <Icon className={isItemActive ? "text-white" : "text-indigo-500"} size={22} />
                  <span>{item.name}</span>
                  {isItemActive && <span className="ml-auto w-2 h-2 bg-white/80 rounded-full" />} 
                </Link>
              )}
              
              {/* Submenu */}
              {hasSubmenu && isExpanded && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.submenu.map((subItem) => {
                    const isSubActive = isSubmenuActive(subItem.href)
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`block px-4 py-2 rounded-xl transition-all text-sm font-medium text-left focus:outline-none ${isSubActive ? "bg-indigo-100 text-indigo-700" : "text-indigo-600 hover:bg-indigo-50"}`}
                      >
                        {subItem.name}
                        {isSubActive && <span className="ml-auto w-2 h-2 bg-indigo-500 rounded-full" />}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      
      <div className="mt-auto pt-8 text-xs text-gray-500 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Sistema activo
        </div>
        <div className="text-green-600 font-semibold mt-1">● Conectado</div>
      </div>
    </aside>
  )
} 