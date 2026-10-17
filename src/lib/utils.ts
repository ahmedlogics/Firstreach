import { SeverityLevel } from "./types";

/**
 * Clean class combining utility without heavy external dependencies
 */
export function cn(...inputs: (string | boolean | undefined | null | { [key: string]: boolean })[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  
  return classes.join(' ');
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCurrencyPkr(amount: number): string {
  return `PKR ${new Intl.NumberFormat('en-PK').format(amount)}`;
}

export function formatTimeUrgency(hours: number): string {
  if (hours <= 0) return 'Immediate hazard';
  if (hours < 1) return `${Math.round(hours * 60)} min before critical`;
  if (hours === 1) return '1 hour before critical';
  return `${hours.toFixed(1)} hrs before critical`;
}

export function getSeverityColor(severity: SeverityLevel): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-[#F16D70]',
      };
    case 'high':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-[#F5B544]',
      };
    case 'medium':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'low':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-[#10B981]',
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function getPriorityScoreColor(score: number): {
  bg: string;
  text: string;
  badge: string;
  level: string;
} {
  if (score >= 90) {
    return {
      bg: 'bg-red-500',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800 border-red-200',
      level: 'Critical Priority',
    };
  }
  if (score >= 70) {
    return {
      bg: 'bg-amber-500',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      level: 'High Priority',
    };
  }
  if (score >= 40) {
    return {
      bg: 'bg-blue-500',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      level: 'Moderate Priority',
    };
  }
  return {
    bg: 'bg-emerald-500',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    level: 'Low Urgency',
  };
}
