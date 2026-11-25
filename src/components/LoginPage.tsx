import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  Upload,
  Check,
  User,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LightEnterpriseBackground } from './auth/LightEnterpriseBackground';
import { customerLogin, customerRegister } from '../services/authService';
import { AuthLoader } from './auth/AuthLoader';
import { AuthBackdrop } from './auth/AuthBackdrop';
import { LANDING_URL } from '../config/links';
import { PhoneConversation } from './auth/PhoneConversation';

export interface UserProfileData {
  country?: string;
  city?: string;
  pincode?: string;
  mailingAddress?: string;
  entityType?: 'Organization' | 'Individual';
  organizationName?: string;
  aboutWork?: string;
  cin?: string;
  gstNumber?: string;
  idFileName?: string;
}

interface LoginPageProps {
  onLoginSuccess: (
    username?: string,
    profileData?: UserProfileData,
    redirectTo?: string
  ) => void;
}

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Germany',
  'United Arab Emirates',
  'Singapore',
  'Australia',
  'Canada',
  'Japan',
  'France',
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  India: ['New Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Gurugram', 'Noida', 'Chandigarh'],
  'United States': ['New York', 'San Francisco', 'Seattle', 'Chicago', 'Austin', 'Los Angeles', 'Boston', 'Denver', 'Columbus'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol', 'Cambridge'],
  Germany: ['Munich', 'Frankfurt', 'Berlin', 'Hamburg', 'Stuttgart', 'Cologne'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
  Singapore: ['Singapore City', 'Jurong', 'Changi'],
  Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
  Canada: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa', 'Calgary'],
  Japan: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya'],
  France: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
};

interface AuthFieldProps {
  id: string;
  label: string;
  icon: React.ElementType;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  trailing?: React.ReactNode;
  labelAside?: React.ReactNode;
  hint?: React.ReactNode;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

const AuthField: React.FC<AuthFieldProps> = ({
  id,
  label,
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  trailing,
  labelAside,
  hint,
  minLength,
  maxLength,
  pattern,
}) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between">
      <label htmlFor={id} className="text-[13px] font-semibold text-[#0F172A]">{label}</label>
      {labelAside}
    </div>
    <div className="group flex h-12 [@media(max-height:820px)]:h-11 items-center gap-2.5 rounded-xl border border-white/70 bg-white/45 px-3.5 backdrop-blur-md transition-all duration-150 hover:border-white focus-within:border-[#2563EB] focus-within:bg-white/80 focus-within:ring-4 focus-within:ring-blue-500/10">
      <Icon className="h-[18px] w-[18px] shrink-0 text-slate-400 transition-colors group-focus-within:text-[#2563EB]" />
      <input
        id={id}
        type={type}
        required
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-full w-full min-w-0 border-0 bg-transparent text-sm text-[#0F172A] outline-none ring-0 placeholder:text-[#94A3B8]"
      />
      {trailing}
    </div>
    {hint}
  </div>
);

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('vb@gmail.com');
  const [password, setPassword] = useState('Password');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>(() =>
    typeof window !== 'undefined' && window.location.pathname === '/signup' ? 'signup' : 'login'
  );
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupContact, setSignupContact] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const switchAuthMode = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setErrorMessage('');
    setInfoNotice(null);
  };

  const initialStepParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('step') : null;
  const initialPhase = (initialStepParam === '1' || initialStepParam === '2') ? 'onboarding' : 'form';
  const initialStep = initialStepParam === '2' ? 2 : 1;

  const [phase, setPhase] = useState<
    'form' | 'form-fading-out' | 'welcome' | 'welcome-fading-out' | 'onboarding' | 'onboarding-fading-out'
  >(initialPhase);

  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(initialStep);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (phase === 'onboarding') {
      try {
        window.history.replaceState(null, '', `/login?step=${onboardingStep}`);
      } catch { }
    } else if (phase === 'form') {
      try {
        const target = authMode === 'signup' ? '/signup' : '/login';
        if (window.location.pathname !== target || window.location.search) {
          window.history.replaceState(null, '', target);
        }
      } catch { }
    }
  }, [phase, onboardingStep, authMode]);

  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');

  const [entityType, setEntityType] = useState<'Organization' | 'Individual'>('Organization');
  const [organizationName, setOrganizationName] = useState('');
  const [aboutWork, setAboutWork] = useState('');
  const [cin, setCin] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [idFileName, setIdFileName] = useState('');

  const [authenticatedUser, setAuthenticatedUser] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startLoginSequence = (
    userName: string,
    redirectTo: string
  ) => {
    setErrorMessage('');
    setInfoNotice(null);

    setPhase('form-fading-out');

    setTimeout(() => {
      setPhase('welcome');
      setProgressPercent(0);

      requestAnimationFrame(() => {
        setWelcomeVisible(true);
      });

      const duration = 2000;
      const startTime = performance.now();

      const animateProgress = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(100, (elapsed / duration) * 100);

        const eased = 100 * Math.sin((progress / 100) * (Math.PI / 2));

        setProgressPercent(Math.min(100, Math.max(eased, progress)));

        if (elapsed < duration) {
          requestAnimationFrame(animateProgress);
        } else {
          setTimeout(() => {
            setWelcomeVisible(false);
            setPhase('welcome-fading-out');

            setTimeout(() => {
              onLoginSuccess(userName, undefined, redirectTo);
            }, 300);
          }, 180);
        }
      };

      requestAnimationFrame(animateProgress);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setErrorMessage('');
    setInfoNotice(null);
    setIsSubmitting(true);

    try {
      const response = await customerLogin({
        email: email.trim(),
        password: password,
      });

      localStorage.setItem('auth_token', response.access_token);
      setAuthenticatedUser(response.user.name);

      startLoginSequence(
        response.user.name,
        response.redirect_to
      );
    } catch (error: any) {
      console.error('Login error:', error);

      setErrorMessage(
        error.response?.data?.detail ||
        'Unable to login. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setInfoNotice(`Password recovery instructions dispatched to ${email || 'your registered work email'}.`);
    setErrorMessage('');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');
    setInfoNotice(null);

    const name = signupName.trim();
    const mail = signupEmail.trim().toLowerCase();
    const contact = signupContact.trim();

    if (name.length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!/^\+?[0-9]{10,15}$/.test(contact)) {
      setErrorMessage('Please enter a valid contact number (10 to 15 digits).');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await customerRegister({ name, email: mail, contact });

      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        const displayName = response.user?.name || name;
        setAuthenticatedUser(displayName);
        setIsNewUser(true);
        startLoginSequence(displayName, response.redirect_to || '/dashboard');
      } else {
        setEmail(mail);
        setPassword('');
        setSignupName('');
        setSignupEmail('');
        setSignupContact('');
        setAuthMode('login');
        setInfoNotice(
          response.message ||
          'Signup successful! Check your email for verification link.'
        );
      }
    } catch (error: any) {
      const statusCode = error?.response?.status;
      if (statusCode === 404 || statusCode === 405) {
        console.warn('Sign-up endpoint POST /api/v1/auth/customer/register is not available on the backend yet.');
        setErrorMessage('Sign-up isn’t available yet. Please contact your PseudoTeam administrator.');
      } else {
        const detail = error?.response?.data?.detail;
        setErrorMessage(
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail.map((d: any) => d?.msg || String(d)).join(', ')
              : typeof detail === 'object' && detail !== null
                ? Object.values(detail).flat().join(', ')
                : 'Unable to create your account. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextToStep2 = () => {
    setSlideDirection(1);
    setOnboardingStep(2);
  };

  const handleSkip = () => {
    setPhase('onboarding-fading-out');
    setTimeout(() => {
      onLoginSuccess(authenticatedUser);
    }, 300);
  };

  const handlePrevToStep1 = () => {
    setSlideDirection(-1);
    setOnboardingStep(1);
  };

  const handleSubmitProfile = () => {
    setPhase('onboarding-fading-out');
    const profilePayload: UserProfileData = {
      country: country || undefined,
      city: city || undefined,
      pincode: pincode || undefined,
      mailingAddress: mailingAddress || undefined,
      entityType,
      organizationName: entityType === 'Organization' ? organizationName || undefined : undefined,
      aboutWork: aboutWork || undefined,
      cin: entityType === 'Organization' ? cin || undefined : undefined,
      gstNumber: entityType === 'Organization' ? gstNumber || undefined : undefined,
      idFileName: entityType === 'Individual' ? idFileName || undefined : undefined,
    };
    setTimeout(() => {
      onLoginSuccess(authenticatedUser, profilePayload);
    }, 300);
  };

  const availableCities = country && CITIES_BY_COUNTRY[country]
    ? CITIES_BY_COUNTRY[country]
    : [
      'New Delhi', 'Mumbai', 'Bengaluru', 'New York', 'San Francisco',
      'London', 'Munich', 'Dubai', 'Singapore', 'Sydney', 'Tokyo'
    ];

  const formAreaRef = useRef<HTMLElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const [formFit, setFormFit] = useState(1);
  const [formNaturalH, setFormNaturalH] = useState(0);
  useLayoutEffect(() => {
    const area = formAreaRef.current;
    const card = formCardRef.current;
    if (!area || !card) return;
    const measure = () => {
      const available = area.clientHeight - 8;
      const natural = card.offsetHeight;
      if (!natural) return;
      const next = Math.round(Math.min(1, Math.max(0.6, available / natural)) * 1000) / 1000;
      setFormNaturalH((prev) => (Math.abs(prev - natural) < 1 ? prev : natural));
      setFormFit((prev) => (Math.abs(prev - next) < 0.005 ? prev : next));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => window.requestAnimationFrame(measure));
    ro.observe(area);
    ro.observe(card);
    return () => ro.disconnect();
  }, [phase, authMode]);

  const isFormPhase = phase === 'form' || phase === 'form-fading-out';
  const isLoaderPhase = phase === 'welcome' || phase === 'welcome-fading-out';

  if (isLoaderPhase) {
    return (
      <div
        id="pseudoteam-login-screen"
        className="auth-font fixed inset-0 flex min-h-screen w-full items-center justify-center overflow-y-auto p-6"
      >
        <AuthBackdrop />
        <AuthLoader
          userName={authenticatedUser}
          progress={progressPercent}
          visible={welcomeVisible}
          isNewUser={isNewUser}
        />
      </div>
    );
  }

  if (isFormPhase) {
    const isSignup = authMode === 'signup';

    return (
      <div
        id="pseudoteam-login-screen"
        className="auth-font fixed inset-0 h-dvh w-full overflow-hidden text-[#0F172A]"
      >
        <AuthBackdrop />
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-[70%] -translate-y-[60%] rounded-full bg-gradient-to-br from-sky-400/45 to-blue-600/40 blur-3xl sm:h-[420px] sm:w-[420px] lg:left-3/4" />
          <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-[30%] -translate-y-[5%] rounded-full bg-gradient-to-br from-indigo-400/40 to-fuchsia-400/30 blur-3xl sm:h-[360px] sm:w-[360px] sm:-translate-x-[10%] lg:left-3/4" />
        </div>

        <a
          id="link-back-to-home"
          href={LANDING_URL}
          className="group absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-[0_6px_18px_rgba(30,64,175,0.12)] backdrop-blur-md transition-colors hover:border-blue-300 hover:text-blue-700 sm:left-6 sm:top-6 sm:text-[13px] lg:left-auto lg:right-10"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </a>

        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1400px] grid-cols-1 items-center gap-6 px-3 pb-3 pt-14 sm:px-6 sm:pb-5 sm:pt-16 lg:grid-cols-2 lg:gap-10 lg:px-10">
          <section className="relative hidden h-full min-h-0 lg:block">
            <PhoneConversation />
          </section>

          <main ref={formAreaRef} className="relative flex h-full min-h-0 w-full items-center justify-center">
            <div
              className="relative flex w-full max-w-[440px] items-start justify-center"
              style={{ height: formFit < 1 ? formNaturalH * formFit : undefined }}
            >
              <div
                id="login-form-wrapper"
                ref={formCardRef}
                className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-white/50 via-white/25 to-white/10 p-6 shadow-[0_30px_70px_rgba(30,64,175,0.18),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(255,255,255,0.25)] backdrop-blur-2xl backdrop-saturate-150 sm:p-9 [@media(max-height:820px)]:sm:p-7"
                style={{
                  opacity: phase === 'form-fading-out' ? 0 : 1,
                  transform: `scale(${formFit})${phase === 'form-fading-out' ? ' translateY(6px) scale(0.98)' : ''}`,
                  transformOrigin: 'top center',
                  transition: phase === 'form-fading-out' ? 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)' : 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: phase === 'form-fading-out' ? 'none' : 'auto',
                }}
              >
                <div className="mb-7 flex justify-center [@media(max-height:820px)]:mb-4">
                  <span className="inline-flex items-center rounded-2xl bg-gradient-to-br from-[#0B1736] to-[#1E3A8A] px-3 py-1 shadow-[0_8px_20px_rgba(11,23,54,0.28)] ring-1 ring-white/10">
                    <img
                      id="pseudoteam-logo"
                      src="/pseudoteam-logo.png"
                      alt="PseudoTeam"
                      className="h-12 w-auto max-w-[170px] object-contain select-none [@media(max-height:820px)]:h-10"
                      referrerPolicy="no-referrer"
                    />
                  </span>
                </div>

                <div
                  role="tablist"
                  aria-label="Choose sign in or create account"
                  className="relative mb-7 grid grid-cols-2 rounded-xl border border-white/50 bg-white/30 p-1 text-sm font-semibold backdrop-blur-md [@media(max-height:820px)]:mb-4"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-[0_1px_3px_rgba(15,23,42,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ transform: isSignup ? 'translateX(100%)' : 'translateX(0)' }}
                  />
                  {(['login', 'signup'] as const).map((mode) => (
                    <button
                      key={mode}
                      id={mode === 'login' ? 'auth-tab-login' : 'auth-tab-signup'}
                      role="tab"
                      type="button"
                      aria-selected={authMode === mode}
                      onClick={() => switchAuthMode(mode)}
                      className={`relative z-10 h-10 rounded-lg transition-colors duration-300 cursor-pointer ${
                        authMode === mode ? 'text-[#0F172A]' : 'text-slate-500 hover:text-[#0F172A]'
                      }`}
                    >
                      {mode === 'login' ? 'Sign in' : 'Create account'}
                    </button>
                  ))}
                </div>

                <div className="mb-6 grid [@media(max-height:820px)]:mb-4">
                  {([
                    ['login', 'Welcome back', 'Sign in to continue to your PseudoTeam workspace.'],
                    ['signup', 'Create your account', 'We’ll email a verification link to set your password.'],
                  ] as const).map(([mode, title, sub]) => {
                    const active = (mode === 'signup') === isSignup;
                    return (
                      <div
                        key={mode}
                        aria-hidden={!active}
                        className={`[grid-area:1/1] transition-all duration-300 ease-out ${
                          active ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
                        }`}
                      >
                        {active ? (
                          <h1 className="auth-display text-[30px] font-bold leading-tight text-[#0B1736] [@media(max-height:820px)]:text-[26px]">{title}</h1>
                        ) : (
                          <div className="auth-display text-[30px] font-bold leading-tight text-[#0B1736] [@media(max-height:820px)]:text-[26px]">{title}</div>
                        )}
                        <p className="mt-1.5 text-sm text-[#64748B]">{sub}</p>
                      </div>
                    );
                  })}
                </div>

                {errorMessage && (
                  <div
                    id="login-error-message"
                    role="alert"
                    className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-700"
                  >
                    <AlertCircle className="mt-px h-4 w-4 shrink-0 text-rose-600" />
                    <span className="font-medium leading-snug">{errorMessage}</span>
                  </div>
                )}
                {infoNotice && (
                  <div
                    id="login-info-notice"
                    className="mb-5 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-[13px] text-blue-800"
                  >
                    <ShieldCheck className="mt-px h-4 w-4 shrink-0 text-[#2563EB]" />
                    <span className="font-medium leading-snug">{infoNotice}</span>
                  </div>
                )}

                <div className="grid">
                  <form
                    id="signup-form"
                    onSubmit={handleSignup}
                    className={`space-y-4 [@media(max-height:820px)]:space-y-3 [grid-area:1/1] transition-all duration-300 ease-out ${isSignup ? 'visible translate-y-0 opacity-100 delay-75' : 'invisible translate-y-2 opacity-0'}`}
                    aria-hidden={!isSignup}
                    inert={!isSignup}
                    noValidate={false}
                  >
                    <AuthField
                      id="signup-name"
                      label="Full name"
                      icon={User}
                      type="text"
                      value={signupName}
                      onChange={setSignupName}
                      placeholder="Jane Doe"
                      autoComplete="name"
                      minLength={2}
                    />
                    <AuthField
                      id="signup-email"
                      label="Work email"
                      icon={Mail}
                      type="email"
                      value={signupEmail}
                      onChange={setSignupEmail}
                      placeholder="you@company.com"
                      autoComplete="email"
                    />
                    <AuthField
                      id="signup-contact"
                      label="Contact number"
                      icon={Phone}
                      type="tel"
                      value={signupContact}
                      onChange={setSignupContact}
                      placeholder="+919876543210"
                      autoComplete="tel"
                      minLength={10}
                      maxLength={15}
                      pattern="^\+?[0-9]{10,15}$"
                    />

                    <button
                      id="signup-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] transition-all duration-150 hover:shadow-[0_10px_24px_rgba(37,99,235,0.36)] hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                    >
                      <span>{isSubmitting ? 'Sending verification…' : 'Create account'}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </form>

                  <form
                    id="login-form"
                    onSubmit={handleSubmit}
                    className={`space-y-4 [@media(max-height:820px)]:space-y-3 [grid-area:1/1] transition-all duration-300 ease-out ${isSignup ? 'invisible translate-y-2 opacity-0' : 'visible translate-y-0 opacity-100 delay-75'}`}
                    aria-hidden={isSignup}
                    inert={isSignup}
                  >
                    <AuthField
                      id="login-email"
                      label="Work email"
                      icon={Mail}
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="you@company.com"
                      autoComplete="email"
                    />
                    <AuthField
                      id="login-password"
                      label="Password"
                      icon={Lock}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={setPassword}
                      placeholder="Your password"
                      autoComplete="current-password"
                      labelAside={
                        <button
                          id="forgot-password-link"
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-[13px] font-semibold text-[#2563EB] transition-colors hover:text-blue-700 cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      }
                      trailing={
                        <button
                          id="toggle-password-visibility-btn"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:text-[#2563EB] cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />

                    <button
                      id="login-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] transition-all duration-150 hover:shadow-[0_10px_24px_rgba(37,99,235,0.36)] hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                    >
                      <span>{isSubmitting ? 'Signing in…' : 'Sign in'}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </form>
                </div>

                <p className="mt-8 text-center text-xs text-slate-400 [@media(max-height:820px)]:mt-4">
                  By continuing you agree to PseudoTeam’s terms of service.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div
      id="pseudoteam-login-screen"
      className="fixed inset-0 w-full h-full min-h-screen flex items-center justify-center p-3 sm:p-5 md:p-8 select-none font-sans text-[#172033] overflow-y-auto no-scrollbar"
      style={{
        backgroundColor: '#F6F9FD',
      }}
    >
      <LightEnterpriseBackground />

      <div
        id="login-card"
        className={`w-full my-auto ${(phase === 'onboarding' || phase === 'onboarding-fading-out')
            ? onboardingStep === 1
              ? 'max-w-[calc(100vw-24px)] sm:max-w-[680px] md:max-w-[740px] p-4 sm:p-7 md:p-9'
              : 'max-w-[calc(100vw-24px)] sm:max-w-[480px] p-4 sm:p-6 md:p-7'
            : 'max-w-[calc(100vw-24px)] sm:max-w-[440px] p-4 sm:p-7 md:p-8'
          } bg-white border border-[#E2E8F0] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.03)] relative z-10 transition-all duration-300 max-h-[92dvh] sm:max-h-[95dvh] overflow-y-auto no-scrollbar`}
        style={{
          opacity: phase === 'onboarding-fading-out' ? 0 : 1,
          transform: phase === 'onboarding-fading-out' ? 'scale(0.97)' : 'scale(1)',
          transition: 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {(phase === 'onboarding' || phase === 'onboarding-fading-out') && (
          <div id="onboarding-flow-container" className="w-full">
            <AnimatePresence mode="wait" custom={slideDirection}>
              {onboardingStep === 1 ? (
                <motion.div
                  key="step-1"
                  custom={slideDirection}
                  variants={{
                    enter: (direction: number) => ({
                      x: direction > 0 ? 30 : -30,
                      opacity: 0,
                    }),
                    center: {
                      x: 0,
                      opacity: 1,
                    },
                    exit: (direction: number) => ({
                      x: direction < 0 ? 30 : -30,
                      opacity: 0,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 380, damping: 34 },
                    opacity: { duration: 0.22 },
                  }}
                  className="w-full"
                >
                  <div className="flex justify-end items-center mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      STEP 1 OF 2
                    </span>
                  </div>

                  <div className="mb-5 sm:mb-6 text-left">
                    <div className="text-sm font-semibold text-[#2563EB] mb-1">
                      Hi, Vaniya Batra
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight leading-snug">
                      Please complete your Profile
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label
                          htmlFor="profile-country"
                          className="block text-xs font-semibold text-[#172033] mb-1.5"
                        >
                          Country
                        </label>
                        <div className="relative">
                          <select
                            id="profile-country"
                            value={country}
                            onChange={(e) => {
                              setCountry(e.target.value);
                              setCity('');
                            }}
                            className="w-full h-[44px] px-3.5 sm:px-4 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 appearance-none cursor-pointer transition-all shadow-2xs font-normal"
                          >
                            <option value="" className="text-slate-400">--Select Country--</option>
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c} className="text-[#172033]">{c}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="profile-city"
                          className="block text-xs font-semibold text-[#172033] mb-1.5"
                        >
                          City
                        </label>
                        <div className="relative">
                          <select
                            id="profile-city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full h-[44px] px-3.5 sm:px-4 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 appearance-none cursor-pointer transition-all shadow-2xs font-normal"
                          >
                            <option value="" className="text-slate-400">--Select City--</option>
                            {availableCities.map((c) => (
                              <option key={c} value={c} className="text-[#172033]">{c}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label
                          htmlFor="profile-pincode"
                          className="block text-xs font-semibold text-[#172033] mb-1.5"
                        >
                          Pincode
                        </label>
                        <input
                          id="profile-pincode"
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="Area Pincode"
                          className="w-full h-[44px] px-3.5 sm:px-4 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 transition-all shadow-2xs"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="profile-address"
                          className="block text-xs font-semibold text-[#172033] mb-1.5"
                        >
                          Mailing Address
                        </label>
                        <textarea
                          id="profile-address"
                          rows={2}
                          value={mailingAddress}
                          onChange={(e) => setMailingAddress(e.target.value)}
                          placeholder="Your address"
                          className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 resize-none transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 pt-5 sm:pt-6">
                    <button
                      id="step1-next-btn"
                      type="button"
                      onClick={handleNextToStep2}
                      className="flex-1 h-[46px] rounded-xl bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      id="step1-skip-btn"
                      type="button"
                      onClick={handleSkip}
                      className="px-6 sm:px-8 h-[46px] rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-[#E2E8F0] text-slate-700 hover:text-[#172033] text-xs sm:text-sm font-medium transition-all shadow-2xs cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step-2"
                  custom={slideDirection}
                  variants={{
                    enter: (direction: number) => ({
                      x: direction > 0 ? 30 : -30,
                      opacity: 0,
                    }),
                    center: {
                      x: 0,
                      opacity: 1,
                    },
                    exit: (direction: number) => ({
                      x: direction < 0 ? 30 : -30,
                      opacity: 0,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 380, damping: 34 },
                    opacity: { duration: 0.22 },
                  }}
                  className="w-full"
                >
                  <div className="flex justify-end items-center mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      STEP 2 OF 2
                    </span>
                  </div>

                  <div className="mb-4 text-left">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight leading-snug">
                      Please complete your Profile
                    </h2>
                  </div>

                  <div className="space-y-3.5 sm:space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                        You are an
                      </label>
                      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                        <button
                          id="entity-organization-btn"
                          type="button"
                          onClick={() => setEntityType('Organization')}
                          className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                            entityType === 'Organization'
                              ? 'bg-[#2563EB] text-white shadow-xs'
                              : 'text-slate-600 hover:text-[#172033]'
                          }`}
                        >
                          Organization
                        </button>
                        <button
                          id="entity-individual-btn"
                          type="button"
                          onClick={() => setEntityType('Individual')}
                          className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                            entityType === 'Individual'
                              ? 'bg-[#2563EB] text-white shadow-xs'
                              : 'text-slate-600 hover:text-[#172033]'
                          }`}
                        >
                          Individual
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="profile-about"
                        className="block text-xs font-semibold text-[#172033] mb-1.5"
                      >
                        About
                      </label>
                      <textarea
                        id="profile-about"
                        rows={2}
                        value={aboutWork}
                        onChange={(e) => setAboutWork(e.target.value)}
                        placeholder="Please describe about your work"
                        className="w-full p-3 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 resize-none transition-all shadow-2xs"
                      />
                    </div>

                    {entityType === 'Organization' ? (
                      <div className="space-y-3">
                        <div>
                          <label
                            htmlFor="profile-org-name"
                            className="block text-xs font-semibold text-[#172033] mb-1.5"
                          >
                            Organization Name
                          </label>
                          <input
                            id="profile-org-name"
                            type="text"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            placeholder="Enter Organization Name"
                            className="w-full h-[42px] px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 transition-all shadow-2xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="profile-cin"
                              className="block text-xs font-semibold text-[#172033] mb-1.5"
                            >
                              CIN
                            </label>
                            <input
                              id="profile-cin"
                              type="text"
                              value={cin}
                              onChange={(e) => setCin(e.target.value)}
                              placeholder="Enter CIN"
                              className="w-full h-[42px] px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 transition-all shadow-2xs"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="profile-gst"
                              className="block text-xs font-semibold text-[#172033] mb-1.5"
                            >
                              GST Number
                            </label>
                            <input
                              id="profile-gst"
                              type="text"
                              value={gstNumber}
                              onChange={(e) => setGstNumber(e.target.value)}
                              placeholder="Enter GST Number"
                              className="w-full h-[42px] px-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 transition-all shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label
                          htmlFor="gov-id-upload-input"
                          className="block text-xs font-semibold text-[#172033] mb-1.5"
                        >
                          Any Government ID
                        </label>
                        <div className="p-3 bg-slate-50/70 border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3">
                          <label
                            htmlFor="gov-id-upload-input"
                            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 text-xs font-semibold transition-all shadow-2xs"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>Choose File</span>
                            <input
                              id="gov-id-upload-input"
                              type="file"
                              className="hidden"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setIdFileName(e.target.files[0].name);
                                }
                              }}
                            />
                          </label>
                          <span
                            className="text-xs text-[#64748B] truncate max-w-[200px]"
                            title={idFileName || 'No file chosen'}
                          >
                            {idFileName || 'No file chosen'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-5 sm:pt-6">
                    <button
                      id="step2-prev-btn"
                      type="button"
                      onClick={handlePrevToStep1}
                      className="px-5 h-[44px] rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-[#E2E8F0] text-slate-700 hover:text-[#172033] text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <button
                      id="step2-submit-btn"
                      type="button"
                      onClick={handleSubmitProfile}
                      className="flex-1 h-[44px] rounded-xl bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Submit</span>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-[#94A3B8] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          <span>PseudoTeam Workspace</span>
        </div>
      </div>
    </div>
  );
};