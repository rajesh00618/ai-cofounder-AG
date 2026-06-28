import React, { useState } from 'react';
import { useBusinessStore } from '../../store/businessStore';
import { useShallow } from 'zustand/react/shallow';
import { getScoreColor, calculateOverallScore } from '../../utils/helpers';
import { TrendingUp, DollarSign, Users, Activity, Flame, BarChart3, Brain, Lightbulb, Info, Sparkles } from 'lucide-react';

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

const MetricCard = React.memo(function MetricCard({ title, value, subtitle, icon: Icon, color, explanation }) {
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
      </div>
      {subtitle && <span style={styles.metricSubtitle}>{subtitle}</span>}
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
        {insights.map((insight) => (
          <div key={`ins-${insight.slice(0,20)}`} style={styles.insightRow}>
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
  const _avgStartupScore = calculateOverallScore(startupScore);

  const ideaScore = businessHealth.idea || 0;
  const validationScore = businessHealth.validation || 0;
  const productScore = businessHealth.product || 0;
  const marketingScore = businessHealth.marketing || 0;
  const salesScore = businessHealth.sales || 0;
  const financeScore = businessHealth.finance || 0;

  const executionScore = startupScore.execution || 0;
  const customerScore = startupScore.customers || 0;
  const _aiConfidence = startupScore.aiConfidence || 50;

  const insights = [];

  if (ideaScore < 30) {
    insights.push('Idea clarity is low. Revisit your problem statement and validate that you\'re solving a real, painful customer problem.');
  } else if (ideaScore >= 70) {
    insights.push('Strong idea foundation. Move quickly to validation — don\'t let analysis paralysis slow you down.');
  }

  if (validationScore < 30) {
    insights.push('Validation is critical — interview 10 target customers before building anything. Assumptions without data are liabilities.');
  } else if (validationScore < 60) {
    insights.push('Validation is in progress. Double down on customer interviews and landing page tests to confirm demand.');
  }

  if (productScore < 30) {
    insights.push('Product needs attention. Focus on shipping an MVP that solves one core problem well — don\'t build everything at once.');
  }

  if (marketingScore < 30) {
    insights.push('Marketing is a weak spot. Start with one channel, master it, then expand. Don\'t spread thin across 5 platforms.');
  }

  if (salesScore < 30) {
    insights.push('Sales pipeline is empty. Your next priority is finding and closing your first paying customers — everything else can wait.');
  }

  if (financeScore < 30) {
    insights.push('Financial health needs work. Track every dollar, extend your runway, and validate willingness to pay before scaling spend.');
  }

  if (executionScore < 40) {
    insights.push('Execution score is low. Break tasks into smaller chunks and focus on completing one thing at a time.');
  }

  if (insights.length === 0) {
    insights.push('All dimensions are above 30%. You\'re in good shape — focus on the lowest-scoring area to accelerate growth.');
  }

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
          title="Idea Clarity"
          value={`${ideaScore}%`}
          subtitle="How well-defined is your idea"
          icon={Lightbulb}
          color={getScoreColor(ideaScore)}
          explanation="Measures how clear and specific your problem/solution fit is."
        />
        <MetricCard
          title="Validation"
          value={`${validationScore}%`}
          subtitle="Customer demand confirmed"
          icon={Users}
          color={getScoreColor(validationScore)}
          explanation="How much real customer evidence you have that people will pay for this."
        />
        <MetricCard
          title="Product"
          value={`${productScore}%`}
          subtitle="Product readiness"
          icon={TrendingUp}
          color={getScoreColor(productScore)}
          explanation="How close your product is to solving the core problem effectively."
        />
        <MetricCard
          title="Marketing"
          value={`${marketingScore}%`}
          subtitle="Go-to-market strength"
          icon={BarChart3}
          color={getScoreColor(marketingScore)}
          explanation="Your ability to reach and convert target customers."
        />
        <MetricCard
          title="Sales"
          value={`${salesScore}%`}
          subtitle="Revenue generation"
          icon={DollarSign}
          color={getScoreColor(salesScore)}
          explanation="Your sales pipeline and ability to close paying customers."
        />
        <MetricCard
          title="Finance"
          value={`${financeScore}%`}
          subtitle="Financial health"
          icon={Flame}
          color={getScoreColor(financeScore)}
          explanation="Runway, burn rate, and unit economics sustainability."
        />
      </div>

      <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '1rem' }}>
        <MetricCard
          title="Execution"
          value={`${executionScore}%`}
          subtitle="Task completion rate"
          icon={Activity}
          color={getScoreColor(executionScore)}
          explanation="How consistently you ship and hit deadlines."
        />
        <MetricCard
          title="Customer Traction"
          value={`${customerScore}%`}
          subtitle="Market penetration"
          icon={Users}
          color={getScoreColor(customerScore)}
          explanation="Real customer engagement and growth signals."
        />
        <MetricCard
          title="Overall Health"
          value={`${overallHealth}%`}
          subtitle="Composite business score"
          icon={Brain}
          color={getScoreColor(overallHealth)}
          explanation="Weighted average across all business dimensions."
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
