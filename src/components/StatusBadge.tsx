import type { ReactNode } from "react";

const statusClasses = {
  completed: "status-completed",
  pending: "status-pending",
  failed: "status-failed",
  draft: "status-draft",
  approved: "status-completed",
  scheduled: "status-pending",
  processing: "status-pending",
  active: "status-completed",
  inactive: "status-failed",
  urgent: "status-failed",
} as const;

export type StatusBadgeVariant = keyof typeof statusClasses;

interface StatusBadgeProps {
  status: StatusBadgeVariant;
  children: ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const baseClasses = "status-badge";
  const variantClass = statusClasses[status] ?? statusClasses.pending;

  return <span className={`${baseClasses} ${variantClass}`}>{children}</span>;
}
