import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  Bell,
  UserCircle,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    title: 'Welcome to LifeTrack',
    description: 'Track activities, monitor time elapsed, and never miss important events. Your personal companion for staying organized.',
    icon: CheckCircle2,
    color: 'bg-emerald-500',
  },
  {
    title: 'Dashboard Overview',
    description: 'Your dashboard shows stats cards, recent activities, and how much time has passed since each activity. Everything at a glance.',
    icon: LayoutDashboard,
    color: 'bg-[#6C5CE7]',
  },
  {
    title: 'Logging Activities',
    description: 'Tap the + button to log an activity occurrence. Select the activity type, enter details like amount or duration, and save.',
    icon: PlusCircle,
    color: 'bg-blue-500',
  },
  {
    title: 'Create Custom Activities',
    description: 'Define your own activity types with custom icons, colors, and fields like "expected duration" for reminders.',
    icon: ListTodo,
    color: 'bg-violet-500',
  },
  {
    title: 'Smart Reminders',
    description: 'Set expected durations when logging, and LifeTrack will automatically remind you when it is time to do it again.',
    icon: Bell,
    color: 'bg-orange-500',
  },
  {
    title: 'Profile & Birthday',
    description: 'Add your birthday in your profile to get a special reminder. Track your consistency and celebrate milestones.',
    icon: UserCircle,
    color: 'bg-pink-500',
  },
];

export function OnboardingOverlay() {
  const { dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(() => {
      dispatch({ type: 'COMPLETE_ONBOARDING' });
    }, 300);
  };

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className={cn(
      'fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300',
      isExiting && 'opacity-0'
    )}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex gap-1.5 p-6 pb-0">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-300',
                i <= currentStep ? 'bg-[#6C5CE7]' : 'bg-gray-200'
              )}
            />
          ))}
        </div>

        <div className="p-6 pt-8 text-center">
          <div className={cn('w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6', step.color)}>
            <StepIcon className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h2>
          <p className="text-gray-500 leading-relaxed">{step.description}</p>
        </div>

        <div className="p-6 pt-2">
          <div className="flex gap-3">
            {currentStep > 0 ? (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex-1 h-12 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleComplete}
                className="flex-1 h-12 rounded-xl"
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 h-12 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD4] text-white"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>

          <div className="flex justify-center gap-2 mt-5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  i === currentStep ? 'bg-[#6C5CE7]' : 'bg-gray-300'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
