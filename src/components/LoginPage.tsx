import React, { useState, useEffect } from 'react';
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
  User // changes done by vb: icon for the sign-up name field
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LightEnterpriseBackground } from './auth/LightEnterpriseBackground';
import { customerLogin, customerRegister } from '../services/authService'; // changes done by vb: + customerRegister
import { AuthLoader } from './auth/AuthLoader'; // changes done by vb
import { AuthAnimatedBackground } from './auth/AuthAnimatedBackground'; // changes done by vb
import { LANDING_URL } from '../config/links'; // changes done by vb

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

// interface LoginPageProps {
//   onLoginSuccess: (username?: string, profileData?: UserProfileData) => void;
// }

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
  'India': ['New Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Gurugram', 'Noida', 'Chandigarh'],
  'United States': ['New York', 'San Francisco', 'Seattle', 'Chicago', 'Austin', 'Los Angeles', 'Boston', 'Denver', 'Columbus'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol', 'Cambridge'],
  'Germany': ['Munich', 'Frankfurt', 'Berlin', 'Hamburg', 'Stuttgart', 'Cologne'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
  'Singapore': ['Singapore City', 'Jurong', 'Changi'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Ottawa', 'Calgary'],
  'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya'],
  'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
};

// changes done by vb: shared input row used by the redesigned sign-in and sign-up forms
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
}

