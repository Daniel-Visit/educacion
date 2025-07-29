import React from 'react';
import { Check } from 'lucide-react';
import { Step } from '@/types/matrices';

interface MatrizStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export default function MatrizStepIndicator({
  steps,
  currentStep,
  onStepClick,
  className = ''
}: MatrizStepIndicatorProps) {
  return (
    <div className="flex justify-center items-center gap-0 mb-12 mt-8">
      {steps.map((stepObj, idx) => (
        <div key={stepObj.n} className="flex items-center">
          {/* Contenedor del paso (número + texto) */}
          <div className="flex flex-col items-center">
            {/* Círculo del paso */}
            {currentStep > stepObj.n ? (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl text-white transition-all duration-300 transform hover:scale-105">
                <Check className="w-7 h-7" />
              </div>
            ) : currentStep === stepObj.n ? (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl text-white text-xl font-bold transition-all duration-300 transform hover:scale-105">
                {stepObj.n}
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 text-xl font-bold transition-all duration-300 hover:bg-gray-50 hover:border-gray-300">
                {stepObj.n}
              </div>
            )}
            {/* Texto del paso */}
            <span className={`mt-3 text-sm font-medium text-center ${currentStep === stepObj.n ? 'text-indigo-700 font-bold' : currentStep > stepObj.n ? 'text-emerald-600' : 'text-gray-500'}`}>{stepObj.label}</span>
          </div>
          
          {/* Línea entre pasos */}
          {idx < steps.length - 1 && (
            <div className={`h-px w-32 mb-8 rounded-full ${currentStep > stepObj.n ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-200'} mx-8 transition-all duration-300`}></div>
          )}
        </div>
      ))}
    </div>
  );
} 