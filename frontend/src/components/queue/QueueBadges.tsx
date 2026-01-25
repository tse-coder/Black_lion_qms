import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Priority, QueueStatus } from '@/lib/api';

const priorityBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      priority: {
        Urgent: 'bg-priority-urgent text-priority-urgent-foreground',
        High: 'bg-priority-high text-priority-high-foreground',
        Medium: 'bg-priority-medium text-priority-medium-foreground',
        Low: 'bg-priority-low text-priority-low-foreground',
      },
    },
    defaultVariants: {
      priority: 'Medium',
    },
  }
);

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span className={cn(priorityBadgeVariants({ priority }), className)}>
      {priority}
    </span>
  );
}

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      status: {
        Waiting: 'bg-status-waiting text-status-waiting-foreground',
        InProgress: 'bg-status-in-progress text-status-in-progress-foreground',
        Complete: 'bg-status-complete text-status-complete-foreground',
        Cancelled: 'bg-status-cancelled text-status-cancelled-foreground',
      },
    },
    defaultVariants: {
      status: 'Waiting',
    },
  }
);

interface StatusBadgeProps {
  status: QueueStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const displayStatus = status === 'InProgress' ? 'In Progress' : status;
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      {displayStatus}
    </span>
  );
}
