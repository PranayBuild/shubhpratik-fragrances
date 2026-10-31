import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ShubhpratikLogoEmblem } from './ShubhpratikLogoEmblem';
import { UserRole } from '../types/inventory';

// Official Google Logo Icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.39 7.35 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const LoginView: React.FC = () => {
  const { login, loginWithGoogle, adminEmail } = useInventory();
  const videoRef = useRef<HTMLVideoElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Form State
  const [role, setRole] = useState<UserRole>('admin');
  const [identifier, setIdentifier] = useState('admin@shubhpratik.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Security & Validation State
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Dialog State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleManualEmail, setGoogleManualEmail] = useState('');
  const [googleManualName, setGoogleManualName] = useState('');

  // Handle countdown if locked out
  useEffect(() => {
    if (lockoutTimer > 0) {
      const interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTimer]);

  // Sync identifier default when role changes
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setErrorMessage('');
    if (newRole === 'admin') {
      setIdentifier('admin@shubhpratik.com');
    } else {
      setIdentifier('staff@shubhpratik.com');
    }
  };

  // Background video playback
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.play().catch((error) => console.error('Background video failed:', error));
    }
  }, []);

  // Parse JWT token from Google One Tap / GIS response
  const decodeJwtResponse = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const handleGoogleCredentialResponse = useCallback(
    (response: { credential?: string }) => {
      if (!response?.credential) return;
      const payload = decodeJwtResponse(response.credential);
      if (payload && payload.email) {
        const profileName = payload.name || payload.email.split('@')[0];
        loginWithGoogle({
          email: payload.email,
          name: profileName,
          picture: payload.picture,
        });
      }
    },
    [loginWithGoogle]
  );

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    const googleClientId = (window as unknown as { GOOGLE_CLIENT_ID?: string }).GOOGLE_CLIENT_ID;
    if (
      googleClientId &&
      typeof (
        window as unknown as {
          google?: { accounts?: { id?: { initialize: Function; renderButton: Function } } };
        }
      ).google !== 'undefined'
    ) {
      try {
        const googleObj = (
          window as unknown as {
            google: { accounts: { id: { initialize: Function; renderButton: Function } } };
          }
        ).google;
        googleObj.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });

        if (googleBtnRef.current) {
          googleObj.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      } catch (err) {
        console.warn('Google One Tap note:', err);
      }
    }
  }, [handleGoogleCredentialResponse]);

  // Google Login click handler
  const handleGoogleLoginClick = () => {
    setErrorMessage('');
    const googleObj = (window as unknown as { google?: { accounts?: { id?: { prompt: Function } } } })
      .google;
    const googleClientId = (window as unknown as { GOOGLE_CLIENT_ID?: string }).GOOGLE_CLIENT_ID;

    if (googleClientId && googleObj?.accounts?.id) {
      googleObj.accounts.id.prompt();
    } else {
      setShowGoogleModal(true);
    }
  };

  const handleManualGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleManualEmail.trim()) {
      setErrorMessage('Please enter a valid Google email address.');
      return;
    }
    const cleanEmail = googleManualEmail.trim().toLowerCase();
    const cleanName =
      googleManualName.trim() ||
      cleanEmail
        .split('@')[0]
        .replace('.', ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

    loginWithGoogle({
      email: cleanEmail,
      name: cleanName,
    });
    setShowGoogleModal(false);
  };

  // Submit standard credentials with Security PIN
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    const trimmedPin = password.trim();
    if (!trimmedPin) {
      setErrorMessage('Security PIN is required. Please enter your PIN.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Verification delay
    setTimeout(() => {
      setIsSubmitting(false);

      // Verify official confidential PIN
      const isPinValid = trimmedPin === '16122006';

      if (isPinValid) {
        setFailedAttempts(0);
        login(
          role,
          role === 'admin'
            ? 'Shubham Patil (Administrator)'
            : 'Pratik K. (Floor Operations Manager)'
        );
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 5) {
          setLockoutTimer(30);
          setErrorMessage('Too many failed attempts. Account locked for 30 seconds.');
        } else {
          setErrorMessage(
            `Authentication failed. Invalid Security PIN. (${5 - nextAttempts} attempts remaining)`
          );
        }
      }
    }, 400);
  };

  return (
    <div className="min-h-screen text-[#FDFBF7] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        onError={(e) => console.error('Background video error:', e)}
      >
        <source src="/Animate_lamp_and_incense_smoke_20261003113648.mp4" type="video/mp4" />
      </video>

      {/* Ambient Lighting & Darkening Layer */}
      <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px] pointer-events-none z-[1]" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#0F071D]/80 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.85)] relative z-10 space-y-5"
      >
        {/* Brand Emblem & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-2">
            <ShubhpratikLogoEmblem size={96} className="shadow-[0_4px_25px_rgba(0,0,0,0.7)]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-cream-gradient tracking-wide">
            Shubhpratik Fragrances
          </h1>
          <p className="text-xs text-[#D8B4FE]/75 mt-0.5 font-medium">
            Enterprise Factory Management Portal
          </p>
        </div>

        {/* 1. Google Single Sign-On (SSO) Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLoginClick}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-zinc-950 bg-white hover:bg-zinc-100 active:scale-[0.99] transition-all shadow-[0_2px_15px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2.5 cursor-pointer border border-white"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Continue with Google</span>
          </button>
          <div ref={googleBtnRef} className="empty:hidden flex justify-center" />
        </div>

        {/* Professional Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-white/15" />
          <span className="bg-[#0F071D] px-3 text-[10px] uppercase tracking-widest text-[#D8B4FE]/60 font-semibold absolute">
            Or sign in with Security PIN
          </span>
        </div>

        {/* 2. Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Role / Access Level Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-[#D8B4FE]/80 mb-1.5 uppercase tracking-wider">
              Select Access Level
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-white/15 rounded-xl">
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-white text-[#19092F] font-bold shadow-md'
                    : 'text-[#D8B4FE]/75 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrator</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('employee')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'employee'
                    ? 'bg-white text-[#19092F] font-bold shadow-md'
                    : 'text-[#D8B4FE]/75 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Floor Staff</span>
              </button>
            </div>
          </div>

          {/* Email / Username Input */}
          <div>
            <label className="block text-[11px] font-semibold text-[#D8B4FE]/80 mb-1.5 uppercase tracking-wider">
              Account Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#D8B4FE]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setErrorMessage('');
                }}
                placeholder={role === 'admin' ? 'admin@shubhpratik.com' : 'staff@shubhpratik.com'}
                className="w-full bg-black/50 border border-white/20 focus:border-white focus:ring-1 focus:ring-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 transition-all outline-none font-mono-numbers"
              />
            </div>
          </div>

          {/* Security PIN Input with Show/Hide Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold text-[#D8B4FE]/80 uppercase tracking-wider">
                Security PIN
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-[11px] text-[#D8B4FE]/80 hover:text-white underline cursor-pointer"
              >
                PIN Support
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#D8B4FE]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={lockoutTimer > 0}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Enter original PIN"
                className="w-full bg-black/50 border border-white/20 focus:border-white focus:ring-1 focus:ring-white rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 transition-all outline-none font-mono-numbers tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D8B4FE]/60 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Hide PIN' : 'Show PIN'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me without Demo button */}
          <div className="flex items-center text-xs text-[#D8B4FE]/80 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-black/50 border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px]">Remember this device</span>
            </label>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 text-xs text-rose-200 bg-rose-950/60 border border-rose-500/50 rounded-xl p-3"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-tight">{errorMessage}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || lockoutTimer > 0}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-[#19092F] bg-white hover:bg-zinc-100 active:scale-[0.99] transition-all shadow-[0_2px_15px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 cursor-pointer ${
              lockoutTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span>Authenticating Credentials...</span>
            ) : lockoutTimer > 0 ? (
              <span>Locked ({lockoutTimer}s)</span>
            ) : (
              <>
                <span>Sign In as {role === 'admin' ? 'Administrator' : 'Floor Staff'}</span>
                <ArrowRight className="w-4 h-4 text-[#19092F]" />
              </>
            )}
          </button>
        </form>


      </motion.div>

      {/* MODAL: Forgot Password / Recovery Guidance */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#140826] border border-[#D8B4FE]/30 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
                <h3 className="font-semibold text-sm text-[#FFFDF5] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-white" />
                  <span>PIN Access & Confidentiality</span>
                </h3>
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="text-[#D8B4FE]/60 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-[#E9D5FF]/90 space-y-3">
                <p>
                  For factory operational security and fraud prevention, credentials are maintained confidentially.
                </p>
                <div className="bg-[#1D0C38] p-3 rounded-xl border border-purple-800/40 text-[11px] text-zinc-300 space-y-1">
                  <p className="font-semibold text-white">Confidential Access Notice</p>
                  <p>
                    The original access PIN is restricted to authorized personnel. If you need your access credentials, please contact the factory administrator.
                  </p>
                </div>
                <p className="text-[11px] text-[#D8B4FE]/60">
                  Authorized administrators can also sign in directly using Google Single Sign-On.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-white text-[#19092F] hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Google Direct Sign-In Dialog */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#130726] border border-[#D8B4FE]/30 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-purple-900/50 pb-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
                  <GoogleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Google Account Verification</h3>
                  <p className="text-[11px] text-zinc-300">Shubhpratik Authentication</p>
                </div>
              </div>

              <form onSubmit={handleManualGoogleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Google Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={googleManualEmail}
                    onChange={(e) => setGoogleManualEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 focus:border-white focus:outline-none rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Prashant Shinde"
                    value={googleManualName}
                    onChange={(e) => setGoogleManualName(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 focus:border-white focus:outline-none rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-zinc-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-white text-zinc-950 hover:bg-zinc-100 transition-colors shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <GoogleIcon className="w-3.5 h-3.5" />
                    <span>Authorize</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
