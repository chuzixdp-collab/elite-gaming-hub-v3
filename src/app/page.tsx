'use client';
import { useEffect } from 'react';
import { useNavigation, ViewName } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LandingView } from '@/components/views/LandingView';
import { LoginView } from '@/components/views/LoginView';
import { SignupView } from '@/components/views/SignupView';
import { ForgotPasswordView } from '@/components/views/ForgotPasswordView';
import { StoreView } from '@/components/views/StoreView';
import { CheckoutView } from '@/components/views/CheckoutView';
import { OrderConfirmationView } from '@/components/views/OrderConfirmationView';
import { TournamentsView } from '@/components/views/TournamentsView';
import { TournamentDetailView } from '@/components/views/TournamentDetailView';
import { DashboardView } from '@/components/views/DashboardView';
import { ProfileView } from '@/components/views/ProfileView';
import { OrderHistoryView } from '@/components/views/OrderHistoryView';
import { NotificationsView } from '@/components/views/NotificationsView';
import { AdminDashboardView } from '@/components/views/AdminDashboardView';
import { AdminUsersView } from '@/components/views/AdminUsersView';
import { AdminOrdersView } from '@/components/views/AdminOrdersView';
import { AdminPaymentsView } from '@/components/views/AdminPaymentsView';
import { AdminProductsView } from '@/components/views/AdminProductsView';
import { AdminTournamentsView } from '@/components/views/AdminTournamentsView';
import { AdminResultsView } from '@/components/views/AdminResultsView';
import { AdminNotificationsView } from '@/components/views/AdminNotificationsView';
import { AdminCouponsView } from '@/components/views/AdminCouponsView';
import { AdminSettingsView } from '@/components/views/AdminSettingsView';
import { WalletView } from '@/components/views/WalletView';
import { ReferralView } from '@/components/views/ReferralView';
import { PrizeClaimsView } from '@/components/views/PrizeClaimsView';
import { AdminWalletView } from '@/components/views/AdminWalletView';
import { AdminPrizeClaimsView } from '@/components/views/AdminPrizeClaimsView';
import { AdminReferralsView } from '@/components/views/AdminReferralsView';
import { PrivacyPolicyView } from '@/components/views/PrivacyPolicyView';
import { TermsConditionsView } from '@/components/views/TermsConditionsView';
import { RefundPolicyView } from '@/components/views/RefundPolicyView';
import { ContactUsView } from '@/components/views/ContactUsView';

const VIEWS: Record<ViewName, React.ComponentType> = {
  landing: LandingView,
  login: LoginView,
  signup: SignupView,
  'forgot-password': ForgotPasswordView,
  store: StoreView,
  checkout: CheckoutView,
  'order-confirmation': OrderConfirmationView,
  tournaments: TournamentsView,
  'tournament-detail': TournamentDetailView,
  dashboard: DashboardView,
  profile: ProfileView,
  orders: OrderHistoryView,
  notifications: NotificationsView,
  wallet: WalletView,
  referral: ReferralView,
  'prize-claims': PrizeClaimsView,
  'admin-dashboard': AdminDashboardView,
  'admin-users': AdminUsersView,
  'admin-orders': AdminOrdersView,
  'admin-payments': AdminPaymentsView,
  'admin-products': AdminProductsView,
  'admin-tournaments': AdminTournamentsView,
  'admin-results': AdminResultsView,
  'admin-notifications': AdminNotificationsView,
  'admin-coupons': AdminCouponsView,
  'admin-settings': AdminSettingsView,
  'admin-wallet': AdminWalletView,
  'admin-prize-claims': AdminPrizeClaimsView,
  'admin-referrals': AdminReferralsView,
  'privacy-policy': PrivacyPolicyView,
  'terms-conditions': TermsConditionsView,
  'refund-policy': RefundPolicyView,
  'contact-us': ContactUsView,
};

// Views that should hide the footer (auth, checkout, admin, dashboard)
const HIDE_FOOTER_VIEWS: ViewName[] = [
  'login', 'signup', 'forgot-password',
  'checkout', 'order-confirmation',
  'dashboard', 'profile', 'orders', 'notifications',
  'wallet', 'referral', 'prize-claims',
  'admin-dashboard', 'admin-users', 'admin-orders', 'admin-payments',
  'admin-products', 'admin-tournaments', 'admin-results',
  'admin-notifications', 'admin-coupons', 'admin-settings',
  'admin-wallet', 'admin-prize-claims', 'admin-referrals',
];

// Views that hide the navbar (full-screen views like auth)
const HIDE_NAVBAR_VIEWS: ViewName[] = [];

export default function Home() {
  const view = useNavigation((s) => s.view);
  const params = useNavigation((s) => s.params);
  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Handle scrollTo param
    if (params.scrollTo && view === 'landing') {
      setTimeout(() => {
        const el = document.getElementById(params.scrollTo as string);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [params, view]);

  const CurrentView = VIEWS[view] || LandingView;
  const showFooter = !HIDE_FOOTER_VIEWS.includes(view);
  const showNavbar = !HIDE_NAVBAR_VIEWS.includes(view);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      {showNavbar && <Navbar />}
      <div className="flex-1">
        <CurrentView />
      </div>
      {showFooter && <Footer />}
    </div>
  );
}
