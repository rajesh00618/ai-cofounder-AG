import { createClient } from '@supabase/supabase-js';

let client = null;

export const getDb = () => {
  if (client) return client;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[DB] SUPABASE_URL or SUPABASE_SERVICE_KEY not set');
    return null;
  }
  client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
  console.log('[DB] Connected to Supabase');
  return client;
};

export const runQuery = async (table, data) => {
  const supabase = getDb();
  if (!supabase) return { lastID: null, changes: 0 };
  const { data: result, error } = await supabase.from(table).insert(data).select();
  if (error) throw error;
  return { lastID: result?.[0]?.id || null, changes: result?.length || 0 };
};

export const getQuery = async (table, column, value) => {
  const supabase = getDb();
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select('*').eq(column, value).maybeSingle();
  if (error) throw error;
  return data;
};

export const allQuery = async (table, filters = {}, options = {}) => {
  const supabase = getDb();
  if (!supabase) return [];
  let query = supabase.from(table).select(options.select || '*');
  for (const [col, val] of Object.entries(filters)) {
    query = query.eq(col, val);
  }
  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? false });
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};
