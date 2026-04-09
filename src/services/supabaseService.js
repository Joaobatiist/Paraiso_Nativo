import { supabase } from "../lib/supabase";

export const supabaseService = {
  // GET Genérico
  async getAll(table, select = "*") {
    try {
      const { data, error } = await supabase.from(table).select(select);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(` Erro ao buscar em ${table}:`, error.message);
      throw error; 
    }
  },

  // GET com Filtro simples 
  async getBy(table, column, value, select = "*") {
    try {
      const { data, error } = await supabase.from(table).select(select).eq(column, value);
      if (error) throw error;
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
      return true;
    } catch (error) {
      console.error(` Erro ao deletar em ${table}:`, error.message);
      throw error;
    }
  }
};