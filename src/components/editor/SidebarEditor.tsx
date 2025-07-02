import { BookOpen, FileText, Check } from 'lucide-react';

const options = [
  {
    key: 'planificacion',
    label: 'Planificación de Clase',
    desc: 'Crea y edita la planificación de tus clases',
    icon: FileText,
  },
  {
    key: 'material',
    label: 'Material de Apoyo',
    desc: 'Gestiona el material de apoyo para tus estudiantes',
    icon: BookOpen,
  },
];

export default function SidebarEditor({ selected, onSelect }: { selected: string; onSelect: (key: string) => void }) {
  return (
    <aside className="w-80 h-full min-h-0 flex flex-col bg-white/70 backdrop-blur-md py-10 px-6 border-r border-[#f0f0fa] overflow-y-auto max-h-full shadow-[0_4px_24px_0_rgba(99,102,241,0.08)] transition-all">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-500 w-14 h-14 flex items-center justify-center rounded-2xl">
          <FileText className="text-white" size={32} />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-indigo-900">Editor</div>
          <div className="text-sm text-purple-500 font-medium">Contenido generativo</div>
        </div>
      </div>
      <nav className="flex-1 space-y-2 min-h-0">
        {options.map((opt, idx) => {
          const Icon = opt.icon;
          const isActive = selected === opt.key;
          const canGo = true;
          return (
            <button
              key={opt.key}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-base text-left focus:outline-none ${isActive ? "bg-indigo-600 text-white shadow-lg" : "text-indigo-900 hover:bg-indigo-100"} ${canGo ? "cursor-pointer" : "cursor-not-allowed"}`}
              onClick={() => onSelect(opt.key)}
              type="button"
            >
              <Icon className={isActive ? "text-white" : "text-indigo-500"} size={22} />
              <span>{opt.label}</span>
              {isActive && <span className="ml-auto w-2 h-2 bg-white/80 rounded-full" />} 
            </button>
          );
        })}
      </nav>
      <div className="mt-auto pt-8 text-xs text-gray-500 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          Guardado automático activado
        </div>
        <div className="text-green-600 font-semibold mt-1">● Guardado</div>
      </div>
    </aside>
  );
} 