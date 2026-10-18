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
        bg: 'bg-[#FBECEE]',
        text: 'text-[#BC414A]',
        border: 'border-[#BC414A]/25',
        dot: 'bg-[#BC414A]',
      };
    case 'high':
      return {
        bg: 'bg-[#FFF4E3]',
        text: 'text-[#A87528]',
        border: 'border-[#A87528]/25',
        dot: 'bg-[#A87528]',
      };
    case 'medium':
      return {
        bg: 'bg-[#EAF0F4]',
        text: 'text-[#375A6B]',
        border: 'border-[#375A6B]/25',
        dot: 'bg-[#375A6B]',
      };
    case 'low':
      return {
        bg: 'bg-[#E9F3EF]',
        text: 'text-[#258167]',
        border: 'border-[#258167]/25',
        dot: 'bg-[#258167]',
      };
    default:
      return {
        bg: 'bg-[#F7F8FA]',
        text: 'text-[#6B7782]',
        border: 'border-[#E4E8EC]',
        dot: 'bg-[#8B959E]',
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
      bg: 'bg-[#BC414A]',
      text: 'text-[#BC414A]',
      badge: 'bg-[#FBECEE] text-[#BC414A] border-[#BC414A]/25',
      level: 'Critical Priority',
    };
  }
  if (score >= 70) {
    return {
      bg: 'bg-[#A87528]',
      text: 'text-[#A87528]',
      badge: 'bg-[#FFF4E3] text-[#A87528] border-[#A87528]/25',
      level: 'High Priority',
    };
  }
  if (score >= 40) {
    return {
      bg: 'bg-[#375A6B]',
      text: 'text-[#375A6B]',
      badge: 'bg-[#EAF0F4] text-[#375A6B] border-[#375A6B]/25',
      level: 'Moderate Priority',
    };
  }
  return {
    bg: 'bg-[#258167]',
    text: 'text-[#258167]',
    badge: 'bg-[#E9F3EF] text-[#258167] border-[#258167]/25',
    level: 'Low Urgency',
  };
}
