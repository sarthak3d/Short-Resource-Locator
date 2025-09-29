import './globals.css';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { AuthProvider } from '@/app/context/AuthContext';

export const metadata = {
  title: 'SRL - Short Resource Locator',
  description: 'Shorten URLs, track clicks, and analyze performance with real-time analytics. A modern, fast URL shortener built for developers and teams.',
  keywords: ['url shortener', 'link analytics', 'short links', 'click tracking', 'srl'],
  authors: [{ name: 'Sarthak Darshan' }],
  metadataBase: new URL('https://srl-frontend.onrender.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SRL - Shorten. Track. Optimize.',
    description: 'A modern URL shortener with real-time analytics.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SRL - Short Resource Locator',
    description: 'A modern, fast URL shortener built for developers and teams.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
