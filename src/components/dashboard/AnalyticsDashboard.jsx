import React, { useState } from 'react';
import { useBusinessStore } from '../../store/businessStore';
import { useShallow } from 'zustand/react/shallow';
import { getScoreColor, calculateOverallScore } from '../../utils/helpers';
import { TrendingUp, DollarSign, Users, Activity, Flame, BarChart3, Brain, ArrowUp, ArrowDown, Info, Sparkles } from 'lucide-react';

const METRIC_EXPLANATIONS = {
  revenue: 'Total revenue generated. A measure of your startup\'s ability to convert customers into paying users.',
  userGrowth: 'Rate at which your user base is expanding month-over-month. Indicates market traction.',
  mrr: 'Monthly Recurring Revenue — predictable revenue stream. Key SaaS metric for valuation.',
  retention: 'Percentage of customers who continue using your product over time. Higher retention = stronger product-market fit.',
  burnRate: 'Monthly cash consumption. How fast you\'re spending vs earning. Critical for runway planning.',
  growthScore: 'Composite growth indicator derived from execution, business health, and customer traction.',
};

function MetricTooltip({ explanation }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ cursor: 'pointer', display: 'flex', color: 'var(--color-text-muted)' }}
      >
        <Info size={12} />
      </div>
      {show && (
        <div style={styles.tooltip}>
          {explanation}
        </div>
      )}
    </div>
  );
}

