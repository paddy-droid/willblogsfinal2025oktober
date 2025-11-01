import React from 'react';
import { Step } from '../types';

interface StepIndicatorProps {
  currentStep: Step;
}

const stepsConfig = [
  { id: Step.RESEARCH, label: 'Recherche' },
  { id: Step.OUTLINE, label: 'Gliederung & SEO' },
  { id: Step.CONTENT_PART_1, label: 'Teil 1' },
  { id: Step.CONTENT_PART_2, label: 'Teil 2' },
  { id: Step.CONTENT_PART_3, label: 'Teil 3' },
  { id: Step.COMPLETED, label: 'Fertig' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  if (currentStep === Step.TOPIC_INPUT) {
    return null;
  }
  
  const currentStepIndex = stepsConfig.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 md:px-0">
      <div className="flex items-center justify-between">
        {stepsConfig.map((step, index) => {
          const isActive = index <= currentStepIndex;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center text-center">
                <div
                  style={{ backgroundColor: isActive ? '#E58E1A' : '#d1d5db', color: isActive ? 'white' : '#4b5563' }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300`}
                >
                  {index < currentStepIndex ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <p style={{ color: isActive ? '#E58E1A' : '#6b7280' }} className={`mt-2 text-xs md:text-sm`}>
                  {step.label}
                </p>
              </div>
              {index < stepsConfig.length - 1 && (
                <div 
                  style={{ backgroundColor: index < currentStepIndex ? '#E58E1A' : '#d1d5db' }}
                  className={`flex-1 h-1 mx-2 transition-all duration-300`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;