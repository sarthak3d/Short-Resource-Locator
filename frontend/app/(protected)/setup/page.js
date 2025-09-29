'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { user as userApi } from '@/app/lib/api';
import styles from './page.module.css';

export default function SetupProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [userTag, setUserTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.userTag) {
      router.replace('/dashboard');
    }
  }, [user?.userTag, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (userTag.length !== 4) { setError('User tag must be exactly 4 characters'); return; }
    if (!/^[a-zA-Z0-9]+$/.test(userTag)) { setError('User tag can only contain letters and numbers'); return; }

    setLoading(true);
    try {
      await userApi.submitDetails(name.trim(), userTag.toLowerCase());
      await refreshUser();
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>SRL</div>
        <h1 className={styles.title}>Complete your profile</h1>
        <p className={styles.subtitle}>Set your display name and a unique 4-character user tag to get started</p>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="setup-name" className="label">Display Name</label>
            <input
              id="setup-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              autoFocus
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="setup-tag" className="label">
              User Tag
              <span className={styles.tagHint}>4 characters, letters/numbers only</span>
            </label>
            <input
              id="setup-tag"
              type="text"
              value={userTag}
              onChange={e => setUserTag(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4))}
              placeholder="e.g. adm1"
              maxLength={4}
              required
            />
            <span className={styles.charCount}>{userTag.length}/4</span>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
