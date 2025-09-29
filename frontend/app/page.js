'use client';

import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';
import styles from './page.module.css';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.page}>
      <div className={styles.heroGlow} />

      <header className={styles.header}>
        <Link href="/" className={styles.logo}>SRL</Link>
        <div className={styles.headerActions}>
          <button className={`btn-ghost ${styles.themeToggle}`} onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
            )}
          </button>
          <Link href="/login" className="btn btn-outline btn-sm">Log In</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <span className="gradient-text">Shorten.</span>{' '}
              <span className="gradient-text">Track.</span>{' '}
              <span className="gradient-text">Optimize.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Transform long URLs into powerful short links with real-time analytics.
              Track clicks, browsers, countries, and more — all from a single dashboard.
            </p>
          </div>

          <div className={styles.heroVisual}>
            <div className={`${styles.mockCard} ${styles.cardUrl}`}>
              <div className={styles.mockInput}>
                <span className={styles.mockPlaceholder}>https://example.com/very-long-article-url-here</span>
                <span className={styles.mockBtn}>Shorten</span>
              </div>
              <div className={styles.mockResult}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                <span className={styles.shortUrl}>srl.to/abc7x2</span>
                <span className={styles.copyIcon}>Copied!</span>
              </div>
            </div>
          </div>
        </section>



        <section className={styles.features} id="features">
          <h2 className={styles.sectionTitle}>Built for Speed & Insight</h2>
          <div className={styles.featureGrid}>
            <div className={`card card-glow ${styles.featureCard}`}>
              <div className={styles.featureIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              </div>
              <h3>Instant Shortening</h3>
              <p>Generate short, reliable links in milliseconds. No rate limits, no delays.</p>
            </div>
            <div className={`card card-glow ${styles.featureCard}`}>
              <div className={styles.featureIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
              </div>
              <h3>Real-time Analytics</h3>
              <p>Track clicks, devices, referrers, and geographic data with interactive charts and maps.</p>
            </div>
            <div className={`card card-glow ${styles.featureCard}`}>
              <div className={styles.featureIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
              </div>
              <h3>Dashboard & Reports</h3>
              <p>Comprehensive dashboards with graphs, world maps, and filterable per-link analytics.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.footerLogo}>SRL</span>
          <span className={styles.footerCopy}>Short Resource Locator. Built with precision.</span>
        </div>
      </footer>
    </div>
  );
}