const MetricCard = React.memo(function MetricCard({ title, value, subtitle, icon: Icon, color, trend, trendLabel, explanation }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon size={14} style={{ color }} />
          <span style={styles.metricTitle}>{title}</span>
        </div>
        <MetricTooltip explanation={explanation} />
      </div>
      <div style={styles.metricValueRow}>
        <span style={{ ...styles.metricValue, color }}>{value}</span>
        {trend !== undefined && (
          <span style={{
            ...styles.trendBadge,
            color: trend >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
            background: trend >= 0 ? 'var(--color-success-subtle)' : 'var(--color-danger-subtle)',
          }}>
            {trend >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {subtitle && <span style={styles.metricSubtitle}>{subtitle}</span>}
      {trendLabel && <span style={styles.trendLabel}>{trendLabel}</span>}
    </div>
  );
});

function AIInsight({ insights }) {
  return (
    <div style={styles.insightPanel}>
      <h3 style={styles.insightTitle}>
        <Sparkles size={16} style={{ color: 'var(--color-accent-light)' }} />
        AI Insights
      </h3>
      <div style={styles.insightContent}>
        {insights.map((insight, i) => (
          <div key={i} style={styles.insightRow}>
            <span style={styles.insightBullet} />
            <span style={styles.insightText}>{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { businessHealth, startupScore } = useBusinessStore(
    useShallow(s => ({ businessHealth: s.businessHealth, startupScore: s.startupScore }))
  );

  const overallHealth = calculateOverallScore(businessHealth);
  const avgStartupScore = calculateOverallScore(startupScore);

  const revenue = Math.round((startupScore.business * 120 + startupScore.cash * 80) / 100);
  const revenueTrend = Math.round((startupScore.business - 50) * 0.6);

  const userGrowth = Math.max(0, Math.round(startupScore.customers * 1.4));
  const userGrowthTrend = Math.round((startupScore.customers - 40) * 0.8);

  const mrr = Math.round(revenue * 0.65);
  const mrrTrend = Math.round((startupScore.cash - 45) * 0.5);

  const retention = Math.max(0, Math.min(100, Math.round(
    (businessHealth.product * 0.4 + businessHealth.marketing * 0.3 + businessHealth.sales * 0.3)
  )));
  const retentionTrend = Math.round((retention - 50) * 0.4);

  const burnRate = Math.max(0, Math.round((100 - businessHealth.finance) * 1.8));
  const burnRateTrend = Math.round((businessHealth.finance - 50) * 0.7);

  const growthScore = Math.max(0, Math.min(100, Math.round(
    (avgStartupScore * 0.5 + overallHealth * 0.3 + startupScore.customers * 0.2)
  )));
  const growthTrend = Math.round((growthScore - 50) * 0.3);

  const formatCurrency = (val) => `$${val.toLocaleString()}`;

  const insights = [];

  if (revenue < 100) {
    insights.push('Revenue is still early-stage. Focus on closing first paying customers to validate demand and build a repeatable sales motion.');
  } else if (revenue < 500) {
    insights.push('Revenue is growing but hasn\'t reached stability. Double down on your highest-converting channel to accelerate MRR growth.');
  } else {
    insights.push('Revenue trajectory looks healthy. Consider expanding to adjacent segments or upselling existing customers to increase LTV.');
  }

  if (retention < 40) {
    insights.push('Retention is below target — customers may not be getting enough ongoing value. Conduct exit interviews and review onboarding flows.');
  } else if (retention < 65) {
    insights.push('Retention is moderate. Improve engagement loops and consider adding usage-based triggers to bring users back more frequently.');
  } else {
    insights.push('Strong retention indicates solid product-market fit. Shift focus toward acquisition to grow the top of the funnel.');
  }

  if (burnRate > 60) {
    insights.push('Burn rate is high relative to revenue. Review non-essential spending and consider extending runway before the next fundraising round.');
  } else if (burnRate > 30) {
    insights.push('Burn rate is manageable. Maintain current discipline while investing in growth channels with proven unit economics.');
  } else {
    insights.push('Burn rate is well-controlled. This is the right time to invest aggressively in scalable acquisition channels.');
  }

  if (userGrowth < 30) {
    insights.push('User growth needs attention. Experiment with referral programs, content marketing, or partnerships to drive new signups.');
  } else {
    insights.push('User growth is on track. Keep monitoring cohort quality to ensure new users convert at similar rates to existing ones.');
  }

  insights.push(`Your composite Growth Score of ${growthScore}% reflects the balance of all business dimensions. Review the cards above to identify which metric needs the most immediate action.`);

  return (
    <div style={styles.page} className="page-enter">
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Analytics</h1>
          <p style={styles.subtitle}>Key metrics your AI co-founder tracks for you</p>
        </div>
        <div style={styles.headerRight}>
          <span className="badge badge-warning"><Activity size={10} /> Projected</span>
        </div>
      </div>

      <div style={{ padding: '0.75rem 1rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
        These are projected metrics based on your business health scores. They will update with real data as you connect analytics and payment providers.
      </div>

      <div style={styles.grid}>
        <MetricCard
          title="Revenue"
          value={formatCurrency(revenue)}
          subtitle="Total revenue to date"
          icon={DollarSign}
          color="var(--color-success)"
          trend={revenueTrend}
          explanation={METRIC_EXPLANATIONS.revenue}
        />
        <MetricCard
          title="User Growth"
          value={`${userGrowth}%`}
          subtitle="Monthly active user increase"
          icon={TrendingUp}
          color="var(--color-accent-light)"
          trend={userGrowthTrend}
          explanation={METRIC_EXPLANATIONS.userGrowth}
        />
        <MetricCard
          title="MRR"
          value={formatCurrency(mrr)}
          subtitle="Monthly Recurring Revenue"
          icon={BarChart3}
          color="var(--color-info-light)"
          trend={mrrTrend}
          explanation={METRIC_EXPLANATIONS.mrr}
        />
        <MetricCard
          title="Retention Rate"
          value={`${retention}%`}
          subtitle="Customer retention over time"
          icon={Users}
          color="var(--color-warning-light)"
          trend={retentionTrend}
          explanation={METRIC_EXPLANATIONS.retention}
        />
        <MetricCard
          title="Burn Rate"
          value={`${burnRate}%`}
          subtitle="Monthly cash consumption rate"
          icon={Flame}
          color="var(--color-danger-light)"
          trend={burnRateTrend}
          trendLabel={burnRate > 50 ? 'High burn — review spending' : 'Sustainable'}
          explanation={METRIC_EXPLANATIONS.burnRate}
        />
        <MetricCard
          title="Growth Score"
          value={`${growthScore}%`}
          subtitle="Composite growth indicator"
          icon={Brain}
          color={getScoreColor(growthScore)}
          trend={growthTrend}
          explanation={METRIC_EXPLANATIONS.growthScore}
        />
      </div>

      <AIInsight insights={insights} />
    </div>
  );
}

const styles = {
  page: { maxWidth: '1200px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  pageTitle: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' },
  subtitle: { color: 'var(--color-text-tertiary)', fontSize: '0.9375rem', marginTop: '0.25rem' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  metricCard: {
    padding: '1.25rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  metricHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  metricTitle: { fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' },
  metricValueRow: { display: 'flex', alignItems: 'baseline', gap: '0.5rem' },
  metricValue: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' },
  trendBadge: { display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.6875rem', fontWeight: 600, padding: '2px 6px', borderRadius: '6px' },
  metricSubtitle: { fontSize: '0.75rem', color: 'var(--color-text-muted)' },
  trendLabel: { fontSize: '0.6875rem', color: 'var(--color-text-muted)' },
  tooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 6px)',
    right: 0,
    width: '220px',
    padding: '0.5rem 0.75rem',
    background: 'rgba(20,21,40,0.98)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
    zIndex: 100,
    pointerEvents: 'none',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(12px)',
  },
  insightPanel: {
    padding: '1.25rem',
    background: 'rgba(99,102,241,0.04)',
    borderRadius: '16px',
    border: '1px solid rgba(99,102,241,0.12)',
  },
  insightTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' },
  insightContent: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  insightRow: { display: 'flex', gap: '0.5rem', alignItems: 'flex-start' },
  insightBullet: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--color-accent-light)',
    marginTop: '0.5rem',
    flexShrink: 0,
  },
  insightText: { fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 },
};
