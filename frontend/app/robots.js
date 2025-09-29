export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Prevent search engines from crawling protected internal dashboards and analytics
      disallow: ['/dashboard/', '/analytics/'],
    },
    sitemap: 'https://srl-frontend.onrender.com/sitemap.xml',
  };
}
