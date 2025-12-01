"use client";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ value, max, className = "", showPercentage = true }: ProgressBarProps) {
  const percentage = (value / max) * 100;
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-[var(--primary-green)] h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
      {showPercentage && (
        <div className="text-xs text-[var(--text-muted)] mt-1">
          {percentage.toFixed(1)}% used
        </div>
      )}
    </div>
  );
}

