import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  onClose: () => void;
  gradient?: string;
}

export default function ModalHeader({
  title,
  subtitle,
  icon,
  onClose,
  gradient = 'from-indigo-600 to-purple-600',
}: ModalHeaderProps) {
  return (
    <div
      className={`bg-gradient-to-r ${gradient} text-white p-6 rounded-t-2xl flex-shrink-0`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold">{title}</h3>
            {subtitle && <p className="text-indigo-100">{subtitle}</p>}
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
