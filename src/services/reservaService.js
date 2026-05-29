import { supabaseService } from "./supabaseService";
import { supabase } from "@lib/supabase";

export const reservaService = {
  

  async listarTodas(options = {}) {
    try {     
     const { force = false, ttlMs = 60 * 1000 } = options;
     const cacheKey = 'reservas|all';
     if (!force && reservaService._cache?.[cacheKey]?.expiresAt > Date.now()) {
       return reservaService._cache[cacheKey].data;
     }

     const { data, error } = await supabase
        .from('reservas')
        .select('*, acomodacoes(nome), perfis(nome,email,documento,telefone)')
        .order('data_checkin', {ascending: true})
        
    if (error) throw error;
      reservaService._cache = reservaService._cache || {};
      reservaService._cache[cacheKey] = { data: data || [], expiresAt: Date.now() + ttlMs };
      return data || [];
    } catch (error) {
      throw error;
    }
  },

  // Listar apenas reservas de um usuário (cliente)
  async listarPorUsuario(idUsuario, options = {}) {
    try {
      const { force = false, ttlMs = 60 * 1000 } = options;
      const cacheKey = `reservas|user|${idUsuario}`;
      if (!force && reservaService._cache?.[cacheKey]?.expiresAt > Date.now()) {
        return reservaService._cache[cacheKey].data;
      }

      const { data, error } = await supabase
        .from('reservas')
        .select('*, acomodacoes(nome), perfis(nome,email,documento,telefone)')
        .eq('id_usuario', idUsuario)
        .order('data_checkin', {ascending: true})
        .order('criado_em', { ascending: true });

      
      if (error) throw error;
      reservaService._cache = reservaService._cache || {};
      reservaService._cache[cacheKey] = { data: data || [], expiresAt: Date.now() + ttlMs };
      return data || [];
    } catch (error) {
      throw error;
    }
  },

async criarNovaReserva(dadosReserva) {
  try {
    const { data: conflito, error: erroQuery } = await supabase
      .from('reservas')
      .select('id')
      .eq('id_acomodacao', dadosReserva.id_acomodacao)
      .not('status_reserva', 'eq', 'cancelada')  
      .lte('data_checkin', dadosReserva.data_checkout)  
      .gte('data_checkout', dadosReserva.data_checkin); 

    if (erroQuery) throw erroQuery;

    if (conflito && conflito.length > 0) {
      throw new Error("Este quarto já está reservado para as datas selecionadas.");
    }

    const created = await supabaseService.create('reservas', dadosReserva);
    reservaService._cache = {};
    return created;
  } catch (error) {
    throw error;
  }
},

  // 3. ATUALIZAR STATUS (Ex: Confirmar ou Finalizar)
  async mudarStatus(id, novoStatus) {
    try {
      const updated = await supabaseService.update('reservas', id, { status_reserva: novoStatus });
      reservaService._cache = {};
      return updated;
    } catch (error) {
      throw error;
    }
  },


};