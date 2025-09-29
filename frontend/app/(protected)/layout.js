'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { SidebarProvider, useSidebar } from '@/app/context/SidebarContext';
import Sidebar from '@/app/components/Sidebar';
import styles from './layout.module.css';

function LayoutShell({ children }) {
  const { mobileOpen, closeSidebar } = useSidebar();

  return (
    <div className={styles.shell}>
      <Sidebar mobileOpen={mobileOpen} onClose={closeSidebar} />
      <div className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user && !user.userTag && pathname !== '/setup') {
      router.replace('/setup');
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (pathname === '/setup') {
    return <>{children}</>;
  }

  if (user && !user.userTag) return null;

  return (
    <SidebarProvider>
      <LayoutShell>{children}</LayoutShell>
    </SidebarProvider>
  );
}
