import { logger } from './logger.js';
import { getResearch, getMorningBriefing } from '../engines/research.js';
import { addMemoryNode } from '../engines/memory.js';

const INTERVAL_MS = 6 * 60 * 60 * 1000;
const _briefings = new Map();
let _timer = null;

export const getLatestBriefing = (userId) => {
  return _briefings.get(userId) || null;
};

const runResearchCycle = async () => {
  if (process.env.BACKGROUND_RESEARCH_ENABLED !== 'true') {
    logger.debug('[BackgroundResearch] Disabled via env');
    return;
  }

  logger.info('[BackgroundResearch] Starting research cycle');

  try {
    const { getDb } = await import('../db/database.js');
    const supabase = getDb();
    if (!supabase) {
      logger.warn('[BackgroundResearch] No database — skipping cycle');
      return;
    }

    const serverKey = process.env.NVIDIA_API_KEY;
    if (!serverKey) {
      logger.warn('[BackgroundResearch] No server API key configured');
      return;
    }

    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, user_id, founder_id, blueprint, current_stage, health_scores')
      .not('blueprint', 'is', null)
      .limit(50);

    if (error) {
      logger.error(`[BackgroundResearch] Query failed: ${error.message}`);
      return;
    }

    if (!businesses || businesses.length === 0) {
      logger.info('[BackgroundResearch] No active businesses found');
      return;
    }

    logger.info(`[BackgroundResearch] Processing ${businesses.length} active businesses`);

    for (const biz of businesses) {
      try {
        const businessContext = {
          blueprint: typeof biz.blueprint === 'string' ? JSON.parse(biz.blueprint) : biz.blueprint,
          currentStage: biz.current_stage,
          businessHealth: biz.health_scores ? (typeof biz.health_scores === 'string' ? JSON.parse(biz.health_scores) : biz.health_scores) : {},
        };

        const researchItems = await getResearch(serverKey, businessContext);

        if (Array.isArray(researchItems)) {
          for (const item of researchItems) {
            await addMemoryNode(
              biz.user_id,
              biz.founder_id,
              item.category || 'research',
              item.title || 'Research finding',
              {
                source: item.source,
                summary: item.summary,
                priority: item.priority,
                date: item.date,
                category: item.category,
              }
            );
          }
          logger.info(`[BackgroundResearch] Stored ${researchItems.length} research nodes for user ${biz.user_id}`);
        }

        const { data: users } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', biz.user_id)
          .maybeSingle();

        const profile = users ? { name: users.name, email: users.email } : {};

        const briefing = await getMorningBriefing(serverKey, profile, businessContext);
        if (briefing) {
          _briefings.set(biz.user_id, {
            ...briefing,
            generatedAt: new Date().toISOString(),
          });

          await addMemoryNode(
            biz.user_id,
            biz.founder_id,
            'briefing',
            `Morning Briefing — ${new Date().toISOString().slice(0, 10)}`,
            { briefing: JSON.stringify(briefing) }
          );

          logger.info(`[BackgroundResearch] Briefing stored for user ${biz.user_id}`);
        }
      } catch (err) {
        logger.error(`[BackgroundResearch] Failed for business ${biz.id}: ${err.message}`);
      }
    }

    logger.info('[BackgroundResearch] Cycle complete');
  } catch (err) {
    logger.error(`[BackgroundResearch] Cycle failed: ${err.message}`);
  }
};

export const startBackgroundResearch = () => {
  if (_timer) {
    logger.debug('[BackgroundResearch] Already running');
    return;
  }

  logger.info('[BackgroundResearch] Scheduler started');
  runResearchCycle();
  _timer = setInterval(runResearchCycle, INTERVAL_MS);
  if (_timer.unref) _timer.unref();
};

export const stopBackgroundResearch = () => {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
    logger.info('[BackgroundResearch] Scheduler stopped');
  }
};
