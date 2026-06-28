import { createClient } from '@supabase/supabase-js';

let client = null;
let clientUrl = null;
let clientKey = null;

const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    return val.replace(/[\0\x08\x09\x1a\n\r"'\\%]/g, (char) => {
      switch (char) {
        case '"': return '\\"';
        case "'": return "\\'";
        case '\\': return '\\\\';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '\0': return '\\0';
        default: return char;
      }
    });
  }
  return val;
};

export const sanitizeInput = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeValue(value);
  }
  return sanitized;
};

export const getDb = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  if (client && supabaseUrl === clientUrl && supabaseKey === clientKey) {
    return client;
  }
  // Create new client first, then atomically swap — avoids a window where
  // clientUrl/clientKey are updated but client is still the old value.
  const newClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
  if (client) {
    try { client.auth.signOut(); } catch {}
  }
  clientUrl = supabaseUrl;
  clientKey = supabaseKey;
  client = newClient;
  return client;
};

export const runQuery = async (table, data) => {
  const supabase = getDb();
  if (!supabase) return { lastID: null, changes: 0 };
  const clean = sanitizeInput(data);
  const { data: result, error } = await supabase.from(table).insert(clean).select();
  if (error) throw error;
  return { lastID: result?.[0]?.id || null, changes: result?.length || 0 };
};

export const getQuery = async (table, column, value) => {
  const supabase = getDb();
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select('*').eq(column, sanitizeValue(value)).maybeSingle();
  if (error) throw error;
  return data;
};

const ALLOWED_COLUMNS = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const allQuery = async (table, filters = {}, options = {}) => {
  const supabase = getDb();
  if (!supabase) return [];
  let query = supabase.from(table).select(options.select || '*');
  for (const [col, val] of Object.entries(filters)) {
    if (!ALLOWED_COLUMNS.test(col)) throw new Error(`Invalid filter column: ${col}`);
    if (val !== undefined && val !== null) {
      query = query.eq(col, val);
    }
  }
  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? false });
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};
