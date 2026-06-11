import React from "react";

interface Step {
  id: number;
  label: string;
}

interface SimulatorStepCardProps {
  currentStep: number;
  steps: Step[];
}

export default function SimulatorStepCard({ currentStep, steps }: SimulatorStepCardProps) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm">
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">Simulation Stage Flow</p>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {steps.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="flex-1 flex items-center gap-3 w-full">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-slate-950"
                      : isActive
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-extrabold scale-105"
                      : "bg-slate-900 text-slate-550 border border-slate-800 text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-white font-bold" : isCompleted ? "text-slate-350" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden sm:block flex-1 h-[1px] bg-slate-850 mx-2"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
