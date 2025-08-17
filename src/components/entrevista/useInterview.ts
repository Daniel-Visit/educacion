import { useState, useEffect } from 'react';
import { useTTS } from './useTTS';
import { Respuestas } from './constants';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function useInterview(preguntas: string[], initialStep: number = 0) {
  const [step, setStep] = useState(initialStep);
  const [maxStep, setMaxStep] = useState(initialStep);
  const [respuestas, setRespuestas] = useState<Respuestas>({
    anios: '',
    nivel: '',
    asignatura: '',
    horas: '',
    estudiantes: '',
  });
  const [showCierre, setShowCierre] = useState(false);
  const [showResumen, setShowResumen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sincronizar el paso con la URL (cuando cambia localmente)
  useEffect(() => {
    const currentStepParam = searchParams.get('step');
    if (currentStepParam === null || parseInt(currentStepParam) !== step) {
      router.replace(`${pathname}?step=${step}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Actualizar maxStep si se avanza más lejos
  useEffect(() => {
    if (step > maxStep) setMaxStep(step);
  }, [step, maxStep]);

  // Sincronizar el estado local con la URL (cuando cambia la URL)
  useEffect(() => {
    const currentStepParam = searchParams.get('step');
    if (currentStepParam !== null) {
      const urlStep = parseInt(currentStepParam);
      if (isNaN(urlStep)) return;
      if (urlStep > maxStep) {
        // Si la URL pide un paso mayor al permitido, redirigir a maxStep
        if (urlStep !== maxStep) {
          router.replace(`${pathname}?step=${maxStep}`);
        }
        setStep(maxStep);
      } else if (urlStep !== step) {
        setStep(urlStep);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, maxStep]);

  const handleSelect = (key: string, value: string) => {
    setRespuestas({ ...respuestas, [key]: value });
  };

  const handleNext = () => {
    setStep(prev => {
      const nextStep = Math.min(prev + 1, preguntas.length - 1);
      if (nextStep > maxStep) setMaxStep(nextStep);
      return nextStep;
    });
  };

  // Determinar si el botón debe estar deshabilitado
  let disableNext = false;
  if ([3, 4, 5, 6, 7].includes(step)) {
    const keys = ['anios', 'nivel', 'asignatura', 'horas', 'estudiantes'];
    const key = keys[step - 3];
    disableNext = !respuestas[key];
  }

  // Navegación segura en el sidebar: solo hasta maxStep
  const handleSidebarClick = (idx: number) => {
    if (idx <= maxStep) {
      setStep(idx);
    }
  };

  // TTS hook: leer el texto correcto según el estado
  const ttsText =
    step === 8 && showCierre && !showResumen ? preguntas[9] : preguntas[step];

  const { speak, stop } = useTTS(ttsText, audioEnabled);

  return {
    step,
    maxStep,
    respuestas,
    showCierre,
    showResumen,
    disableNext,
    handleSelect,
    handleNext,
    handleSidebarClick,
    setShowCierre,
    setShowResumen,
    speak,
    stop,
    audioEnabled,
    setAudioEnabled,
  };
}
