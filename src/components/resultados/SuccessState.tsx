import { CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SuccessStateProps {
  message: string;
}

export default function SuccessState({ message }: SuccessStateProps) {
  return (
    <Alert className="border-emerald-200 bg-emerald-50">
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      <AlertDescription className="text-emerald-800">
        {message}
      </AlertDescription>
    </Alert>
  );
}
