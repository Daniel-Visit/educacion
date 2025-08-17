import { useEffect, useRef } from 'react';

function getFemaleEsVoice(voices: SpeechSynthesisVoice[]) {
  // Buscar voces específicas que sabemos que funcionan bien
  const preferredVoices = [
    'Paulina',
    'Monica',
    'Sofia',
    'Elena',
    'Maria',
    'Ana',
    'Carmen',
    'Isabel',
  ];

  // Primero buscar voces preferidas
  for (const name of preferredVoices) {
    const voice = voices.find(
      v =>
        v.lang.startsWith('es') &&
        v.name.toLowerCase().includes(name.toLowerCase())
    );
    if (voice) return voice;
  }

  // Si no encuentra preferidas, buscar cualquier voz femenina
  return (
    voices.find(
      v => v.lang.startsWith('es') && v.name.toLowerCase().includes('female')
    ) ||
    voices.find(
      v => v.lang.startsWith('es') && v.name.toLowerCase().includes('mujer')
    ) ||
    voices.find(v => v.lang.startsWith('es'))
  );
}

export function useTTS(text: string, enabled: boolean) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);
  const currentTextRef = useRef<string>('');

  // Solo reproducir automáticamente si enabled es true
  useEffect(() => {
    if (!enabled || !text) return;

    // Evitar reproducir el mismo texto múltiples veces
    if (currentTextRef.current === text && isSpeakingRef.current) {
      return;
    }

    // TTS activado

    const synth = window.speechSynthesis;

    // Asegurar que las voces estén cargadas antes de reproducir
    const ensureVoicesLoaded = () => {
      const voices = synth.getVoices();
      if (voices.length === 0) {
        // Si no hay voces, esperar un poco y reintentar
        setTimeout(ensureVoicesLoaded, 100);
        return;
      }

      // Continuar con la reproducción una vez que las voces estén disponibles
      startSpeaking();
    };

    const startSpeaking = () => {
      // Cancelar reproducción anterior solo si es necesario
      if (synth.speaking && currentTextRef.current !== text) {
        synth.cancel();
        // Esperar un poco antes de continuar
        setTimeout(() => {
          isSpeakingRef.current = false;
        }, 100);
        return;
      }

      // Si ya está reproduciendo el mismo texto, no hacer nada
      if (synth.speaking && currentTextRef.current === text) {
        return;
      }

      isSpeakingRef.current = true;
      currentTextRef.current = text;

      const utter = new window.SpeechSynthesisUtterance(text);
      const voices = synth.getVoices();

      const femaleEs = getFemaleEsVoice(voices);
      if (femaleEs) {
        utter.voice = femaleEs;
      } else if (voices.length > 0) {
        utter.voice = voices[0];
      }

      utter.rate = 1;
      utter.pitch = 1.1;
      utter.lang = 'es-ES';

      // Event listeners
      utter.onstart = () => {
        isSpeakingRef.current = true;
      };

      utter.onend = () => {
        isSpeakingRef.current = false;
        currentTextRef.current = '';
      };

      utter.onerror = event => {
        // Solo manejar errores que no sean "canceled" o "interrupted"
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          // Error real que necesita atención
        }
        isSpeakingRef.current = false;
        currentTextRef.current = '';
      };

      utteranceRef.current = utter;
      synth.speak(utter);

      return () => {
        // Solo cancelar si el componente se desmonta y está hablando
        if (synth.speaking && utteranceRef.current === utter) {
          synth.cancel();
        }
        isSpeakingRef.current = false;
        currentTextRef.current = '';
      };
    };

    // Iniciar el proceso de carga de voces
    ensureVoicesLoaded();

    return () => {
      // Solo cancelar si el componente se desmonta y está hablando
      if (synth.speaking && utteranceRef.current) {
        synth.cancel();
      }
      isSpeakingRef.current = false;
      currentTextRef.current = '';
    };
  }, [text, enabled]);

  const stop = () => {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
    }
    isSpeakingRef.current = false;
    currentTextRef.current = '';
  };

  const speak = (t: string) => {
    const synth = window.speechSynthesis;

    // Cancelar reproducción anterior
    if (synth.speaking) {
      synth.cancel();
    }

    setTimeout(() => {
      const utter = new window.SpeechSynthesisUtterance(t);
      const voices = synth.getVoices();
      const femaleEs = getFemaleEsVoice(voices);
      if (femaleEs) utter.voice = femaleEs;
      utter.rate = 1;
      utter.pitch = 1.1;
      utter.lang = 'es-ES';

      // Event listeners para el speak manual
      utter.onstart = () => {
        isSpeakingRef.current = true;
      };

      utter.onend = () => {
        isSpeakingRef.current = false;
      };

      utter.onerror = event => {
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          // Error real que necesita atención
        }
        isSpeakingRef.current = false;
      };

      synth.speak(utter);
    }, 200);
  };

  return { speak, stop };
}
