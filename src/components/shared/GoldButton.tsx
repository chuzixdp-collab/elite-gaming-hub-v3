'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

type GoldVariant = 'gold' | 'red' | 'outline-gold';

interface GoldButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'variant'> {
  variant?: GoldVariant;
}

export const GoldButton = forwardRef<HTMLButtonElement, GoldButtonProps>(
  ({ className, variant = 'gold', children, ...props }, ref) => {
    const variants: Record<GoldVariant, string> = {
      gold:
        'bg-gradient-to-r from-[#F5C518] to-[#FFD700] text-black hover:from-[#FFD700] hover:to-[#F5C518] shadow-[0_0_20px_rgba(245,197,24,0.4)] hover:shadow-[0_0_30px_rgba(245,197,24,0.6)] font-semibold border-0',
      red:
        'bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white hover:from-[#EF4444] hover:to-[#DC2626] shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] font-semibold border-0',
      'outline-gold':
        'bg-transparent border-2 border-[#F5C518] text-[#F5C518] hover:bg-[#F5C518]/10 hover:text-[#FFD700] font-semibold',
    };
    return (
      <Button
        ref={ref}
        variant="default"
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
GoldButton.displayName = 'GoldButton';
