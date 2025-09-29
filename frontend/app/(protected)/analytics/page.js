'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useTheme } from '@/app/context/ThemeContext';
import { analytics } from '@/app/lib/api';
import Topbar from '@/app/components/Topbar';
import WorldMap, { getCountryName } from '@/app/components/WorldMap';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Filler, Tooltip, Legend } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import styles from './page.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Filler, Tooltip, Legend);

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

function dateStr(date) {
  return date.toISOString().split('T')[0];
}

export default function AnalyticsPage() {
  const { user, fetchAnalyticsToken, clearAnalyticsToken } = useAuth();
  const { theme } = useTheme();
  const [range, setRange] = useState(1);
  const [summary, setSummary] = useState(null);
  const [clicksPerDay, setClicksPerDay] = useState([]);
  const [topBrowsers, setTopBrowsers] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [topOs, setTopOs] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadingRef = useRef(false);

  const loadData = useCallback(async (userTag, rangeIndex) => {
    if (loadingRef.current) return;
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

      const [summaryData, clicksData, browsers, countries, os, referrers] = await Promise.all([
        analytics.getSummary(userTag),
        analytics.getClicksPerDay(userTag, dateStr(start), dateStr(end)),
        analytics.getTopBrowsers(userTag),
        analytics.getTopCountries(userTag),
        analytics.getTopOs(userTag),
        analytics.getTopReferrers(userTag),
      ]);

      setSummary(summaryData);
      setClicksPerDay(Array.isArray(clicksData) ? clicksData : []);
      setTopBrowsers(Array.isArray(browsers) ? browsers : []);
      setTopCountries(Array.isArray(countries) ? countries : []);
      setTopOs(Array.isArray(os) ? os : []);
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
    if (user?.userTag) {
      loadData(user.userTag, range);
    }
  }, [user?.userTag, range]);

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const labelColor = isDark ? '#6B7280' : '#9CA3AF';

  const lineChartData = {
    labels: clicksPerDay.map(d => {
      const dt = new Date(d.date || d.day);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Clicks',
      data: clicksPerDay.map(d => d.count || d.clicks || 0),
      borderColor: '#3B82F6',
      backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#3B82F6',
      borderWidth: 2,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1A1A1C' : '#fff',
        titleColor: isDark ? '#EDEDEF' : '#111827',
        bodyColor: isDark ? '#9CA3AF' : '#4B5563',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1, padding: 12, cornerRadius: 8, displayColors: false,
      },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 11 }, maxTicksLimit: 8 } },
      y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 11 } } },
    },
  };

  const CHART_COLORS = ['#3B82F6', '#22D3EE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#84CC16'];

  const makePieData = (items) => ({
    labels: items.map(i => i.name || 'Unknown'),
    datasets: [{
      data: items.map(i => i.count),
      backgroundColor: CHART_COLORS.slice(0, items.length),
      borderColor: isDark ? '#131314' : '#fff',
      borderWidth: 2,
      hoverOffset: 8,
    }],
  });

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: labelColor, font: { size: 11 }, padding: 12, usePointStyle: true, pointStyle: 'circle' } },
      tooltip: {
        backgroundColor: isDark ? '#1A1A1C' : '#fff',
        titleColor: isDark ? '#EDEDEF' : '#111827',
        bodyColor: isDark ? '#9CA3AF' : '#4B5563',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1, padding: 10, cornerRadius: 8,
      },
    },
  };

  const barData = {
    labels: topReferrers.map(r => r.name || 'Direct'),
    datasets: [{
      label: 'Clicks',
      data: topReferrers.map(r => r.count),
      backgroundColor: '#3B82F6',
      borderRadius: 4,
      barThickness: 20,
    }],
  };

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1A1A1C' : '#fff',
        titleColor: isDark ? '#EDEDEF' : '#111827',
        bodyColor: isDark ? '#9CA3AF' : '#4B5563',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1, padding: 10, cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { color: labelColor, font: { size: 11 } } },
    },
  };

  if (loading) {
    return (
      <>
        <Topbar title="Analytics" />
        <div className={styles.page}>
          <div className={styles.summaryGrid}>
            {[1, 2, 3, 4].map(i => <div key={i} className={`skeleton ${styles.summaryCardSkeleton}`} />)}
          </div>
          <div className={`skeleton ${styles.chartSkeleton}`} />
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Analytics">
        <div className={styles.rangePicker}>
          {RANGES.map((r, i) => (
            <button key={i} className={`${styles.rangeBtn} ${range === i ? styles.rangeBtnActive : ''}`} onClick={() => setRange(i)}>
              {r.label}
            </button>
          ))}
        </div>
      </Topbar>

      <div className={styles.page}>
        {error && (
          <div className={styles.errorBanner}>
            {error}
            {error.includes('expired') && (
              <button className="btn btn-sm btn-outline" style={{ marginLeft: '1rem' }} onClick={() => { clearAnalyticsToken(); loadData(user?.userTag, range); }}>
                Retry
              </button>
            )}
          </div>
        )}

        <div className={styles.summaryGrid}>
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
            <span className={styles.summaryValue}>{getCountryName(topCountries[0]?.name)}</span>
          </div>
          <div className={`card card-glow ${styles.summaryCard}`}>
            <span className={styles.summaryLabel}>Top Browser</span>
            <span className={styles.summaryValue}>{topBrowsers[0]?.name || '--'}</span>
          </div>
        </div>

        <div className={`card ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Clicks Over Time</h3>
          <div className={styles.lineChartWrap}>
            {clicksPerDay.length > 0 ? (
              <Line data={lineChartData} options={lineOptions} />
            ) : (
              <div className={styles.noData}>No click data for this period</div>
            )}
          </div>
        </div>

        <div className={`card ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>Click by Geography</h3>
          <WorldMap data={topCountries} />
        </div>

        <div className={styles.chartsRow}>
          <div className={`card ${styles.chartCard}`}>
            <h3 className={styles.chartTitle}>Browsers</h3>
            <div className={styles.pieChartWrap}>
              {topBrowsers.length > 0 ? (
                <Doughnut data={makePieData(topBrowsers)} options={pieOptions} />
              ) : (
                <div className={styles.noData}>No browser data</div>
              )}
            </div>
          </div>
          <div className={`card ${styles.chartCard}`}>
            <h3 className={styles.chartTitle}>Operating Systems</h3>
            <div className={styles.pieChartWrap}>
              {topOs.length > 0 ? (
                <Doughnut data={makePieData(topOs)} options={pieOptions} />
              ) : (
                <div className={styles.noData}>No OS data</div>
              )}
            </div>
          </div>
          <div className={`card ${styles.chartCard}`}>
            <h3 className={styles.chartTitle}>Top Referrers</h3>
            <div className={styles.barChartWrap}>
              {topReferrers.length > 0 ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <div className={styles.noData}>No referrer data</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
