// Zod validation schemas for all API inputs
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address').max(254);
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128);
export const nameSchema = z.string().min(2, 'Name is too short').max(80);
export const ffUidSchema = z.string().regex(/^\d{8,12}$/, 'Free Fire UID must be 8-12 digits');
export const ffNicknameSchema = z.string().min(2, 'Nickname is too short').max(40);

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  referralCode: z.string().min(4).max(20).optional().or(z.literal('').transform(() => undefined)),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
  remember: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});

export const createOrderSchema = z.object({
  productId: z.string().min(1),
  ffUid: ffUidSchema,
  ffNickname: ffNicknameSchema,
  paymentMethod: z.string().min(1),
  notes: z.string().max(500).optional().nullable(),
  couponCode: z.string().max(40).optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED']),
});

export const tournamentRegisterSchema = z.object({
  ffUid: ffUidSchema,
  ffNickname: ffNicknameSchema,
  isSolo: z.boolean(),
  teamName: z.string().max(60).optional().nullable(),
  // EasyPaisa payment fields (required when tournament has entryFee > 0)
  transactionId: z.string().min(4, 'Transaction ID is required').max(60).optional(),
  // screenshot is validated separately (multipart upload)
});

export const paymentSubmitSchema = z.object({
  packageId: z.string().min(1).optional().nullable(),
  tournamentId: z.string().min(1).optional().nullable(),
  orderId: z.string().min(1).optional().nullable(),
  transactionId: z.string().min(4, 'Transaction ID must be at least 4 characters').max(60),
  paymentMethod: z.string().min(1).default('EASYPAISA'),
  notes: z.string().max(500).optional().nullable(),
  // ffUid / ffNickname for tournament registration payments
  ffUid: ffUidSchema.optional().nullable(),
  ffNickname: ffNicknameSchema.optional().nullable(),
  isSolo: z.boolean().optional(),
  teamName: z.string().max(60).optional().nullable(),
  useWallet: z.boolean().optional().default(false),
}).refine(
  (d) => !!d.packageId || !!d.tournamentId,
  { message: 'Either packageId or tournamentId is required' }
);

export const adminRejectPaymentSchema = z.object({
  reason: z.string().min(2, 'Reason is required').max(500),
});

export const adminApprovePaymentSchema = z.object({
  remark: z.string().max(500).optional().nullable(),
});

export const tournamentCreateSchema = z.object({
  title: z.string().min(3).max(120),
  type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  bannerUrl: z.string().url().or(z.string().min(1)),
  description: z.string().max(2000).optional().nullable(),
  startDateTime: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
  endDateTime: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date').optional().nullable(),
  entryFee: z.number().min(0),
  prizePool: z.number().min(0),
  totalSlots: z.number().int().min(2).max(10000),
});

export const tournamentUpdateSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(2000).optional().nullable(),
  startDateTime: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date').optional(),
  endDateTime: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date').optional().nullable(),
  entryFee: z.number().min(0).optional(),
  prizePool: z.number().min(0).optional(),
  totalSlots: z.number().int().min(2).max(10000).optional(),
  status: z.enum(['UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'LIVE', 'COMPLETED', 'CANCELLED']).optional(),
  roomId: z.string().max(50).optional().nullable(),
  roomPassword: z.string().max(50).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const productCreateSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).optional().nullable(),
  category: z.enum(['DIAMONDS', 'WEEKLY_MEMBERSHIP', 'MONTHLY_MEMBERSHIP']),
  diamonds: z.number().int().min(0).optional().nullable(),
  bonusDiamonds: z.number().int().min(0).optional().default(0),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional().nullable(),
  imageUrl: z.string().min(1),
  sortOrder: z.number().int().optional().default(0),
});

export const productUpdateSchema = productCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const couponCreateSchema = z.object({
  code: z.string().min(3).max(40).regex(/^[A-Z0-9_-]+$/i, 'Code must be alphanumeric'),
  description: z.string().max(500).optional().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().min(0),
  minAmount: z.number().min(0).optional().default(0),
  maxDiscount: z.number().min(0).optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  expiresAt: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date').optional().nullable(),
});

export const couponValidateSchema = z.object({
  code: z.string().min(3).max(40),
  amount: z.number().min(0),
});

export const notificationCreateSchema = z.object({
  type: z.enum(['ORDER_CONFIRMED', 'ORDER_COMPLETED', 'TOURNAMENT_REGISTERED', 'TOURNAMENT_STARTING', 'WINNER_ANNOUNCEMENT', 'ROOM_PUBLISHED', 'GENERAL']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  userId: z.string().optional().nullable(), // null = global
});

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(2).max(200),
  message: z.string().min(5).max(5000),
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  ffUid: ffUidSchema.optional().nullable(),
  ffNickname: ffNicknameSchema.optional().nullable(),
  avatarUrl: z.string().max(2000).optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const rewardUpdateSchema = z.object({
  rewards: z.array(z.object({
    position: z.number().int().min(1).max(10),
    prizeAmount: z.number().min(0),
    prizeDescription: z.string().max(500).optional().nullable(),
  })),
});

export const siteSettingSchema = z.object({
  key: z.string().min(1).max(80),
  value: z.string().max(5000),
});

export function parseInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const firstError = result.error.issues[0];
  return { success: false, error: firstError?.message || 'Invalid input' };
}
