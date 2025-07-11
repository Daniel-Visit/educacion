import { Metadata } from 'next';
import HorariosList from '@/components/horarios/HorariosList';

export const metadata: Metadata = {
  title: 'Gestión de Horarios - Sistema Educativo',
  description: 'Configura y gestiona horarios docentes para planificación anual',
};

export default function HorariosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HorariosList />
    </div>
  );
} 