const AuthField: React.FC<AuthFieldProps> = ({
  id, label, icon: Icon, type, value, onChange, placeholder, autoComplete, trailing, labelAside, hint, minLength,
}) => (
  // changes done by vb: no entrance animation (only the background animates)
  <div>
    <div className="mb-1.5 flex items-center justify-between">
      <label htmlFor={id} className="text-[13px] font-semibold text-[#0F172A]">{label}</label>
      {labelAside}
    </div>
    <div className="group flex h-12 items-center gap-2.5 rounded-xl border border-[#DCE3EE] bg-white/90 px-3.5 transition-all duration-150 hover:border-[#C5D0E0] focus-within:border-[#2563EB] focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
      <Icon className="h-[18px] w-[18px] shrink-0 text-slate-400 transition-colors group-focus-within:text-[#2563EB]" />
      <input
        id={id}
        type={type}
        required
        minLength={minLength}
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

// changes done by vb: simple password strength score for the sign-up form (0–4)
const passwordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Pre-filled credentials as specified
  const [email, setEmail] = useState('vb@gmail.com');
  const [password, setPassword] = useState('Password');
  const [showPassword, setShowPassword] = useState(false);
  // changes done by vb: removed "Remember me" state (checkbox removed from the UI)
  const [errorMessage, setErrorMessage] = useState('');
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // changes done by vb: sign-in vs sign-up mode (synced with /login and /signup)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(() =>
    typeof window !== 'undefined' && window.location.pathname === '/signup' ? 'signup' : 'login'
  );
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const switchAuthMode = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setErrorMessage('');
    setInfoNotice(null);
  };

  // Restore phase from URL query parameters (step=1 or step=2) on refresh
  const initialStepParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('step') : null;
  const initialPhase = (initialStepParam === '1' || initialStepParam === '2') ? 'onboarding' : 'form';
  const initialStep = initialStepParam === '2' ? 2 : 1;

  // Transition phases:
  // 1. 'form' -> 'form-fading-out'
  // 2. 'welcome' -> 'welcome-fading-out'
  // 3. 'onboarding' (Step 1 -> Step 2)
  // 4. 'onboarding-fading-out' -> onLoginSuccess()
  const [phase, setPhase] = useState<
    'form' | 'form-fading-out' | 'welcome' | 'welcome-fading-out' | 'onboarding' | 'onboarding-fading-out'
  >(initialPhase);

  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(initialStep);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  // Synchronize onboarding step with URL so browser refresh preserves Step 1 / Step 2
  useEffect(() => {
    if (phase === 'onboarding') {
      try {
        window.history.replaceState(null, '', `/login?step=${onboardingStep}`);
      } catch { }
    } else if (phase === 'form') {
      // changes done by vb: keep the URL in step with the sign-in / sign-up mode
      try {
        const target = authMode === 'signup' ? '/signup' : '/login';
        if (window.location.pathname !== target || window.location.search) {
          window.history.replaceState(null, '', target);
        }
      } catch { }
    }
  }, [phase, onboardingStep, authMode]);

  // Profile Step 1 fields
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');

  // Profile Step 2 fields
  const [entityType, setEntityType] = useState<'Organization' | 'Individual'>('Organization');
  const [organizationName, setOrganizationName] = useState('');
  const [aboutWork, setAboutWork] = useState('');
  const [cin, setCin] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [idFileName, setIdFileName] = useState('');

  // const authenticatedUser = 'Vaniya Batra';
  const [authenticatedUser, setAuthenticatedUser] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const startLoginSequence = () => {
  //   setErrorMessage('');
  //   setInfoNotice(null);

  //   // 1. Smoothly fade out form
  //   setPhase('form-fading-out');

  //   setTimeout(() => {
  //     // 2. Mount minimal centered welcome/loading view
  //     setPhase('welcome');
  //     setProgressPercent(0);

  //     requestAnimationFrame(() => {
  //       setWelcomeVisible(true);
  //     });

  //     // Animate progress smoothly from 0% to 100% over 2000ms
  //     const duration = 2000;
  //     const startTime = performance.now();

  //     const animateProgress = (currentTime: number) => {
  //       const elapsed = currentTime - startTime;
  //       const progress = Math.min(100, (elapsed / duration) * 100);
  //       // Smooth sine easing
  //       const eased = 100 * Math.sin((progress / 100) * (Math.PI / 2));
  //       setProgressPercent(Math.min(100, Math.max(eased, progress)));

  //       if (elapsed < duration) {
  //         requestAnimationFrame(animateProgress);
  //       } else {
  //         // Progress complete: brief pause then transition smoothly to Profile Completion Step 1
  //         setTimeout(() => {
  //           setWelcomeVisible(false);
  //           setPhase('welcome-fading-out');

  //           setTimeout(() => {
  //             setPhase('onboarding');
  //             setOnboardingStep(1);
  //           }, 300);
  //         }, 180);
  //       }
  //     };

  //     requestAnimationFrame(animateProgress);
  //   }, 300);
  // };

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

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setErrorMessage('');
  //   setInfoNotice(null);

  //   const trimmedEmail = email.trim();
  //   if (trimmedEmail.toLowerCase() === 'vb@gmail.com' && password === 'Password') {
  //     startLoginSequence();
  //   } else {
  //     setErrorMessage('Invalid work email or password. Please verify your credentials.');
  //   }
  // };

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

    // Save JWT token for authenticated API requests
    localStorage.setItem('auth_token', response.access_token);

    // Set actual username returned by FastAPI
    setAuthenticatedUser(response.user.name);

    // Start welcome animation and navigate afterwards
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

  // changes done by vb: removed handleContinueWithEmail and handleRequestAccess
  // (the "Continue with Email" button and "Request access" link were removed)

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setInfoNotice(`Password recovery instructions dispatched to ${email || 'your registered work email'}.`);
    setErrorMessage('');
  };

  // changes done by vb: sign-up submit (name, email, password)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');
    setInfoNotice(null);

    const name = signupName.trim();
    const mail = signupEmail.trim();

    if (name.length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (signupPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await customerRegister({ name, email: mail, password: signupPassword });

      if (response.access_token) {
        // Backend signed the new user straight in
        localStorage.setItem('auth_token', response.access_token);
        const displayName = response.user?.name || name;
        setAuthenticatedUser(displayName);
        setIsNewUser(true);
        startLoginSequence(displayName, response.redirect_to || '/dashboard');
      } else {
        // Account created; ask them to sign in
        setEmail(mail);
        setPassword('');
        setSignupPassword('');
        setAuthMode('login');
        setInfoNotice(response.message || 'Account created. Sign in to continue.');
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404 || status === 405) {
        console.warn('Sign-up endpoint POST /api/v1/auth/customer/register is not available on the backend yet.');
        setErrorMessage('Sign-up isn’t available yet. Please contact your PseudoTeam administrator.');
      } else {
        const detail = error?.response?.data?.detail;
        setErrorMessage(
          typeof detail === 'string' ? detail : 'Unable to create your account. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Onboarding Step 1 -> Step 2 (Next)
  const handleNextToStep2 = () => {
    setSlideDirection(1);
    setOnboardingStep(2);
  };

  // Onboarding Step 1 -> Skip (Immediate Dashboard entry)
  const handleSkip = () => {
    setPhase('onboarding-fading-out');
    setTimeout(() => {
      onLoginSuccess(authenticatedUser);
    }, 300);
  };

  // Onboarding Step 2 -> Step 1 (Prev)
  const handlePrevToStep1 = () => {
    setSlideDirection(-1);
    setOnboardingStep(1);
  };

  // Onboarding Step 2 -> Submit (Dashboard entry)
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

  // Dynamic available cities based on country selection
  const availableCities = country && CITIES_BY_COUNTRY[country]
    ? CITIES_BY_COUNTRY[country]
    : [
      'New Delhi', 'Mumbai', 'Bengaluru', 'New York', 'San Francisco',
      'London', 'Munich', 'Dubai', 'Singapore', 'Sydney', 'Tokyo'
    ];

  // ===================================================================
  // changes done by vb: REDESIGNED SIGN-IN / SIGN-UP + POST-LOGIN LOADER
  // Split layout: brand panel (lg+) on the left, form on the right.
  // The profile-completion onboarding below keeps its original card.
  // ===================================================================
  const isFormPhase = phase === 'form' || phase === 'form-fading-out';
  const isLoaderPhase = phase === 'welcome' || phase === 'welcome-fading-out';

  if (isLoaderPhase) {
    return (
      <div
        id="pseudoteam-login-screen"
        className="auth-font fixed inset-0 flex min-h-screen w-full items-center justify-center overflow-y-auto p-6"
      >
        {/* changes done by vb: animated background + new font on the loader */}
        <AuthAnimatedBackground />
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
    const strength = passwordStrength(signupPassword);
    const isSignup = authMode === 'signup';

    return (
      <div
        id="pseudoteam-login-screen"
        className="auth-font fixed inset-0 w-full min-h-screen overflow-y-auto text-[#0F172A]"
      >
        {/* changes done by vb: animated background + new font (DM Sans body / Sora headings) */}
        <AuthAnimatedBackground />

        {/* changes done by vb: "Back to home" sits in the top-left corner of the page (outside the card) */}
        <a
          id="link-back-to-home"
          href={LANDING_URL}
          className="group absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-[0_6px_18px_rgba(30,64,175,0.12)] backdrop-blur-md transition-colors hover:border-blue-300 hover:text-blue-700 sm:left-6 sm:top-6 sm:text-[13px]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </a>

        {/* changes done by vb: left brand panel removed — just the centered form on the animated background
            (extra top padding on small screens leaves room for the Back to home button) */}
        <div className="relative z-10 mx-auto flex min-h-full w-full items-center justify-center p-3 pt-16 sm:p-6 sm:pt-20">
          <main className="relative flex w-full items-center justify-center py-6 sm:py-10">
            {/* changes done by vb: frosted-glass card so the animated background shows through */}
            <div
              id="login-form-wrapper"
              className="w-full max-w-[440px] rounded-[26px] border border-white/80 bg-white/75 p-6 shadow-[0_24px_60px_rgba(30,64,175,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:p-9"
              style={{
                opacity: phase === 'form-fading-out' ? 0 : 1,
                transform: phase === 'form-fading-out' ? 'translateY(6px) scale(0.98)' : 'none',
                transition: 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: phase === 'form-fading-out' ? 'none' : 'auto',
              }}
            >
              {/* Logo — changes done by vb: now shown on all screen sizes (brand panel removed) */}
              <div className="mb-7 flex justify-center">
                {/* changes done by vb: new PseudoTeam logo (public/pseudoteam-logo.png) on a dark navy badge
                    so its light text is readable on the white card */}
                <span className="inline-flex items-center rounded-2xl bg-gradient-to-br from-[#0B1736] to-[#1E3A8A] px-3 py-1 shadow-[0_8px_20px_rgba(11,23,54,0.28)] ring-1 ring-white/10">
                  <img
                    id="pseudoteam-logo"
                    src="/pseudoteam-logo.png"
                    alt="PseudoTeam"
                    className="h-12 w-auto max-w-[170px] object-contain select-none"
                    referrerPolicy="no-referrer"
                  />
                </span>
              </div>

              {/* Sign in / Create account switch */}
              <div
                role="tablist"
                aria-label="Choose sign in or create account"
                className="mb-7 grid grid-cols-2 rounded-xl bg-[#E8EEF8]/80 p-1 text-sm font-semibold"
              >
                {(['login', 'signup'] as const).map((mode) => (
                  <button
                    key={mode}
                    id={mode === 'login' ? 'auth-tab-login' : 'auth-tab-signup'}
                    role="tab"
                    type="button"
                    aria-selected={authMode === mode}
                    onClick={() => switchAuthMode(mode)}
                    className={`h-10 rounded-lg transition-all duration-150 cursor-pointer ${
                      authMode === mode
                        ? 'bg-white text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.1)]'
                        : 'text-slate-500 hover:text-[#0F172A]'
                    }`}
                  >
                    {mode === 'login' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>

              {/* Heading — changes done by vb: Sora display font (no entrance animation; only the background animates) */}
              <div className="mb-6">
                <h1 className="auth-display text-[30px] font-bold leading-tight text-[#0B1736]">
                  {isSignup ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="mt-1.5 text-sm text-[#64748B]">
                  {isSignup
                    ? 'Set up your PseudoTeam workspace in under a minute.'
                    : 'Sign in to continue to your PseudoTeam workspace.'}
                </p>
              </div>

              {/* Error / info */}
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

              {isSignup ? (
                /* ---------------- SIGN-UP FORM ---------------- */
                <form id="signup-form" onSubmit={handleSignup} className="space-y-4" noValidate={false}>
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
                    id="signup-password"
                    label="Password"
                    icon={Lock}
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={setSignupPassword}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword((v) => !v)}
                        aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                        className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:text-[#2563EB] cursor-pointer"
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    hint={
                      signupPassword ? (
                        <div className="mt-2 flex items-center gap-3">
                          <div className="grid flex-1 grid-cols-4 gap-1">
                            {[1, 2, 3, 4].map((i) => (
                              <span
                                key={i}
                                className={`h-1 rounded-full transition-colors ${i <= strength ? STRENGTH_COLORS[strength] : 'bg-slate-200'}`}
                              />
                            ))}
                          </div>
                          <span className="w-16 text-right text-[11px] font-medium text-slate-500">
                            {STRENGTH_LABELS[signupPassword.length < 8 ? 0 : strength]}
                          </span>
                        </div>
                      ) : null
                    }
                  />

                  {/* changes done by vb: entrance animation removed */}
                  <button
                    id="signup-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] transition-all duration-150 hover:shadow-[0_10px_24px_rgba(37,99,235,0.36)] hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Creating account…' : 'Create account'}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              ) : (
                /* ---------------- SIGN-IN FORM ---------------- */
                <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
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

                  {/* changes done by vb: entrance animation removed */}
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
              )}

              <p className="mt-8 text-center text-xs text-slate-400">
                By continuing you agree to PseudoTeam’s terms of service.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  // changes done by vb: end of redesigned sign-in / sign-up / loader

  return (
    <div
      id="pseudoteam-login-screen"
      className="fixed inset-0 w-full h-full min-h-screen flex items-center justify-center p-3 sm:p-5 md:p-8 select-none font-sans text-[#172033] overflow-y-auto no-scrollbar"
      style={{
        backgroundColor: '#F6F9FD',
      }}
    >
      {/* ========================================================= */}
      {/* 1. SOPHISTICATED LIGHT ENTERPRISE BACKGROUND              */}
      {/* Clean #F6F9FD base, subtle blue gradient blobs, thin lines */}
      {/* ========================================================= */}
      <LightEnterpriseBackground />

      {/* ========================================================= */}
      {/* 2. ONE CENTERED PREMIUM WHITE CARD                        */}
      {/* Clean solid white, border #E2E8F0, soft shadow, radius 20px */}
      {/* ========================================================= */}
      <div
        id="login-card"
        className={`w-full my-auto ${(phase === 'onboarding' || phase === 'onboarding-fading-out')
            ? onboardingStep === 1
              ? 'max-w-[calc(100vw-24px)] sm:max-w-[680px] md:max-w-[740px] p-4 sm:p-7 md:p-9'
              : 'max-w-[calc(100vw-24px)] sm:max-w-[480px] p-4 sm:p-6 md:p-7'
            : 'max-w-[calc(100vw-24px)] sm:max-w-[440px] p-4 sm:p-7 md:p-8'
          } bg-white border border-[#E2E8F0] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.03)] relative z-10 transition-all duration-300 max-h-[92dvh] sm:max-h-[95dvh] overflow-y-auto no-scrollbar`} /* changes done by vb */
        style={{
          opacity: phase === 'onboarding-fading-out' ? 0 : 1,
          transform: phase === 'onboarding-fading-out' ? 'scale(0.97)' : 'scale(1)',
          transition: 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* changes done by vb: old sign-in form (VIEW 1) and welcome loader (VIEW 2) removed from this card;
            they are now rendered by the redesigned layout above (AuthLoader + split sign-in/sign-up). */}

        {/* ========================================================= */}
        {/* VIEW 3: PROFILE COMPLETION ONBOARDING (STEPS 1 & 2)       */}
        {/* ========================================================= */}
        {(phase === 'onboarding' || phase === 'onboarding-fading-out') && (
          <div id="onboarding-flow-container" className="w-full">
            <AnimatePresence mode="wait" custom={slideDirection}>
              {onboardingStep === 1 ? (
                /* -------------------------------------------------- */
                /* STEP 1: PROFILE LOCATION                           */
                /* Large horizontal layout, no logo, light card       */
                /* -------------------------------------------------- */
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
                  {/* Top: Pill on right, NO logo */}
                  <div className="flex justify-end items-center mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      STEP 1 OF 2
                    </span>
                  </div>

                  {/* Greeting & Heading */}
                  <div className="mb-5 sm:mb-6 text-left">
                    <div className="text-sm font-semibold text-[#2563EB] mb-1">
                      Hi, Vaniya Batra
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight leading-snug">
                      Please complete your Profile
                    </h2>
                  </div>

                  {/* Form fields: Clean 2-column horizontal responsive layout */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {/* Country Dropdown */}
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
                            {COUNTRIES.map(c => (
                              <option key={c} value={c} className="text-[#172033]">{c}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* City Dropdown */}
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
                            {availableCities.map(c => (
                              <option key={c} value={c} className="text-[#172033]">{c}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {/* Pincode Input */}
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

                      {/* Mailing Address Textarea */}
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

                  {/* Bottom Actions: [ Next ] [ Skip ] */}
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
                /* -------------------------------------------------- */
                /* STEP 2: ORGANIZATION / INDIVIDUAL                  */
                /* Clean light mode, no logo, pill top right          */
                /* -------------------------------------------------- */
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
                  {/* Top: Pill on right, NO logo */}
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

                  {/* Form fields */}
                  <div className="space-y-3.5 sm:space-y-4">
                    {/* You are an: Segmented Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                        You are an
                      </label>
                      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                        <button
                          id="entity-organization-btn"
                          type="button"
                          onClick={() => setEntityType('Organization')}
                          className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${entityType === 'Organization'
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
                          className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${entityType === 'Individual'
                              ? 'bg-[#2563EB] text-white shadow-xs'
                              : 'text-slate-600 hover:text-[#172033]'
                            }`}
                        >
                          Individual
                        </button>
                      </div>
                    </div>

                    {/* About Field */}
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

                    {/* Dynamic Fields based on entityType */}
                    {entityType === 'Organization' ? (
                      <div className="space-y-3">
                        {/* Organization Name */}
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

                        {/* CIN & GST Number side by side */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* CIN */}
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

                          {/* GST Number */}
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

                  {/* Bottom Actions: [ Prev ] [ Submit ] */}
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

        {/* Bottom Card Footer: "PseudoTeam Workspace" with subtle gray text and small blue dot */}
        <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-[#94A3B8] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          <span>PseudoTeam Workspace</span>
        </div>
      </div>
    </div>
  );
};
