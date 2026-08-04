'use client';
import { useEffect, useState, useRef } from 'react';
import { useNavigation } from '@/store/navigation';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GoldButton } from '@/components/shared/GoldButton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, Tag, CheckCircle2, AlertCircle, CreditCard,
  Upload, Smartphone, Image as ImageIcon, Copy, X, Wallet as WalletIcon,
} from 'lucide-react';
import { formatPKR } from '@/lib/constants';

interface EasyPaisaSettings {
  easypaisaNumber: string;
  easypaisaAccountName: string;
  paymentInstructions: string;
}

export function CheckoutView() {
  const navigate = useNavigation((s) => s.navigate);
  const back = useNavigation((s) => s.back);
  const { product, setLastOrder } = useCart();
  const { user, hydrate, hydrated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<EasyPaisaSettings | null>(null);
  const [form, setForm] = useState({
    ffUid: user?.ffUid || '',
    ffNickname: user?.ffNickname || '',
    notes: '',
    couponCode: '',
  });
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(true); // auto-use wallet by default

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    fetch('/api/settings/payment')
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .catch(() => setSettings({ easypaisaNumber: '0312-4376721', easypaisaAccountName: 'Elite Gaming Hub', paymentInstructions: '' }));
  }, []);

  // Fetch user wallet balance
  useEffect(() => {
    if (user) {
      fetch('/api/wallet')
        .then((r) => r.json())
        .then((d) => setWalletBalance(d?.wallet?.balance ?? 0))
        .catch(() => setWalletBalance(0));
    }
  }, [user]);

  // Wallet deduction (only when user opts in AND has balance)
  const walletDiscount = useWallet && walletBalance > 0
    ? Math.min(walletBalance, Math.max(0, product ? product.price - discount : 0))
    : 0;
  const finalAmount = product
    ? Math.max(0, product.price - discount - walletDiscount)
    : 0;

  useEffect(() => {
    if (hydrated && !user) {
      toast.error('Please log in to checkout');
      navigate('login');
    }
  }, [hydrated, user, navigate]);

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <p className="text-white text-lg mb-4">No product selected for checkout.</p>
        <GoldButton onClick={() => navigate('store')}>Browse Store</GoldButton>
      </div>
    );
  }

  // (finalAmount computed above with wallet deduction)

  const applyCoupon = async () => {
    if (!form.couponCode) return;
    setApplyingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: form.couponCode, amount: product.price }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid coupon');
      setDiscount(data.discount);
      setCouponApplied(data.code);
      toast.success(`Coupon applied: -${formatPKR(data.discount)}`);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon');
      setDiscount(0);
      setCouponApplied(null);
      toast.error('Coupon invalid');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const copyEasyPaisa = () => {
    if (!settings) return;
    navigator.clipboard.writeText(settings.easypaisaNumber);
    toast.success('EasyPaisa number copied!');
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot must be smaller than 5 MB');
      return;
    }
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setScreenshotFile(null);
    setScreenshotPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{8,12}$/.test(form.ffUid)) {
      toast.error('Free Fire UID must be 8-12 digits');
      return;
    }
    if (!form.ffNickname || form.ffNickname.length < 2) {
      toast.error('In-game nickname is required');
      return;
    }
    if (!transactionId || transactionId.trim().length < 4) {
      toast.error('Please enter your EasyPaisa Transaction ID');
      return;
    }
    if (!screenshotFile) {
      toast.error('Please upload your payment screenshot');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('packageId', product.id);
      formData.append('transactionId', transactionId.trim());
      formData.append('paymentMethod', 'EASYPAISA');
      formData.append('notes', form.notes || '');
      formData.append('ffUid', form.ffUid);
      formData.append('ffNickname', form.ffNickname);
      formData.append('useWallet', useWallet ? 'true' : 'false');
      formData.append('screenshot', screenshotFile);

      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit payment');

      if (data.order?.id) {
        setLastOrder(data.order.id, data.order.orderNumber);
      } else if (data.payment?.id) {
        setLastOrder(data.payment.id, `PAY-${data.payment.transactionId}`);
      }

      toast.success('Payment submitted!', {
        description: 'Order is now pending admin review. You will be notified once approved.',
      });
      navigate('order-confirmation');
    } catch (err) {
      toast.error('Payment submission failed', { description: err instanceof Error ? err.message : 'Try again' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <button onClick={back} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Step 1: Free Fire Account */}
            <Card className="bg-[#141414] border-[#27272A] p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F5C518] text-black text-xs font-bold flex items-center justify-center">1</span>
                Free Fire Account Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ffUid" className="text-zinc-300">Free Fire UID *</Label>
                  <Input
                    id="ffUid"
                    required
                    pattern="\d{8,12}"
                    value={form.ffUid}
                    onChange={(e) => setForm({ ...form, ffUid: e.target.value.replace(/\D/g, '') })}
                    className="bg-black border-[#27272A] text-white"
                    placeholder="1234567890"
                    maxLength={12}
                  />
                  <p className="text-xs text-zinc-500">8-12 digit UID from your Free Fire profile</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ffNickname" className="text-zinc-300">In-Game Nickname *</Label>
                  <Input
                    id="ffNickname"
                    required
                    minLength={2}
                    value={form.ffNickname}
                    onChange={(e) => setForm({ ...form, ffNickname: e.target.value })}
                    className="bg-black border-[#27272A] text-white"
                    placeholder="ProGamer2026"
                  />
                </div>
              </div>
            </Card>

            {/* Step 2: EasyPaisa Payment Instructions */}
            <Card className="bg-[#141414] border-[#F5C518]/30 p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F5C518] text-black text-xs font-bold flex items-center justify-center">2</span>
                Pay via EasyPaisa
              </h2>

              {/* EasyPaisa number */}
              <div className="p-4 bg-gradient-to-br from-[#F5C518]/15 to-[#DC2626]/10 border border-[#F5C518]/40 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-5 h-5 text-[#F5C518]" />
                  <div>
                    <div className="text-xs text-zinc-400">EasyPaisa Number</div>
                    <div className="text-2xl font-bold text-white tracking-wider">{settings?.easypaisaNumber || '0312-4376721'}</div>
                    <div className="text-xs text-zinc-400">Account: {settings?.easypaisaAccountName || 'Elite Gaming Hub'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={copyEasyPaisa}
                    className="ml-auto p-2 bg-black/40 hover:bg-black/60 rounded-lg text-[#F5C518] transition-colors"
                    title="Copy number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-[#F5C518] font-semibold mt-2">
                  Send exactly: {formatPKR(finalAmount)}
                </div>
              </div>

              {/* Instructions */}
              {settings?.paymentInstructions && (
                <div className="p-3 bg-black/40 border border-[#27272A] rounded-lg">
                  <div className="text-xs text-zinc-500 mb-2 font-semibold">Payment Instructions:</div>
                  <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">{settings.paymentInstructions}</pre>
                </div>
              )}
            </Card>

            {/* Step 3: Payment Proof */}
            <Card className="bg-[#141414] border-[#27272A] p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F5C518] text-black text-xs font-bold flex items-center justify-center">3</span>
                Submit Payment Proof
              </h2>

              <div className="space-y-2">
                <Label htmlFor="tid" className="text-zinc-300">EasyPaisa Transaction ID *</Label>
                <Input
                  id="tid"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="bg-black border-[#27272A] text-white font-mono"
                  placeholder="e.g. 12345678901"
                  maxLength={60}
                />
                <p className="text-xs text-zinc-500">Enter the Transaction ID from your EasyPaisa confirmation SMS/app</p>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Payment Screenshot * <span className="text-zinc-500">(JPEG/PNG/WebP, max 5MB)</span></Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onFileChange}
                  className="hidden"
                  id="screenshot-upload"
                />
                {!screenshotPreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-[#27272A] hover:border-[#F5C518]/50 rounded-lg transition-colors flex flex-col items-center gap-2 text-zinc-400 hover:text-[#F5C518]"
                  >
                    <Upload className="w-8 h-8" />
                    <div className="text-sm font-semibold">Click to upload screenshot</div>
                    <div className="text-xs text-zinc-500">JPEG, PNG, or WebP — max 5 MB</div>
                  </button>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-[#27272A] bg-black">
                    { }
                    <img src={screenshotPreview} alt="Payment screenshot preview" className="w-full max-h-72 object-contain" />
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white rounded-full p-1.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {screenshotFile?.name}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Step 4: Coupon & Notes */}
            <Card className="bg-[#141414] border-[#27272A] p-6 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F5C518] text-black text-xs font-bold flex items-center justify-center">4</span>
                Coupon & Notes
              </h2>
              <div className="space-y-2">
                <Label htmlFor="coupon" className="text-zinc-300">Coupon Code (optional)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      id="coupon"
                      value={form.couponCode}
                      onChange={(e) => {
                        setForm({ ...form, couponCode: e.target.value.toUpperCase() });
                        setCouponApplied(null);
                        setDiscount(0);
                        setCouponError(null);
                      }}
                      className="bg-black border-[#27272A] text-white pl-10 uppercase"
                      placeholder="WELCOME10"
                    />
                  </div>
                  <GoldButton type="button" variant="outline-gold" onClick={applyCoupon} disabled={applyingCoupon || !form.couponCode}>
                    {applyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </GoldButton>
                </div>
                {couponError && <p className="text-xs text-red-400">{couponError}</p>}
                {couponApplied && <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Coupon &ldquo;{couponApplied}&rdquo; applied!</p>}
                <p className="text-xs text-zinc-500">Try: WELCOME10 (10% off, max Rs. 200) or SAVE50 (Rs. 50 off orders above Rs. 500)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-zinc-300">Order Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="bg-black border-[#27272A] text-white min-h-[80px]"
                  placeholder="Any special instructions..."
                  maxLength={500}
                />
              </div>
            </Card>

            <GoldButton type="submit" disabled={submitting} size="lg" className="w-full">
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Payment...</> : <><CreditCard className="w-5 h-5" /> Submit Payment — {formatPKR(finalAmount)}</>}
            </GoldButton>
          </form>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-[#141414] border-[#27272A] p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
              <div className="flex gap-4 mb-4">
                { }
                <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-lg object-contain bg-black" />
                <div className="flex-1">
                  <div className="text-white font-semibold">{product.name}</div>
                  {product.diamonds != null && (
                    <div className="text-zinc-400 text-sm">
                      {product.diamonds} diamonds
                      {product.bonusDiamonds != null && product.bonusDiamonds > 0 && <span className="text-[#F5C518]"> + {product.bonusDiamonds} bonus</span>}
                    </div>
                  )}
                  <div className="text-[#F5C518] font-bold mt-1">{formatPKR(product.price)}</div>
                </div>
              </div>

              <div className="space-y-2 py-4 border-t border-[#27272A]">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">{formatPKR(product.price)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">Coupon Discount</span>
                    <span className="text-emerald-400">-{formatPKR(discount)}</span>
                  </div>
                )}
                {walletDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <WalletIcon className="w-3 h-3" /> Wallet
                    </span>
                    <span className="text-emerald-400">-{formatPKR(walletDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Payment fee</span>
                  <span className="text-white">{formatPKR(0)}</span>
                </div>
              </div>

              {/* Wallet toggle */}
              {walletBalance > 0 && (
                <label className="flex items-center gap-2 p-3 mb-3 bg-[#F5C518]/5 border border-[#F5C518]/30 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(e) => setUseWallet(e.target.checked)}
                    className="w-4 h-4 accent-[#F5C518]"
                  />
                  <div className="flex-1 text-sm">
                    <div className="text-white font-medium flex items-center gap-1">
                      <WalletIcon className="w-3 h-3 text-[#F5C518]" />
                      Use wallet balance
                    </div>
                    <div className="text-zinc-400 text-xs">
                      Available: {formatPKR(walletBalance)} • Applied: {formatPKR(walletDiscount)}
                    </div>
                  </div>
                </label>
              )}

              <div className="flex justify-between items-baseline pt-4 border-t border-[#27272A]">
                <span className="text-white font-semibold">Total</span>
                <span className="text-2xl font-bold text-[#F5C518]">{formatPKR(finalAmount)}</span>
              </div>

              <div className="mt-6 p-3 bg-black/50 border border-[#27272A] rounded-lg">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Diamonds delivered after admin approval
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Secure EasyPaisa payment
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  24/7 customer support
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
