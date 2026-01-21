import React from 'react';

function ProgressStepper({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center group">
              {/* Step circle */}
              <div className="relative">
                {/* Pulse ring for active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-flag-red/30 animate-ping" style={{ animationDuration: '2s' }} />
                )}
                
                {/* Glow effect */}
                {(isActive || isCompleted) && (
                  <div className={`absolute inset-0 rounded-xl blur-md ${isCompleted ? 'bg-green-500/30' : 'bg-flag-red/30'}`} />
                )}
                
                <div
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-500 transform
                  ${isCompleted
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-100'
                    : isActive
                        ? 'bg-gradient-to-br from-flag-red to-flag-red/80 text-white shadow-lg shadow-flag-red/30 scale-110'
                        : 'bg-navy-800/50 text-navy-400 border border-navy-700/50 scale-100 group-hover:scale-105 group-hover:border-navy-600/50'
                  }`}
              >
                {isCompleted ? (
                    <svg className="w-5 h-5 animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                    <span className={isActive ? 'animate-bounce-in' : ''}>{stepNumber}</span>
                )}
                </div>
              </div>
              
              {/* Step label */}
              <span
                className={`mt-3 text-xs font-medium hidden sm:block transition-all duration-300
                  ${isActive 
                    ? 'text-white translate-y-0 opacity-100' 
                    : isCompleted 
                      ? 'text-green-400 translate-y-0 opacity-100' 
                      : 'text-navy-500 translate-y-1 opacity-70 group-hover:opacity-100 group-hover:translate-y-0'
                  }`}
              >
                {step.name}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-3 h-1 rounded-full bg-navy-800/50 overflow-hidden relative">
                {/* Background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-navy-700/30 to-transparent animate-shimmer" style={{ animationDuration: '2s' }} />
                
                {/* Progress fill */}
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out
                    ${stepNumber < currentStep 
                      ? 'w-full bg-gradient-to-r from-green-500 to-green-400' 
                      : stepNumber === currentStep
                        ? 'w-1/2 bg-gradient-to-r from-flag-red to-flag-red/50'
                        : 'w-0'
                    }`}
              />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default ProgressStepper;
