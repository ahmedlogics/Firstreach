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
        bg: 'bg-[#FAE8E7]',
        text: 'text-[#B74349]',
        border: 'border-[#B74349]/30',
        dot: 'bg-[#B74349]',
      };
    case 'high':
      return {
        bg: 'bg-[#FFF2DD]',
        text: 'text-[#A87426]',
        border: 'border-[#A87426]/30',
        dot: 'bg-[#A87426]',
      };
    case 'medium':
      return {
        bg: 'bg-[#EDF1F5]',
        text: 'text-[#536A82]',
        border: 'border-[#536A82]/30',
        dot: 'bg-[#536A82]',
      };
    case 'low':
      return {
        bg: 'bg-[#E5EEE8]',
        text: 'text-[#377D65]',
        border: 'border-[#377D65]/30',
        dot: 'bg-[#377D65]',
      };
    default:
      return {
        bg: 'bg-[#F0F2F5]',
        text: 'text-[#667085]',
        border: 'border-[#E8E6E1]',
        dot: 'bg-[#667085]',
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
      bg: 'bg-[#B74349]',
      text: 'text-[#B74349]',
      badge: 'bg-[#FAE8E7] text-[#B74349] border-[#B74349]/30',
      level: 'Critical Priority',
    };
  }
  if (score >= 70) {
    return {
      bg: 'bg-[#A87426]',
      text: 'text-[#A87426]',
      badge: 'bg-[#FFF2DD] text-[#A87426] border-[#A87426]/30',
      level: 'High Priority',
    };
  }
  if (score >= 40) {
    return {
      bg: 'bg-[#536A82]',
      text: 'text-[#536A82]',
      badge: 'bg-[#EDF1F5] text-[#536A82] border-[#536A82]/30',
      level: 'Moderate Priority',
    };
  }
  return {
    bg: 'bg-[#377D65]',
    text: 'text-[#377D65]',
    badge: 'bg-[#E5EEE8] text-[#377D65] border-[#377D65]/30',
    level: 'Low Urgency',
  };
}
