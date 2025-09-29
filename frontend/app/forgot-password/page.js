'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/app/lib/api';
import { useTheme } from '@/app/context/ThemeContext';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email'); return; }
    setLoading(true);
    try {
      await auth.forgotPassword(email.trim());
      setSuccess('Reset code sent to your email successfully!');
      setTimeout(() => { setSuccess(''); setStep(1); }, 1500);
    } catch (err) {
      const msg = err.body?.message || err.message || 'Failed to send reset code';
      if (msg.toLowerCase().includes('email not found') || msg.toLowerCase().includes('not found')) {
        setError('No account found with this email address.');
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields'); return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(newPassword)) { setError('Password must contain at least one uppercase letter'); return; }
    if (!/[a-z]/.test(newPassword)) { setError('Password must contain at least one lowercase letter'); return; }
    if (!/[0-9]/.test(newPassword)) { setError('Password must contain at least one number'); return; }
    if (!/[@$!%*?&]/.test(newPassword)) { setError('Password must contain at least one special character (@$!%*?&)'); return; }
    setLoading(true);
    try {
      const response = await auth.resetPassword(email.trim(), code.trim(), newPassword);
      if (response?.message === 'Verification Successful') {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (response?.message === 'Verification Failed') {
        setError('Invalid verification code. Please check and try again.');
      } else if (response?.message === 'Account not found') {
        setError('Account not found. Please check your email address.');
      } else {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => window.location.href = '/login', 2000);
      }
    } catch (err) {
      setError(err.body?.message || err.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  const eyeOff = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
  const eyeOn = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

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
        <h1 className={styles.authTitle}>Reset password</h1>
        <p className={styles.authSubtitle}>
          {step === 0 ? 'Enter your email to receive a reset code' : `Enter the code sent to ${email}`}
        </p>

        {error && <div className={styles.errorMsg} style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className={styles.successMsg} style={{ marginBottom: '1rem' }}>{success}</div>}

        {step === 0 ? (
          <form onSubmit={handleSendCode} className={styles.authForm}>
            <div className={styles.field}>
              <label htmlFor="forgot-email" className="label">Email</label>
              <input id="forgot-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" disabled={loading} required />
            </div>
            <div className={styles.btnRow}>
              <Link href="/login" className="btn btn-outline btn-lg" style={{ flex: 1, textDecoration: 'none' }}>
                Back to Login
              </Link>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 1 }}>
                {loading ? <span className={styles.btnSpinner} /> : 'Send Reset Code'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className={styles.authForm}>
            <div className={styles.field}>
              <label htmlFor="reset-code" className="label">Reset Code</label>
              <input id="reset-code" type="text" value={code} onChange={e => setCode(e.target.value)}
                placeholder="Enter 6-digit code" maxLength={6} disabled={loading} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="reset-password" className="label">New Password</label>
              <div className={styles.passwordField}>
                <input id="reset-password" type={showPassword ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password"
                  autoComplete="new-password" disabled={loading} required />
                <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(p => !p)} aria-label={showPassword ? 'Hide' : 'Show'}>
                  {showPassword ? eyeOff : eyeOn}
                </button>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Min 8 chars, uppercase, lowercase, number, special char
              </span>
            </div>
            <div className={styles.field}>
              <label htmlFor="reset-confirm" className="label">Confirm Password</label>
              <div className={styles.passwordField}>
                <input id="reset-confirm" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
                  autoComplete="new-password" disabled={loading} required />
                <button type="button" className={styles.togglePassword} onClick={() => setShowConfirmPassword(p => !p)} aria-label={showConfirmPassword ? 'Hide' : 'Show'}>
                  {showConfirmPassword ? eyeOff : eyeOn}
                </button>
              </div>
            </div>
            <div className={styles.btnRow}>
              <button type="button" className="btn btn-outline btn-lg" onClick={() => { setStep(0); setError(''); setSuccess(''); }} disabled={loading} style={{ flex: 1 }}>
                Back
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 1 }}>
                {loading ? <span className={styles.btnSpinner} /> : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        <p className={styles.authSwitch}>
          Remember your password? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
