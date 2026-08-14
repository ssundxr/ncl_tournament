import { z } from "zod";

// ─── Registration Form ──────────────────────────────────────────────────────

export const registrationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),
  favorite_team: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(50, "Team name must be at most 50 characters")
    .trim(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .trim(),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .default(""),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// ─── Payment Submission ─────────────────────────────────────────────────────

export const paymentSubmissionSchema = z.object({
  enrollment_season_id: z.string().uuid("Invalid season ID"),
  enrollment_phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
  transaction_id: z
    .string()
    .min(8, "Transaction ID must be at least 8 characters")
    .max(30, "Transaction ID must be at most 30 characters")
    .trim(),
});

export type PaymentSubmissionData = z.infer<typeof paymentSubmissionSchema>;

// ─── Match Result ───────────────────────────────────────────────────────────

export const matchResultSchema = z.object({
  fixture_id: z.string().uuid("Invalid fixture ID"),
  home_score: z.number().int().min(0, "Score cannot be negative").max(99),
  away_score: z.number().int().min(0, "Score cannot be negative").max(99),
});

export type MatchResultData = z.infer<typeof matchResultSchema>;

// ─── Season Creation ────────────────────────────────────────────────────────

export const seasonCreationSchema = z.object({
  tournament_id: z.string().uuid("Invalid tournament ID"),
  name: z.string().min(1, "Season name is required").max(100).trim(),
  number: z.number().int().min(1),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  fee_amount: z.number().min(0).optional().default(30),
  enrollment_capacity: z.number().int().min(2).optional(),
  upi_id: z.string().optional(),
});

export type SeasonCreationData = z.infer<typeof seasonCreationSchema>;

// ─── Fixture Generation Config ──────────────────────────────────────────────

export const fixtureGenerationSchema = z.object({
  season_id: z.string().uuid("Invalid season ID"),
  group_size: z.number().int().min(3).max(8).default(5),
  seed: z.number().optional(),
});

export type FixtureGenerationData = z.infer<typeof fixtureGenerationSchema>;

// ─── Admin Enrollment Approval ──────────────────────────────────────────────

export const enrollmentApprovalSchema = z.object({
  season_id: z.string().uuid("Invalid season ID"),
  enrollment_ids: z
    .array(z.string())
    .min(1, "At least one enrollment must be selected"),
});

export type EnrollmentApprovalData = z.infer<typeof enrollmentApprovalSchema>;

export const enrollmentRejectionSchema = z.object({
  season_id: z.string().uuid("Invalid season ID"),
  phone: z.string(),
  reason: z.string().max(500).optional().default(""),
});

export type EnrollmentRejectionData = z.infer<typeof enrollmentRejectionSchema>;
