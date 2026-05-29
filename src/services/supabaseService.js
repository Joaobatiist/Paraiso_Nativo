import { supabase } from "@lib/supabase";

const cache = new Map();
const DEFAULT_TTL_MS = 60 * 1000;

const now = () => Date.now();

const getCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < now()) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (key, data, ttlMs = DEFAULT_TTL_MS) => {
  cache.set(key, { data, expiresAt: now() + ttlMs });
};

const invalidateTableCache = (table) => {
  for (const key of cache.keys()) {
    if (key.startsWith(`${table}|`)) {
      cache.delete(key);
    }
  }
};

export const supabaseService = {
  // GET Genérico
  async getAll(table, select = "*", options = {}) {
    try {
      const { force = false, ttlMs = DEFAULT_TTL_MS } = options;
      const cacheKey = `${table}|all|${select}`;
      if (!force) {
        const cached = getCache(cacheKey);
        if (cached) return cached;
      }

      const { data, error } = await supabase.from(table).select(select);
      if (error) throw error;
      setCache(cacheKey, data, ttlMs);
      return data;
    } catch (error) {
      console.error(` Erro ao buscar em ${table}:`, error.message);
      throw error; 
    }
  },

  // GET com Filtro simples 
  async getBy(table, column, value, select = "*", options = {}) {
    try {
      const { force = false, ttlMs = DEFAULT_TTL_MS } = options;
      const cacheKey = `${table}|by|${column}|${String(value)}|${select}`;
      if (!force) {
        const cached = getCache(cacheKey);
        if (cached) return cached;
      }

      const { data, error } = await supabase.from(table).select(select).eq(column, value);
      if (error) throw error;
      setCache(cacheKey, data, ttlMs);
      return data;
    } catch (error) {
      console.error(` Erro ao filtrar em ${table}:`, error.message);
      throw error;
    }
  },

  // POST Genérico
  async create(table, payload) {
    try {
      const { data, error } = await supabase.from(table).insert([payload]).select();
      if (error) throw error;
      invalidateTableCache(table);
      return data[0];
    } catch (error) {
      console.error(` Erro ao criar em ${table}:`, error.message);
      throw error;
    }
  },

  // PATCH Genérico 
  async update(table, id, payload) {
    try {
      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select();
      if (error) throw error;
      invalidateTableCache(table);
      return data[0];
    } catch (error) {
      console.error(` Erro ao atualizar em ${table}:`, error.message);
      throw error;
    }
  },

  // DELETE Genérico
  async delete(table, id) {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      invalidateTableCache(table);
      return true;
    } catch (error) {
      console.error(` Erro ao deletar em ${table}:`, error.message);
      throw error;
    }
  }
};