// Shared constants and enums (string-based for SQLite + PostgreSQL compatibility)

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const TOURNAMENT_TYPE = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
} as const;

export const TOURNAMENT_STATUS = {
  UPCOMING: 'UPCOMING',
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  LIVE: 'LIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const NOTIFICATION_TYPE = {
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  TOURNAMENT_REGISTERED: 'TOURNAMENT_REGISTERED',
  TOURNAMENT_STARTING: 'TOURNAMENT_STARTING',
  WINNER_ANNOUNCEMENT: 'WINNER_ANNOUNCEMENT',
  ROOM_PUBLISHED: 'ROOM_PUBLISHED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  PAYMENT_APPROVED: 'PAYMENT_APPROVED',
  PAYMENT_REJECTED: 'PAYMENT_REJECTED',
  TOURNAMENT_REG_APPROVED: 'TOURNAMENT_REG_APPROVED',
  TOURNAMENT_REG_REJECTED: 'TOURNAMENT_REG_REJECTED',
  GENERAL: 'GENERAL',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const REGISTRATION_STATUS = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CHECKED_IN: 'CHECKED_IN',
  ELIMINATED: 'ELIMINATED',
  WON: 'WON',
  DISQUALIFIED: 'DISQUALIFIED',
} as const;

export const PAYMENT_METHOD = {
  EASYPAISA: 'EASYPAISA',
} as const;

// Default EasyPaisa settings — used when SiteSetting table is empty
export const DEFAULT_EASYPAISA_NUMBER = '0312-4376721';
export const DEFAULT_EASYPAISA_ACCOUNT_NAME = 'Elite Gaming Hub';
export const DEFAULT_PAYMENT_INSTRUCTIONS =
  '1. Open your EasyPaisa app or dial *786#\n2. Send the exact amount to the EasyPaisa number above\n3. Note the Transaction ID from the confirmation SMS\n4. Take a clear screenshot of the confirmation\n5. Upload the screenshot and enter the Transaction ID below\n6. Submit — your order will be reviewed by admin within 1-24 hours';

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  PAID: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  PROCESSING: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  COMPLETED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  APPROVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CHECKED_IN: 'Checked In',
  ELIMINATED: 'Eliminated',
  WON: 'Won',
  DISQUALIFIED: 'Disqualified',
};

export const REGISTRATION_STATUS_COLORS: Record<string, string> = {
  PENDING_APPROVAL: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  APPROVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  REJECTED: 'bg-red-500/15 text-red-400 border-red-500/30',
  CHECKED_IN: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  ELIMINATED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  WON: 'bg-[#F5C518]/15 text-[#F5C518] border-[#F5C518]/30',
  DISQUALIFIED: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export const TOURNAMENT_TYPE_LABELS: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly Championship',
};

export const TOURNAMENT_TYPE_COLORS: Record<string, string> = {
  DAILY: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  WEEKLY: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  MONTHLY: 'bg-red-500/15 text-red-400 border-red-500/30',
};

/** Format a number as PKR (Pakistani Rupees). */
export function formatPKR(amount: number): string {
  const n = Number(amount) || 0;
  return `Rs. ${n.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EGH-${ts}-${rand}`;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
