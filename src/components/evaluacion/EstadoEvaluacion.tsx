import { obtenerDescripcionEstado, obtenerColorEstado } from '@/lib/evaluacion-utils'
import type { EstadoEvaluacion } from '@/lib/evaluacion-utils'
import { CheckCircle, AlertCircle, Clock, XCircle, FileText } from 'lucide-react'

interface EstadoEvaluacionProps {
  estado: EstadoEvaluacion
  className?: string
}

export default function EstadoEvaluacion({ estado, className = '' }: EstadoEvaluacionProps) {
  const getIcon = () => {
    switch (estado) {
      case 'completa':
        return <CheckCircle size={16} />
      case 'borrador':
        return <FileText size={16} />
      case 'preguntas_incompletas':
      case 'indicadores_incompletos':
        return <AlertCircle size={16} />
      case 'cantidad_incorrecta':
        return <XCircle size={16} />
      default:
        return <Clock size={16} />
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${obtenerColorEstado(estado)} ${className}`}>
      {getIcon()}
      <span>{obtenerDescripcionEstado(estado)}</span>
    </div>
  )
} 