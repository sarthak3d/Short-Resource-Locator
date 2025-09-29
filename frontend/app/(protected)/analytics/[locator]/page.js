'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import { analytics } from '@/app/lib/api';
import Topbar from '@/app/components/Topbar';
import WorldMap from '@/app/components/WorldMap';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import styles from '../../analytics/page.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend);

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

function dateStr(date) { return date.toISOString().split('T')[0]; }

export default function LocatorAnalyticsPage({ params }) {
  const resolvedParams = use(params);
  const locator = resolvedParams.locator;
  const { user, fetchAnalyticsToken, clearAnalyticsToken } = useAuth();
  const { theme } = useTheme();
  const [range, setRange] = useState(1);
  const [summary, setSummary] = useState(null);
  const [clicksPerDay, setClicksPerDay] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadingRef = useRef(false);

  const loadData = useCallback(async (userTag, loc, rangeIndex) => {
    if (!userTag || !loc || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError('');
    try {
      let analyticsToken = localStorage.getItem('srl_analytics_token');
      if (!analyticsToken) {
        analyticsToken = await fetchAnalyticsToken();
      }
      if (!analyticsToken) {
        setError('Could not obtain analytics token. Please log out and back in.');
        return;
      }
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - RANGES[rangeIndex].days);

      const [summaryData, clicksData, countries, referrers] = await Promise.all([
        analytics.getLocatorSummary(userTag, loc),
        analytics.getLocatorClicksPerDay(userTag, loc, dateStr(start), dateStr(end)),
        analytics.getLocatorTopCountries(userTag, loc),
        analytics.getLocatorTopReferrers(userTag, loc),
      ]);

      setSummary(summaryData);
      setClicksPerDay(Array.isArray(clicksData) ? clicksData : []);
      setTopCountries(Array.isArray(countries) ? countries : []);
      setTopReferrers(Array.isArray(referrers) ? referrers : []);
    } catch (err) {
      if (err.status === 403) {
        clearAnalyticsToken();
        setError('Analytics session expired. Please refresh the page.');
      } else {
        setError(err.message || 'Failed to load analytics');
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchAnalyticsToken, clearAnalyticsToken]);

  useEffect(() => {
    if (user?.userTag && locator) {
      loadData(user.userTag, locator, range);
    }
  }, [user?.userTag, locator, range]);

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const labelColor = isDark ? '#6B7280' : '#9CA3AF';
  const CHART_COLORS = ['#3B82F6', '#22D3EE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316'];

  const lineChartData = {
    labels: clicksPerDay.map(d => new Date(d.date || d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Clicks',
      data: clicksPerDay.map(d => d.count || d.clicks || 0),
      borderColor: '#3B82F6',
      backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)',
      fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 6, pointHoverBackgroundColor: '#3B82F6', borderWidth: 2,
    }],
  };

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: false }, tooltip: { backgroundColor: isDark ? '#1A1A1C' : '#fff', titleColor: isDark ? '#EDEDEF' : '#111827', bodyColor: isDark ? '#9CA3AF' : '#4B5563', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8, displayColors: false } },
    scales: { x: { grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 11 }, maxTicksLimit: 8 } }, y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 11 } } } },
  };

  const referrerPieData = {
    labels: topReferrers.map(r => r.name || 'Direct'),
    datasets: [{ data: topReferrers.map(r => r.count), backgroundColor: CHART_COLORS.slice(0, topReferrers.length), borderColor: isDark ? '#131314' : '#fff', borderWidth: 2, hoverOffset: 8 }],
  };
  const pieOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: labelColor, font: { size: 11 }, padding: 12, usePointStyle: true, pointStyle: 'circle' } }, tooltip: { backgroundColor: isDark ? '#1A1A1C' : '#fff', titleColor: isDark ? '#EDEDEF' : '#111827', bodyColor: isDark ? '#9CA3AF' : '#4B5563', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderWidth: 1, padding: 10, cornerRadius: 8 } },
  };

  if (loading) {
    return (
      <>
        <Topbar title={`Analytics: ${locator}`} />
        <div className={styles.page}>
          <div className={styles.summaryGrid}>{[1, 2, 3].map(i => <div key={i} className={`skeleton ${styles.summaryCardSkeleton}`} />)}</div>
          <div className={`skeleton ${styles.chartSkeleton}`} />
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title={`Analytics: ${locator}`}>
        <div className={styles.rangePicker}>
          {RANGES.map((r, i) => (
            <button key={i} className={`${styles.rangeBtn} ${range === i ? styles.rangeBtnActive : ''}`} onClick={() => setRange(i)}>{r.label}</button>
          ))}
        </div>
      </Topbar>

      <div className={styles.page}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.summaryGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className={`card card-glow ${styles.summaryCard}`}>
            <span className={styles.summaryLabel}>Total Clicks</span>
            <span className={styles.summaryValue}>{summary?.totalClicks?.toLocaleString() ?? '0'}</span>
          </div>
          <div className={`card card-glow ${styles.summaryCard}`}>
            <span className={styles.summaryLabel}>Unique Clicks</span>
            <span className={styles.summaryValue}>{summary?.uniqueClicks?.toLocaleString() ?? '0'}</span>
          </div>
          <div className={`card card-glow ${styles.summaryCard}`}>
            <span className={styles.summaryLabel}>Top Country</span>
            <span className={styles.summaryValue}>{topCountries[0]?.name || '--'}</span>
          </div>
        </div>

        <div className={`card ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Clicks Over Time</h3>
          <div className={styles.lineChartWrap}>
            {clicksPerDay.length > 0 ? <Line data={lineChartData} options={lineOptions} /> : <div className={styles.noData}>No click data for this period</div>}
          </div>
        </div>

        <div className={`card ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Click by Geography</h3>
          <WorldMap data={topCountries} />
        </div>

        <div className={styles.chartsRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className={`card ${styles.chartCard}`}>
            <h3 className={styles.chartTitle}>Referrers</h3>
            <div className={styles.pieChartWrap}>
              {topReferrers.length > 0 ? <Doughnut data={referrerPieData} options={pieOptions} /> : <div className={styles.noData}>No referrer data</div>}
            </div>
          </div>
          <div className={`card ${styles.chartCard}`}>
            <h3 className={styles.chartTitle}>Countries</h3>
            <div className={styles.pieChartWrap}>
              {topCountries.length > 0 ? (
                <Doughnut data={{
                  labels: topCountries.map(c => c.name),
                  datasets: [{ data: topCountries.map(c => c.count), backgroundColor: CHART_COLORS.slice(0, topCountries.length), borderColor: isDark ? '#131314' : '#fff', borderWidth: 2, hoverOffset: 8 }],
                }} options={pieOptions} />
              ) : <div className={styles.noData}>No country data</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
