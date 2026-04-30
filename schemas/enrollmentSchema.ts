import { z } from 'zod';

export const enrollmentSchema = z.object({
  id: z.number().int().positive().optional(),
  year: z.number().int().min(1900).max(2100),
  total_enrolled: z.number().int().nonnegative(),
  class_name: z.string().min(1, 'Class name is required'),
  college_name: z.string().min(1, 'College name is required'),
  city_name: z.string().min(1, 'City name is required'),
});

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
