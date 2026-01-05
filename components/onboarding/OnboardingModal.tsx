"use client";

import { useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingProgress } from "./OnboardingProgress";
import { backdropVariants, modalVariants, stepVariants } from "./animations";

export interface OnboardingData {
  name: string;
  goals: { title: string; id: string }[];
  meetingChoice: "try" | "schedule" | null;
  scheduledTime: string | null;
}

// Type for step props that are passed to each step component
export type OnboardingStepProps = {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  onComplete: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
};

// Type for render function children
type StepRenderer = (props: OnboardingStepProps) => ReactNode;

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void;
  children: StepRenderer[];
  initialData?: Partial<OnboardingData>;
}

export function OnboardingModal({
  isOpen,
  onComplete,
  children,
  initialData,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: initialData?.name || "",
    goals: initialData?.goals || [],
    meetingChoice: initialData?.meetingChoice || null,
    scheduledTime: initialData?.scheduledTime || null,
  });

  const totalSteps = children.length;

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    onComplete(data);
  }, [data, onComplete]);

  // Get current step renderer
  const currentStepRenderer = children[currentStep];
  const stepProps: OnboardingStepProps = {
    data,
    updateData,
    nextStep,
    prevStep,
    onComplete: handleComplete,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Blurred Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

          {/* Modal Container */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Progress Indicator */}
            <div className="pt-6 pb-4">
              <OnboardingProgress
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            </div>

            {/* Step Content */}
            <div className="relative min-h-[400px] overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="px-8 pb-8 h-full"
                >
                  {currentStepRenderer(stepProps)}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
