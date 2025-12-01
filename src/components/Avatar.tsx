"use client";

interface AvatarProps {
  initials: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ initials, className = "", size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div className={`${sizeClasses[size]} bg-[var(--primary-green)] rounded-full flex items-center justify-center text-white font-medium ${className}`}>
      {initials}
    </div>
  );
}

