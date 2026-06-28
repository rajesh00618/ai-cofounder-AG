import { v4 as uuidv4 } from 'uuid';

export const generateId = () => uuidv4();

export const delay = (ms) => {
  if (typeof ms !== 'number' || ms < 0) return Promise.reject(new Error('delay: ms must be a non-negative number'));
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const formatDate = (date) => {
  if (date == null) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

export const formatTime = (date) => {
  if (date == null) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });
};

export const getScoreColor = (score) => {
  if (score >= 80) return 'var(--color-success)';
  if (score >= 60) return 'var(--color-accent)';
  if (score >= 40) return 'var(--color-warning)';
  return 'var(--color-danger)';
};

export const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Needs Work';
  return 'Critical';
};

export const clamp = (val, min, max) => {
  if (min > max) [min, max] = [max, min];
  return Math.min(Math.max(val, min), max);
};

export const randomBetween = (min, max) => {
  if (min > max) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const truncateText = (text, maxLength = 100) => {
  if (text == null) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const calculateOverallScore = (scores) => {
  if (scores == null || typeof scores !== 'object') return 0;
  const values = Object.values(scores).filter(v => typeof v === 'number');
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const thinkingSteps = [
  { label: 'Thinking...', duration: 800 },
  { label: 'Checking Memory...', duration: 600 },
  { label: 'Researching...', duration: 1000 },
  { label: 'Comparing...', duration: 700 },
  { label: 'Running Reality Engine...', duration: 900 },
  { label: 'Done.', duration: 400 }
];
