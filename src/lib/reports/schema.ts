import { z } from 'zod';


function isValidObservedAt(val: unknown): boolean {
  let time: number;
  if (typeof val === 'string') {
    time = new Date(val).getTime();
  } else if (val instanceof Date) {
    time = val.getTime();
  } else {
    return false;
  }

  if (Number.isNaN(time)) return false;

  const now = Date.now();
  
  if (time > now + 5 * 60 * 1000) return false;
  
  if (time < now - 72 * 60 * 60 * 1000) return false;

  return true;
}


export const emergencyReportSchema = z
  .object({
    zoneId: z.string().uuid({ message: 'Zone ID must be a valid UUID' }),
    locationDescription: z
      .string()
      .min(5, { message: 'Location description must be at least 5 characters' })
      .max(1000, { message: 'Location description cannot exceed 1000 characters' }),
    observedAt: z
      .union([z.string(), z.date()])
      .refine(isValidObservedAt, {
        message: 'Observation time must be a valid date within the past 72 hours and not in the future',
      }),
    reportingFor: z.enum(['myself', 'someone_else'], {
      message: 'Reporting for must be either "myself" or "someone_else"',
    }),
    reporterRole: z.enum(['resident', 'neighbor', 'volunteer', 'other'], {
      message: 'Reporter role must be "resident", "neighbor", "volunteer", or "other"',
    }),
    floodSeverity: z
      .number()
      .int()
      .min(0, { message: 'Flood severity must be between 0 and 3' })
      .max(3, { message: 'Flood severity must be between 0 and 3' }),
    peopleCount: z
      .number()
      .int()
      .min(1, { message: 'People count must be between 1 and 500' })
      .max(500, { message: 'People count must be between 1 and 500' })
      .nullable(),
    trapped: z.boolean().nullable(),
    medicalUrgent: z.boolean().nullable(),
    mobilityHelp: z.boolean().nullable(),
    lat: z
      .number()
      .min(24.6, { message: 'Latitude must be within Karachi bounds (24.6 to 25.3)' })
      .max(25.3, { message: 'Latitude must be within Karachi bounds (24.6 to 25.3)' })
      .nullable()
      .optional(),
    lng: z
      .number()
      .min(66.7, { message: 'Longitude must be within Karachi bounds (66.7 to 67.5)' })
      .max(67.5, { message: 'Longitude must be within Karachi bounds (66.7 to 67.5)' })
      .nullable()
      .optional(),
    description: z
      .string()
      .max(1000, { message: 'Description cannot exceed 1000 characters' })
      .nullable()
      .optional(),
    reporterName: z
      .string()
      .max(100, { message: 'Reporter name cannot exceed 100 characters' })
      .nullable()
      .optional(),
    reporterPhone: z
      .string()
      .max(25, { message: 'Phone number cannot exceed 25 characters' })
      .regex(/^[\d+\s\-()]{3,25}$/, { message: 'Phone number must contain only digits, spaces, dashes, or +' })
      .nullable()
      .optional()
      .or(z.literal('')),
    idempotencyKey: z
      .string()
      .max(64, { message: 'Idempotency key cannot exceed 64 characters' })
      .nullable()
      .optional(),
  })
  .strict();

export type EmergencyReportInput = z.infer<typeof emergencyReportSchema>;
