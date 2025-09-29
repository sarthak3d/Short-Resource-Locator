'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import styles from './page.module.css';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !passcode.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(identifier.trim(), passcode);
      router.push('/dashboard');
    } catch (err) {
      setError(err.body?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className={styles.authPage}>
      <div className={styles.authGlow} />
      <button className={`btn-ghost ${styles.themeBtn}`} onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </button>

      <div className={styles.authCard}>
        <Link href="/" className={styles.authLogo}>SRL</Link>
        <h1 className={styles.authTitle}>Welcome back</h1>
        <p className={styles.authSubtitle}>Sign in to manage your links and analytics</p>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="login-identifier" className="label">Username</label>
            <input
              id="login-identifier"
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="login-password" className="label">Password</label>
            <div className={styles.passwordField}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className={styles.formFooter}>
            <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? <span className={styles.btnSpinner} /> : 'Sign In'}
          </button>
        </form>

        <p className={styles.authSwitch}>
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
