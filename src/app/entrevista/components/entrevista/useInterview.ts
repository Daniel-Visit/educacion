import { useState } from "react";
import { useTTS } from "../useTTS";
import { Respuestas } from "./constants";

export function useInterview(preguntas: string[]) {
  const [step, setStep] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>({ 
    anios: "", 
    nivel: "", 
    asignatura: "", 
    horas: "", 
    estudiantes: "" 
  });
  const [showCierre, setShowCierre] = useState(false);
  const [showResumen, setShowResumen] = useState(false);

  const handleSelect = (key: string, value: string) => {
    setRespuestas({ ...respuestas, [key]: value });
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, preguntas.length - 1));
  };

  // Determinar si el botón debe estar deshabilitado
  let disableNext = false;
  if ([3, 4, 5, 6, 7].includes(step)) {
    const keys = ["anios", "nivel", "asignatura", "horas", "estudiantes"];
    const key = keys[step - 3];
    disableNext = !respuestas[key];
  }

  // Navegación segura en el sidebar
  const handleSidebarClick = (idx: number) => {
    if (idx <= step) {
      setStep(idx);
    }
  };

  // TTS hook: leer el texto correcto según el estado
  const ttsText = (step === 8 && showCierre && !showResumen) ? preguntas[9] : preguntas[step];
  useTTS(ttsText, true);

  return {
    step,
    respuestas,
    showCierre,
    showResumen,
    disableNext,
    handleSelect,
    handleNext,
    handleSidebarClick,
    setShowCierre,
    setShowResumen,
  };
} 