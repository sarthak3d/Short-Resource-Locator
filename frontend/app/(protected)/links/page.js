'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { user as userApi, srl } from '@/app/lib/api';
import Topbar from '@/app/components/Topbar';
import styles from './page.module.css';

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SRL_BASE || 'http://localhost:8080';
  return url.startsWith('http') ? url : `https://${url}`;
};

export default function LinksPage() {
  const { user } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const loadLinks = useCallback(async () => {
    try {
      const data = await userApi.getSrlList();
      setLinks(Array.isArray(data) ? data : []);
    } catch { setLinks([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadLinks(); }, [loadLinks]);

  const handleDelete = async (locator) => {
    if (!user?.userTag || !confirm('Delete this link? This cannot be undone.')) return;
    try {
      await srl.delete(user.userTag, locator);
      setLinks(prev => prev.filter(l => l.locator !== locator));
    } catch { /* handled silently */ }
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
      /* clipboard unavailable */
    }
  };

  const filtered = links.filter(l =>
    l.locator?.toLowerCase().includes(search.toLowerCase()) ||
    l.url?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <>
      <Topbar title="My Links">
        <div className={styles.searchWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search links..." className={styles.searchInput} aria-label="Search links" />
        </div>
      </Topbar>
      <div className={styles.page}>
        {loading ? (
          <div className={styles.skeletonList}>
            {[1,2,3,4,5].map(i => <div key={i} className={`skeleton ${styles.skeletonRow}`} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={`card ${styles.emptyState}`}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <p>{search ? 'No links match your search' : 'No links yet. Create your first one from the Dashboard!'}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((link, index) => (
              <div key={link.locator || index} className={`card ${styles.linkCard}`} style={{ animationDelay: `${index * 40}ms` }}>
                <div className={styles.cardTop}>
                  <div className={styles.linkShort}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    <a 
                      href={`${getBaseUrl()}/${user?.userTag}/${link.locator}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.shortLinkText}
                    >
                      {link.locator}
                    </a>
                  </div>
                  <div className={styles.cardActions}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleCopy(link.locator)} title="Copy">
                      {copiedId === link.locator ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      )}
                    </button>
                    <Link href={`/analytics/${link.locator}`} className="btn btn-ghost btn-icon btn-sm" title="Analytics">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                    </Link>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(link.locator)} title="Delete">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
                <p className={`${styles.originalUrl} truncate`}>{link.url}</p>
                <span className={styles.meta}>{formatDate(link.created)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
