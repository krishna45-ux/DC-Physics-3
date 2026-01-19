import React, { useState } from 'react';
import { UserRole } from '../types';
import { registerStudent, verifyUserEmail, sendVerificationCode, resetUserPassword } from '../services/dataService';
import { GraduationCap, BookOpen, X, KeyRound, Mail, ArrowLeft, Info, AlertCircle, User as UserIcon, Lock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from '../components/Logo';

interface LoginProps {
  onLogin: (email: string, role: UserRole, password?: string) => void;
  onCancel: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const { t } = useLanguage();

  // Modes: LOGIN, SIGNUP, VERIFY
  const [viewMode, setViewMode] = useState<'LOGIN' | 'SIGNUP' | 'VERIFY'>('LOGIN');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // UI State
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const trimmedEmail = email.trim();
    // Allow overwriting session by just logging in.

    // Call generic login - logic handled in App.tsx
    onLogin(trimmedEmail, role, password);
    setIsLoading(false);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmedEmail = email.trim();

      if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
      }

      setIsLoading(true);
      const res = registerStudent(name, trimmedEmail, password);

      if (res.success) {
          setViewMode('VERIFY');
          setSuccessMsg(res.message);
      } else {
          setError(res.message);
      }
      setIsLoading(false);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      const trimmedEmail = email.trim();
      const isValid = verifyUserEmail(trimmedEmail, verificationCode);

      if (isValid) {
          setSuccessMsg("Email verified successfully! Logging you in...");
          setTimeout(() => {
              onLogin(trimmedEmail, UserRole.STUDENT, password); // Auto login
          }, 1000);
      } else {
          setError("Invalid or expired verification code.");
          setIsLoading(false);
      }
  };

  const handleResendCode = () => {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
          setError("Please enter your email first.");
          return;
      }
      sendVerificationCode(trimmedEmail);
      setSuccessMsg("Verification code resent to your email.");
  };

  // Forgot Password Logic
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('SENDING');

    setTimeout(() => {
        const result = resetUserPassword(resetEmail);
        if (result.success) {
            setResetStatus('SENT');
            // Simulate sending email
            alert(`[Email Simulation]\nTo: ${resetEmail}\nSubject: Password Reset\n\nYour new password is: ${result.newPassword}\n\nPlease login and change it immediately.`);
        } else {
            setResetStatus('IDLE');
            alert(result.message);
        }
    }, 1500);
  };

  const closeForgotModal = () => {
      setShowForgot(false);
      setResetStatus('IDLE');
      setResetEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-slate-50"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl relative z-10 border border-slate-100">
        <div className="text-center">
            <div className="mx-auto h-24 w-24 flex items-center justify-center mb-4">
                <Logo className="h-20 w-auto" />
            </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {viewMode === 'LOGIN' ? t('login_welcome') : viewMode === 'SIGNUP' ? 'Create Account' : 'Verify Email'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
             {viewMode === 'LOGIN' ? t('login_subtitle') : viewMode === 'SIGNUP' ? 'Join thousands of students' : `Enter code sent to ${email}`}
          </p>
        </div>

        {/* Toggle between Login/Signup (Only for Students) */}
        {viewMode !== 'VERIFY' && (
            <div className="flex justify-center border-b border-slate-200 mb-6">
                <button
                    onClick={() => { setViewMode('LOGIN'); setError(null); }}
                    className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${viewMode === 'LOGIN' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Login
                </button>
                <button
                    onClick={() => { setViewMode('SIGNUP'); setRole(UserRole.STUDENT); setError(null); }}
                    className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${viewMode === 'SIGNUP' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Sign Up
                </button>
            </div>
        )}

        {viewMode === 'LOGIN' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                type="button"
                onClick={() => { setRole(UserRole.STUDENT); setError(null); }}
                className={`py-3 px-4 rounded-xl flex items-center justify-center border-2 transition-all duration-200 ${role === UserRole.STUDENT ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                <GraduationCap className="h-5 w-5 mr-2" />
                <span className="font-semibold">{t('login_student')}</span>
                </button>
                <button
                type="button"
                onClick={() => { setRole(UserRole.TEACHER); setError(null); }}
                className={`py-3 px-4 rounded-xl flex items-center justify-center border-2 transition-all duration-200 ${role === UserRole.TEACHER ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                <BookOpen className="h-5 w-5 mr-2" />
                <span className="font-semibold">{t('login_teacher')}</span>
                </button>
            </div>
        )}

        {(error || successMsg) && (
            <div className={`p-4 rounded-lg flex items-start ${error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                {error ? <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />}
                <p className={`text-sm ${error ? 'text-red-700' : 'text-green-700'}`}>{error || successMsg}</p>
            </div>
        )}

        {viewMode === 'LOGIN' && (
            <form className="mt-2 space-y-6" onSubmit={handleLoginSubmit}>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute top-3.5 left-3 h-5 w-5 text-slate-400" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl placeholder-slate-400 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                            placeholder="Enter your email"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute top-3.5 left-3 h-5 w-5 text-slate-400" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl placeholder-slate-400 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" /> {t('login_back')}
                    </button>
                    <button type="button" onClick={() => setShowForgot(true)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        Forgot password?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                    {isLoading ? 'Signing In...' : t('login_btn')}
                </button>
            </form>
        )}

        {viewMode === 'SIGNUP' && (
            <form className="mt-2 space-y-6" onSubmit={handleSignupSubmit}>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <div className="relative">
                        <UserIcon className="absolute top-3.5 left-3 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl placeholder-slate-400 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                            placeholder="John Doe"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute top-3.5 left-3 h-5 w-5 text-slate-400" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl placeholder-slate-400 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                            placeholder="student@example.com"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute top-3.5 left-3 h-5 w-5 text-slate-400" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl placeholder-slate-400 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                            placeholder="Create a strong password"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-start mt-2">
                    <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" /> {t('login_back')}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
        )}

        {viewMode === 'VERIFY' && (
            <form className="mt-2 space-y-6" onSubmit={handleVerifySubmit}>
                <div className="text-center mb-4">
                    <p className="text-sm text-slate-600">We've sent a verification code to <strong>{email}</strong>.</p>
                    <p className="text-xs text-slate-500 mt-1">(Check your browser alert/console for the simulation code)</p>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Verification Code</label>
                    <div className="relative">
                        <KeyRound className="absolute top-3.5 left-3 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            required
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl placeholder-slate-400 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm tracking-widest text-center text-lg"
                            placeholder="123456"
                            maxLength={6}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <button type="button" onClick={() => setViewMode('LOGIN')} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                        Back to Login
                    </button>
                    <button type="button" onClick={handleResendCode} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Resend Code
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                </button>
            </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity duration-300" aria-hidden="true" onClick={closeForgotModal}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full p-6 relative border border-slate-100">
                    <button onClick={closeForgotModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-500 transition-colors bg-slate-50 p-1 rounded-full">
                        <X className="h-5 w-5"/>
                    </button>

                    {resetStatus === 'SENT' ? (
                        <div className="text-center py-6 animate-fade-in-up">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                <Mail className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h3>
                            <p className="text-sm text-slate-600 mb-8 px-4">
                                We've sent a password reset link to <br/><span className="font-semibold text-slate-900">{resetEmail}</span>
                            </p>
                            <button onClick={closeForgotModal} className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-md px-4 py-3 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 transition sm:text-sm">
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleForgotSubmit} className="animate-fade-in">
                            <div className="text-center mb-8 pt-2">
                                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-indigo-50 mb-4 border border-indigo-100">
                                    <KeyRound className="h-7 w-7 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Reset Password</h3>
                                <p className="text-sm text-slate-500 mt-2 px-4">Enter the email associated with your account and we'll send you instructions.</p>
                            </div>
                            <div className="mb-6">
                                <label htmlFor="reset-email" className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute top-3.5 left-3 h-5 w-5 text-slate-400" />
                                    <input
                                        type="email"
                                        id="reset-email"
                                        required
                                        value={resetEmail}
                                        onChange={e => setResetEmail(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-slate-900"
                                        placeholder="Enter your registered email"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={resetStatus === 'SENDING'}
                                className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-lg shadow-indigo-100 px-4 py-3.5 bg-indigo-600 text-base font-bold text-white hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-95"
                            >
                                {resetStatus === 'SENDING' ? 'Sending Link...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
