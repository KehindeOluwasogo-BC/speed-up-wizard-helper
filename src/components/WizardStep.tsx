
import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStepProps {
  step: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  isLast?: boolean;
  onClick?: () => void;
}

const WizardStep = ({
  step,
  title,
  description,
  isActive,
  isCompleted,
  isLast = false,
  onClick
}: WizardStepProps) => {
  return (
    <div className={cn(
      "relative flex items-start group", 
      onClick ? "cursor-pointer" : "",
      !isLast && "pb-8"
    )}
    onClick={onClick}>
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-4 top-8 -bottom-8 w-0.5 bg-muted group-hover:bg-border">
          {isCompleted && <div className="absolute left-0 top-0 h-full w-0.5 bg-success" />}
        </div>
      )}

      {/* Step indicator */}
      <div className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-full border text-center z-10",
        isActive ? "border-primary bg-primary text-primary-foreground" :
        isCompleted ? "border-success bg-success text-success-foreground" :
        "border-border bg-background"
      )}>
        {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-sm">{step}</span>}
      </div>

      {/* Content */}
      <div className="ml-4 space-y-1">
        <div className="flex items-center">
          <p className={cn(
            "text-sm font-medium leading-none",
            isActive && "text-primary",
            isCompleted && "text-success"
          )}>
            {title}
          </p>
          {(isActive || isCompleted) && !isLast && (
            <ChevronRight className={cn(
              "ml-1 h-4 w-4",
              isActive && "text-primary animate-pulse-light",
              isCompleted && "text-success"
            )} />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default WizardStep;
