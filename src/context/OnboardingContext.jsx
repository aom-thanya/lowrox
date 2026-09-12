import React, { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children, onComplete, initialData }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    demographics: { age: '', gender: '', birthDate: '' },
    fitnessLevel: { 
      runningDistance: '', 
      runningDuration: '',
      distanceSelection: '',
      customDistance: '',
      durationSelection: '',
      customDurationHours: '',
      customDurationMinutes: ''
    },
    goals: [{ 
      id: Date.now().toString(), 
      goalType: '', 
      targetValue: '', 
      targetDate: '',
      // UI State for Step 3
      targetDistanceSelection: '',
      customTargetDistance: '',
      targetDurationSelection: '',
      customTargetDurationHrs: '',
      customTargetDurationMins: '',
      eventSelection: '',
      customEventName: '',
      buddyStatus: '',
      goalEnduranceFocus: '', // value
      goalTargetDateSelect: '', // 'plus_1_month', 'custom_date'
      goalCustomDate: '', // YYYY-MM-DD
    }],
    // --- Step 4: Your Rhythm (UI State) ---
    availabilityWindows: [
      {
        id: Date.now().toString(),
        areaLabel: '',
        areaTypes: [], // e.g. ['park', 'gym']
        dayPreset: '', // 'weekdays', 'weekends', 'custom', 'flexible'
        selectedDays: [], // e.g. ['monday', 'tuesday']
        weeklyFrequency: '',
        timePresets: [], // e.g. ['after_work']
        customTimeFrom: '',
        customTimeTo: '',
        note: ''
      }
    ],
    // --- Step 5: Safety Check (UI State) ---
    safetyCheck: {
      mainSelection: [], // 'none', 'injury', 'health_condition', 'medication', 'other_restriction', 'unsure'
      concerns: [] // Array of concern details
    },
    // Keep original db schema mapped array just in case
    constraints: [{ id: Date.now().toString(), constraintType: '', areaType: '', areaLabel: '', dayOfWeek: '', availableFrom: '', availableTo: '', weeklyFrequency: '', note: '' }],
    health: { hasConcerns: null, concerns: [] } // Old state, can keep for now or remove if safe. Let's keep it just in case.
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
