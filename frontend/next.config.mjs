import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async rewrites() {
    const dashboardBase = process.env.NEXT_PUBLIC_DASHBOARD_API || 'http://localhost:8081';
    const analyticsBase = process.env.NEXT_PUBLIC_ANALYTICS_API || 'http://localhost:8082';
    return [
      {
        source: '/api/dashboard/:path*',
        destination: `${dashboardBase}/:path*`,
      },
      {
        source: '/api/analytics/:path*',
        destination: `${analyticsBase}/api/analytics/:path*`,
      },
    ];
  },
};

export default nextConfig;
