import { getDb } from '../db/database.js';
import { logger } from './logger.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const registerTelegramChatId = async (email, chatId) => {
  try {
    const supabase = getDb();
    if (supabase) {
      const { error } = await supabase
        .from('users')
        .update({ telegram_chat_id: chatId })
        .eq('email', email);
      if (error) throw error;
    }
    logger.info(`[Reminders] Telegram chat ID registered for ${email.replace(/./g, '*')}`);
  } catch (err) {
    logger.error(`[Reminders] Failed to persist chat ID for ${email.replace(/./g, '*')}: ${err.message}`);
    throw err;
  }
};

export const getTelegramChatIdForEmail = async (email) => {
  try {
    const supabase = getDb();
    if (supabase) {
      const { data } = await supabase
        .from('users')
        .select('telegram_chat_id')
        .eq('email', email)
        .maybeSingle();
      if (data?.telegram_chat_id) return data.telegram_chat_id;
    }
  } catch (err) {
    logger.warn(`[Reminders] DB lookup failed for ${email}: ${err.message}`);
  }
  return null;
};

const sendTelegram = async (chatId, message) => {
  if (!TELEGRAM_BOT_TOKEN) {
    logger.warn('[Reminders] Telegram bot not configured. Would have sent:', message);
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(`Telegram error ${res.status}: ${errBody.description || res.statusText}`);
    }

    logger.info(`[Reminders] Telegram message sent to chat ${chatId}`);
  } catch (err) {
    logger.error(`[Reminders] Failed to send Telegram: ${err.message}`);
  }
};

export const sendMorningReminder = async (chatId, name, tasks) => {
  const taskList = tasks?.length
    ? tasks.slice(0, 3).map(t => `• ${t.title || t}`).join('\n')
    : '• Review your business blueprint\n• Complete today\'s priority task';
  
  const message = `☀️ Good morning ${name || 'Founder'}! Here's your AI Co-Founder plan for today:\n\n${taskList}\n\nLet's make progress! 🚀`;
  await sendTelegram(chatId, message);
};

export const sendEveningReminder = async (chatId, name, tasks) => {
  const pendingTasks = tasks?.filter(t => t.status !== 'completed' && t.status !== 'done');
  const pendingCount = pendingTasks?.length || 0;
  
  const message = `🌆 Evening check-in, ${name || 'Founder'}!\n\nYou had ${pendingCount} task${pendingCount !== 1 ? 's' : ''} remaining today.\n${pendingCount > 0 ? 'Take 15 minutes to wrap up what you can.' : 'Great job completing everything! 🎉'}\n\nReview your progress in the AI Co-Founder dashboard.`;
  await sendTelegram(chatId, message);
};

let reminderTimeout = null;

const scheduleNextReminderCheck = () => {
  reminderTimeout = setTimeout(async () => {
    await checkAndSend();
    scheduleNextReminderCheck();
  }, 60000);
  if (reminderTimeout?.unref) reminderTimeout.unref();
};

const checkAndSend = async () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const sendRemindersForUsers = async (isMorning) => {
    try {
      const supabase = getDb();
      if (!supabase) return;
      let offset = 0;
      const PAGE_SIZE = 50;
      let allUsers = [];
      while (true) {
        const { data: users } = await supabase
          .from('users')
          .select('id, name, email, telegram_chat_id')
          .not('telegram_chat_id', 'is', null)
          .range(offset, offset + PAGE_SIZE - 1);
        if (!users?.length) break;
        allUsers = allUsers.concat(users);
        offset += PAGE_SIZE;
      }
      if (!allUsers.length) return;

      const userIds = allUsers.map(u => u.id);
      const tasksRes = await supabase
        .from('tasks').select('user_id, title, status')
        .in('user_id', userIds);
      const tasksByUser = {};
      for (const t of (tasksRes.data || [])) {
        if (!tasksByUser[t.user_id]) tasksByUser[t.user_id] = [];
        tasksByUser[t.user_id].push(t);
      }

      for (const user of allUsers) {
        const userTasks = (tasksByUser[user.id] || []).slice(0, 10);
        if (!user.telegram_chat_id) continue;
        if (isMorning) {
          await sendMorningReminder(user.telegram_chat_id, user.name, userTasks.filter(t => t.status === 'todo'));
        } else {
          await sendEveningReminder(user.telegram_chat_id, user.name, userTasks);
        }
      }
    } catch (err) {
      logger.error(`[Reminders] Batch failed: ${err.message}`);
    }
  };

  if (hours === 9 && minutes === 0) {
    logger.info('[Reminders] Morning reminder time');
    await sendRemindersForUsers(true);
  }

  if (hours === 18 && minutes === 0) {
    logger.info('[Reminders] Evening reminder time');
    await sendRemindersForUsers(false);
  }
};

export const startReminderScheduler = () => {
  if (reminderTimeout) return;
  logger.info('[Reminders] Scheduler started');
  scheduleNextReminderCheck();
  checkAndSend();
};

export const stopReminderScheduler = () => {
  if (reminderTimeout) {
    clearTimeout(reminderTimeout);
    reminderTimeout = null;
    logger.info('[Reminders] Scheduler stopped');
  }
};
