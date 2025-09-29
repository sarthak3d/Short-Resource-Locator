'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import styles from '../login/page.module.css';

const STEPS = ['email', 'verify', 'credentials'];

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  const goBack = () => {
    setError('');
    setSuccess('');
    if (step === 2) setCode('');
    setStep(s => s - 1);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email'); return; }
    setLoading(true);
    try {
      await auth.sendEmailCode(email.trim());
      setSuccess('Verification code sent to your email');
      setStep(1);
    } catch (err) {
      const msg = err.body?.message || err.message || 'Failed to send code';
      if (msg.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists.');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!code.trim()) { setError('Please enter the verification code'); return; }
    setLoading(true);
    try {
      await auth.verifyEmailCode(email.trim(), code.trim());
      setSuccess('Email verified successfully');
      setStep(2);
    } catch (err) {
      setError(err.body?.message || err.message || 'Invalid or expired code');
    } finally { setLoading(false); }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!username.trim() || !password.trim()) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await auth.setCredentials(email.trim(), username.trim(), password);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err.body?.message || err.message || 'Failed to create account');
    } finally { setLoading(false); }
  };

  if (isLoading) return null;

  return (
    <div className={styles.authPage}>
      <div className={styles.authGlow} />
      <button className={`btn-ghost ${styles.themeBtn}`} onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        )}
      </button>

      <div className={styles.authCard}>
        <Link href="/" className={styles.authLogo}>SRL</Link>
        <h1 className={styles.authTitle}>Create account</h1>
        <p className={styles.authSubtitle}>
          {step === 0 && 'Enter your email to get started'}
          {step === 1 && `Enter the code sent to ${email}`}
          {step === 2 && 'Set your username and password'}
        </p>

        <div className={styles.stepIndicator}>
          {STEPS.map((_, i) => (
            <div key={i} className={`${styles.stepDot} ${i <= step ? styles.stepDotActive : ''}`} />
          ))}
        </div>

        {error && <div className={styles.errorMsg} style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className={styles.successMsg} style={{ marginBottom: '1rem' }}>{success}</div>}

        {step === 0 && (
          <form onSubmit={handleEmailSubmit} className={styles.authForm}>
            <div className={styles.field}>
              <label htmlFor="signup-email" className="label">Email</label>
              <input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" disabled={loading} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className={styles.btnSpinner} /> : 'Send Verification Code'}
            </button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={handleVerifySubmit} className={styles.authForm}>
            <div className={styles.field}>
              <label htmlFor="signup-code" className="label">Verification Code</label>
              <input id="signup-code" type="text" value={code} onChange={e => setCode(e.target.value)}
                placeholder="Enter 6-digit code" autoComplete="one-time-code" disabled={loading} required />
            </div>
            <div className={styles.btnRow}>
              <button type="button" className="btn btn-outline btn-lg" onClick={goBack} disabled={loading} style={{ flex: 1 }}>
                Back
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 1 }}>
                {loading ? <span className={styles.btnSpinner} /> : 'Verify Code'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCredentialsSubmit} className={styles.authForm}>
            <div className={styles.field}>
              <label htmlFor="signup-username" className="label">Username</label>
              <input id="signup-username" type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Choose a username" autoComplete="username" disabled={loading} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-password" className="label">Password</label>
              <div className={styles.passwordField}>
                <input id="signup-password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Create a password"
                  autoComplete="new-password" disabled={loading} required />
                <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? 'Hide' : 'Show'}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <div className={styles.btnRow}>
              <button type="button" className="btn btn-outline btn-lg" onClick={goBack} disabled={loading} style={{ flex: 1 }}>
                Back
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 1 }}>
                {loading ? <span className={styles.btnSpinner} /> : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <p className={styles.authSwitch}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
