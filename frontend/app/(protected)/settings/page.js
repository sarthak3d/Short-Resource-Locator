'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import { auth as authApi, user as userApi } from '@/app/lib/api';
import Topbar from '@/app/components/Topbar';
import styles from './page.module.css';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    if (!name.trim()) {
      setProfileMsg({ type: 'error', text: 'Name is required' });
      return;
    }
    setProfileLoading(true);
    try {
      await userApi.updateDetails(name.trim(), user?.userTag || '');
      await refreshUser();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.body?.message || err.message || 'Failed to update profile' });
    } finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    if (!oldPassword || !newPassword) {
      setPasswordMsg({ type: 'error', text: 'Both fields are required' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setPasswordMsg({ type: 'success', text: 'Password changed successfully' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.body?.message || err.message || 'Failed to change password' });
    } finally { setPasswordLoading(false); }
  };

  return (
    <>
      <Topbar title="Settings" />
      <div className={styles.page}>
        <div className={`card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>Appearance</h3>
          <div className={styles.themeRow}>
            <div>
              <p className={styles.themeLabel}>Theme</p>
              <p className={styles.themeDesc}>Switch between light and dark mode</p>
            </div>
            <button className={`btn btn-outline ${styles.themeBtn}`} onClick={toggleTheme}>
              {theme === 'dark' ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                  Light Mode
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </div>

        <div className={`card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>Profile</h3>
          <form onSubmit={handleProfileUpdate} className={styles.form}>
            {profileMsg.text && (
              <div className={profileMsg.type === 'error' ? styles.errorMsg : styles.successMsg}>{profileMsg.text}</div>
            )}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="settings-name" className="label">Name</label>
                <input id="settings-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className={styles.field}>
                <label className="label">User Tag <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', fontSize: '0.75rem' }}></span></label>
                <input type="text" value={user?.userTag || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>
            <div className={styles.field}>
              <label className="label">Email</label>
              <input type="text" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className={`card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>Change Password</h3>
          <form onSubmit={handlePasswordChange} className={styles.form}>
            {passwordMsg.text && (
              <div className={passwordMsg.type === 'error' ? styles.errorMsg : styles.successMsg}>{passwordMsg.text}</div>
            )}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="settings-oldpw" className="label">Current Password</label>
                <input id="settings-oldpw" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Current password" autoComplete="current-password" />
              </div>
              <div className={styles.field}>
                <label htmlFor="settings-newpw" className="label">New Password</label>
                <input id="settings-newpw" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" autoComplete="new-password" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
