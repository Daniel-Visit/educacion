"use client";
import React from "react";
import TypewriterText from "../TypewriterText";
import Dropdown from "../Dropdown";
import { Respuestas } from "./constants";

interface InterviewCardProps {
  step: number;
  preguntas: string[];
  isTypeS: boolean;
  respuestas: Respuestas;
  alternativas: {
    anios: string[];
    nivel: string[];
    asignatura: string[];
    horas: string[];
    estudiantes: string[];
  };
  handleSelect: (key: string, value: string) => void;
  handleNext: () => void;
  disableNext: boolean;
  showCierre: boolean;
  showResumen: boolean;
  setShowCierre: (show: boolean) => void;
  setShowResumen: (show: boolean) => void;
  renderResumen: () => React.ReactNode;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  step,
  preguntas,
  isTypeS,
  respuestas,
  alternativas,
  handleSelect,
  handleNext,
  disableNext,
  showCierre,
  showResumen,
  setShowCierre,
  setShowResumen,
  renderResumen
}) => {
  // Renderizar alternativas si corresponde
  const renderSelect = () => {
    if (step === 3) {
      return (
        <Dropdown
          value={respuestas.anios}
          onChange={v => handleSelect("anios", v)}
          options={alternativas.anios}
          placeholder="Selecciona años"
          className="mt-4"
        />
      );
    }
    if (step === 4) {
      return (
        <Dropdown
          value={respuestas.nivel}
          onChange={v => handleSelect("nivel", v)}
          options={alternativas.nivel}
          placeholder="Selecciona nivel"
          className="mt-4"
        />
      );
    }
    if (step === 5) {
      return (
        <Dropdown
          value={respuestas.asignatura}
          onChange={v => handleSelect("asignatura", v)}
          options={alternativas.asignatura}
          placeholder="Selecciona asignatura"
          className="mt-4 min-w-[320px]"
        />
      );
    }
    if (step === 6) {
      return (
        <Dropdown
          value={respuestas.horas}
          onChange={v => handleSelect("horas", v)}
          options={alternativas.horas}
          placeholder="Selecciona horas"
          className="mt-4"
        />
      );
    }
    if (step === 7) {
      return (
        <Dropdown
          value={respuestas.estudiantes}
          onChange={v => handleSelect("estudiantes", v)}
          options={alternativas.estudiantes}
          placeholder="Selecciona estudiantes"
          className="mt-4"
        />
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] w-full max-w-2xl flex flex-col items-center max-h-[80vh] mx-auto h-fit p-8 self-start mt-8 mb-8 transition-all">
      {step < 8 ? (
        <>
          <div className="block w-full text-xl text-gray-800 text-left mb-6 min-h-[48px] whitespace-pre-line">
            {isTypeS ? (
              <TypewriterText text={preguntas[step]} active={isTypeS} />
            ) : (
              preguntas[step]
            )}
          </div>
          {renderSelect()}
          <button
            className={`mt-8 w-60 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold text-lg py-3 rounded-2xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={handleNext}
            disabled={disableNext}
          >
            Continuar
          </button>
        </>
      ) : step === 8 && !showCierre ? (
        // Mostrar muchas gracias y botón continuar
        <>
          <div className="block w-full text-xl text-gray-800 text-left mb-6 min-h-[48px] whitespace-pre-line">
            {isTypeS ? (
              <TypewriterText text={preguntas[step]} active={isTypeS} />
            ) : (
              preguntas[step]
            )}
          </div>
          <button
            className="mt-8 w-60 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold text-lg py-3 rounded-2xl shadow-md"
            onClick={() => setShowCierre(true)}
          >
            Continuar
          </button>
        </>
      ) : step === 8 && showCierre && !showResumen ? (
        // Mostrar frase de cierre y botón ver resumen
        <>
          <div className="block w-full text-xl text-gray-800 text-left mb-6 min-h-[48px] whitespace-pre-line">
            <TypewriterText text={preguntas[9]} active={true} />
          </div>
          <button
            className="mt-8 w-60 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold text-lg py-3 rounded-2xl shadow-md"
            onClick={() => setShowResumen(true)}
          >
            Ver resumen
          </button>
        </>
      ) : step === 8 && showResumen ? (
        <>
          {renderResumen()}
        </>
      ) : (
        renderResumen()
      )}
    </div>
  );
};

export default InterviewCard; 