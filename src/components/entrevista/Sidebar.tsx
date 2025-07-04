"use client";
import React from "react";

interface Step {
  key: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  steps: Step[];
  step: number;
  preguntaToStep: string[];
  onStepClick: (idx: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ steps, step, preguntaToStep, onStepClick }) => {
  return (
    <aside className="w-80 bg-white/70 backdrop-blur-md h-full flex flex-col py-10 px-6 border-r border-[#f0f0fa] overflow-y-auto max-h-screen shadow-[0_4px_24px_0_rgba(99,102,241,0.08)] transition-all">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-500 w-14 h-14 flex items-center justify-center rounded-2xl">
          {React.createElement(steps[0].icon, { className: "text-white", size: 32 })}
        </div>
        <div>
          <div className="text-2xl font-extrabold text-indigo-900">Entrevista</div>
          <div className="text-sm text-purple-500 font-medium">Guía personalizada</div>
        </div>
      </div>
      <nav className="flex-1 space-y-2 mb-10">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = preguntaToStep[step] === s.key;
          const isCompleted = idx < step && [3,4,5,6,7].includes(idx);
          const canGo = idx <= step;
          return (
            <button
              key={s.key}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-base text-left focus:outline-none ${isActive ? "bg-indigo-600 text-white shadow-lg" : isCompleted ? "border border-indigo-200 bg-indigo-50 text-indigo-600" : "text-indigo-900 hover:bg-indigo-100"} ${canGo ? "cursor-pointer" : "cursor-not-allowed"}`}
              onClick={() => onStepClick(idx)}
              disabled={!canGo}
              type="button"
            >
              <Icon className={isActive ? "text-white" : "text-indigo-500"} size={22} />
              <span>{s.label}</span>
              {isCompleted && <span className="ml-auto text-xs text-indigo-400">Completado</span>}
              {isActive && <span className="ml-auto w-2 h-2 bg-white/80 rounded-full" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar; 