"use client";

interface StatusBadgeProps {
  status: 'completed' | 'pending' | 'failed' | 'draft';
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const baseClasses = "status-badge";
  const statusClasses = {
    completed: "status-completed",
    pending: "status-pending", 
    failed: "status-failed",
    draft: "status-draft"
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status]}`}>
      {children}
    </span>
  );
}

