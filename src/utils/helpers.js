import { v4 as uuidv4 } from 'uuid';

export const generateId = () => uuidv4();

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
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

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const calculateOverallScore = (scores) => {
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

export const generateRealityScore = (answers) => {
  const baseScore = 50;
  let score = baseScore;
  if (answers.experience === 'Serial entrepreneur') score += 15;
  else if (answers.experience === 'Currently running one') score += 10;
  else if (answers.experience === 'Tried before') score += 5;
  if (answers.time === 'Full-time') score += 15;
  else if (answers.time === '3–5 hrs/day') score += 10;
  else if (answers.time === '1–2 hrs/day') score += 5;
  if (answers.budget === 'More') score += 10;
  else if (answers.budget === 'Under $1000') score += 5;
  return clamp(score, 10, 98);
};

export const thinkingSteps = [
  { label: 'Thinking...', duration: 800 },
  { label: 'Checking Memory...', duration: 600 },
  { label: 'Researching...', duration: 1000 },
  { label: 'Comparing...', duration: 700 },
  { label: 'Running Reality Engine...', duration: 900 },
  { label: 'Done.', duration: 400 }
];
