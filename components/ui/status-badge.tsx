import { cn } from "@/lib/utils";

export type TaskStatusType = "pending" | "submitted" | "approved" | "rejected" | "na";

interface StatusBadgeProps {
  status: TaskStatusType;
  className?: string;
}

const statusConfig: Record<
  TaskStatusType,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-slate-100 text-slate-600",
  },
  submitted: {
    label: "Submitted",
    className: "bg-amber-100 text-amber-800",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700",
  },
  na: {
    label: "Not Applicable",
    className: "bg-blue-100 text-blue-700",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold text-xs px-2.5 py-0.5 rounded-full",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}