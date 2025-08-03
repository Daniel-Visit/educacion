import { useEffect, useRef } from 'react';

function getFemaleEsVoice(voices: SpeechSynthesisVoice[]) {
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

  useEffect(() => {
    if (!enabled || !text) return;
    const synth = window.speechSynthesis;
    let voices = synth.getVoices();
    const speakNow = () => {
      if (synth.speaking) synth.cancel();
      const utter = new window.SpeechSynthesisUtterance(text);
      voices = synth.getVoices();
      const femaleEs = getFemaleEsVoice(voices);
      if (femaleEs) utter.voice = femaleEs;
      utter.rate = 1;
      utter.pitch = 1.1;
      utteranceRef.current = utter;
      synth.speak(utter);
    };
    if (voices.length === 0) {
      synth.onvoiceschanged = () => {
        speakNow();
        synth.onvoiceschanged = null;
      };
    } else {
      speakNow();
    }
    return () => {
      synth.cancel();
      synth.onvoiceschanged = null;
    };
  }, [text, enabled]);

  const stop = () => {
    window.speechSynthesis.cancel();
  };

  const speak = (t: string) => {
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(t);
    const voices = window.speechSynthesis.getVoices();
    const femaleEs = getFemaleEsVoice(voices);
    if (femaleEs) utter.voice = femaleEs;
    utter.rate = 1;
    utter.pitch = 1.1;
    window.speechSynthesis.speak(utter);
  };

  return { speak, stop };
}
