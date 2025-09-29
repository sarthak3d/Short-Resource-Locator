'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { srl, user as userApi } from '@/app/lib/api';
import Topbar from '@/app/components/Topbar';
import styles from './page.module.css';

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SRL_BASE || 'http://localhost:8080';
  return url.startsWith('http') ? url : `https://${url}`;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const loadLinks = useCallback(async () => {
    try {
      const data = await userApi.getSrlList();
      setLinks(Array.isArray(data) ? data : []);
    } catch {
      setLinks([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { loadLinks(); }, [loadLinks]);

  const handleShorten = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const trimmed = url.trim();
    if (!trimmed) { setError('Please enter a URL'); return; }

    try {
      new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const result = await srl.generate(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      setSuccess(typeof result === 'string' ? result : result?.message || 'Link created!');
      setUrl('');
      await loadLinks();
    } catch (err) {
      setError(err.body?.message || err.message || 'Failed to shorten URL');
    } finally { setLoading(false); }
  };

  const handleDelete = async (locator) => {
    if (!user?.userTag) return;
    try {
      await srl.delete(user.userTag, locator);
      setLinks(prev => prev.filter(l => l.locator !== locator));
    } catch (err) {
      setError(err.body?.message || 'Failed to delete link');
    }
  };

  const handleCopy = async (locator) => {
    if (!user?.userTag) return;
    const srlBase = getBaseUrl();
    const shortUrl = `${srlBase}/${user.userTag}/${locator}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(locator);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* clipboard may not be available */
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <Topbar title="Dashboard" />
      <div className={styles.page}>
        <section className={styles.shortenerSection}>
          <div className={`card ${styles.shortenerCard}`}>
            <h2 className={styles.shortenerTitle}>Shorten a URL</h2>
            <form onSubmit={handleShorten} className={styles.shortenerForm}>
              <div className={styles.inputRow}>
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="Paste your long URL here..."
                  className={styles.urlInput}
                  aria-label="URL to shorten"
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <span className={styles.btnSpinner} />
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      Shorten
                    </>
                  )}
                </button>
              </div>
              {error && <p className={styles.formError}>{error}</p>}
              {success && <p className={styles.formSuccess}>{success}</p>}
            </form>
          </div>
        </section>

        <section className={styles.linksSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Links</h2>
            <span className={styles.linkCount}>{links.length} total</span>
          </div>

          {listLoading ? (
            <div className={styles.skeletonList}>
              {[1,2,3].map(i => (<div key={i} className={`skeleton ${styles.skeletonRow}`} />))}
            </div>
          ) : links.length === 0 ? (
            <div className={`card ${styles.emptyState}`}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              <p>No links yet. Shorten your first URL above!</p>
            </div>
          ) : (
            <div className={styles.linksList}>
              {links.map((link, index) => (
                <div key={link.locator || index} className={`card ${styles.linkRow}`} style={{ animationDelay: `${index * 50}ms` }}>
                  <div className={styles.linkInfo}>
                    <div className={styles.linkShort}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      <a 
                        href={`${getBaseUrl()}/${user?.userTag}/${link.locator}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.shortLink}
                      >
                        {link.locator}
                      </a>
                    </div>
                    <p className={`${styles.originalUrl} truncate`}>{link.url}</p>
                    <span className={styles.linkDate}>{formatDate(link.created)}</span>
                  </div>
                  <div className={styles.linkActions}>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleCopy(link.locator)} title="Copy link" aria-label="Copy link">
                      {copiedId === link.locator ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      )}
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(link.locator)} title="Delete link" aria-label="Delete link">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
