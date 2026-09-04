import React, { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    demographics: { age: '', gender: '' },
    fitnessLevel: { runningDistance: '', runningDuration: '' },
    goals: [{ id: Date.now().toString(), goalType: '', targetValue: '', targetDate: '' }],
    constraints: [{ id: Date.now().toString(), constraintType: '', areaType: '', areaLabel: '', dayOfWeek: '', availableFrom: '', availableTo: '', weeklyFrequency: '', note: '' }],
    health: { hasConcerns: null, concerns: [] } // concerns items: { id, concernType, concernName, medicationName, restrictionLevel, restrictionNote, startDate, endDate, isActive }
  });

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const updateFormData = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: typeof data === 'function' ? data(prev[section]) : data
    }));
  };

  const submitForm = async () => {
    // This is where API call would go in production to save all 5 sections.
    // For now, we mock the success.
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <OnboardingContext.Provider 
      value={{ 
        currentStep, 
        formData, 
        nextStep, 
        prevStep, 
        goToStep, 
        updateFormData, 
        submitForm 
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
