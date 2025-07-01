"use client";
import React from "react";
import Sidebar from "./components/entrevista/Sidebar";
import InterviewCard from "./components/entrevista/InterviewCard";
import Summary from "./components/entrevista/Summary";
import OrbVideo from "./components/entrevista/OrbVideo";
import { useInterview } from "./components/entrevista/useInterview";
import { steps, preguntas, alternativas, preguntaToStep } from "./components/entrevista/constants";

export default function Entrevista() {
  const {
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
  } = useInterview(preguntas);

  // Saber si el paso es tipo S
  const isTypeS = steps[step]?.tipo === "S";

  return (
    <div className="min-h-screen bg-[#f7f8fd] flex flex-row w-full">
      <div className="flex w-full max-w-7xl min-h-screen mx-auto rounded-3xl my-6 bg-white/80 shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] overflow-hidden">
        {/* Sidebar glassmorphism */}
        <Sidebar
          steps={steps}
          step={step}
          preguntaToStep={preguntaToStep}
          onStepClick={handleSidebarClick}
        />
        <main className="flex-1 w-full flex flex-col relative h-full min-h-screen justify-start">
          {/* Orb Video */}
          <OrbVideo step={step} showResumen={showResumen} />
          {/* Interview Card */}
          <InterviewCard
            step={step}
            preguntas={preguntas}
            isTypeS={isTypeS}
            respuestas={respuestas}
            alternativas={alternativas}
            handleSelect={handleSelect}
            handleNext={handleNext}
            disableNext={disableNext}
            showCierre={showCierre}
            showResumen={showResumen}
            setShowCierre={setShowCierre}
            setShowResumen={setShowResumen}
            renderResumen={() => <Summary respuestas={respuestas} />}
          />
        </main>
      </div>
    </div>
  );
} 