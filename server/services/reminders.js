import { logger } from './logger.js';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

const sendWhatsApp = async (to, message) => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    logger.warn('[Reminders] Twilio not configured. Would have sent:', message);
    return;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const body = new URLSearchParams({
      From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      To: `whatsapp:${to}`,
      Body: message,
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Twilio error ${res.status}: ${errText}`);
    }

    logger.info(`[Reminders] WhatsApp sent to ${to}`);
  } catch (err) {
    logger.error(`[Reminders] Failed to send WhatsApp: ${err.message}`);
  }
};

export const sendMorningReminder = async (phone, name, tasks) => {
  const taskList = tasks?.length
    ? tasks.slice(0, 3).map(t => `• ${t.title || t}`).join('\n')
    : '• Review your business blueprint\n• Complete today\'s priority task';
  
  const message = `☀️ Good morning ${name || 'Founder'}! Here's your AI Co-Founder plan for today:\n\n${taskList}\n\nLet's make progress! 🚀`;
  await sendWhatsApp(phone, message);
};

export const sendEveningReminder = async (phone, name, tasks) => {
  const pendingTasks = tasks?.filter(t => t.status !== 'completed' && t.status !== 'done');
  const pendingCount = pendingTasks?.length || 0;
  
  const message = `🌆 Evening check-in, ${name || 'Founder'}!\n\nYou had ${pendingCount} task${pendingCount !== 1 ? 's' : ''} remaining today.\n${pendingCount > 0 ? 'Take 15 minutes to wrap up what you can.' : 'Great job completing everything! 🎉'}\n\nReview your progress in the AI Co-Founder dashboard.`;
  await sendWhatsApp(phone, message);
};

let reminderInterval = null;

export const startReminderScheduler = () => {
  if (reminderInterval) return;
  logger.info('[Reminders] Scheduler started');

  const checkAndSend = async () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (hours === 9 && minutes === 0) {
      logger.info('[Reminders] Morning reminder time');
      try {
        const { getDb } = await import('../db/database.js');
        const supabase = getDb();
        if (supabase) {
          const { data: users } = await supabase.from('users').select('id, name, email').limit(50);
          for (const user of users || []) {
            const { data: tasks } = await supabase
              .from('tasks').select('title, status')
              .eq('user_id', user.id)
              .eq('status', 'todo')
              .limit(5);
            const phone = process.env[`WHATSAPP_${user.email.replace(/[@.]/g, '_').toUpperCase()}`];
            if (phone) await sendMorningReminder(phone, user.name, tasks);
          }
        }
      } catch (err) {
        logger.error(`[Reminders] Morning batch failed: ${err.message}`);
      }
    }

    if (hours === 18 && minutes === 0) {
      logger.info('[Reminders] Evening reminder time');
      try {
        const { getDb } = await import('../db/database.js');
        const supabase = getDb();
        if (supabase) {
          const { data: users } = await supabase.from('users').select('id, name, email').limit(50);
          for (const user of users || []) {
            const { data: tasks } = await supabase
              .from('tasks').select('title, status')
              .eq('user_id', user.id)
              .limit(10);
            const phone = process.env[`WHATSAPP_${user.email.replace(/[@.]/g, '_').toUpperCase()}`];
            if (phone) await sendEveningReminder(phone, user.name, tasks);
          }
        }
      } catch (err) {
        logger.error(`[Reminders] Evening batch failed: ${err.message}`);
      }
    }
  };

  checkAndSend();
  reminderInterval = setInterval(checkAndSend, 60000);
};

export const stopReminderScheduler = () => {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
    logger.info('[Reminders] Scheduler stopped');
  }
};
