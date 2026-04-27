import { supabaseService } from "./supabaseService";
import { supabase } from "@lib/supabase";

export const reservaService = {
  

  async listarTodas() {
    try {     
      return await supabaseService.getAll(
        'reservas', 
        '*, acomodacoes(nome), perfis(nome,email,documento,telefone)'
      );
    } catch (error) {
      throw error;
    }
  },

  // Listar apenas reservas de um usuário (cliente)
  async listarPorUsuario(idUsuario) {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*, acomodacoes(nome), perfis(nome,email,documento,telefone)')
        .eq('id_usuario', idUsuario)
        .order('criado_em', { ascending: false });

      
      if (error) throw error;
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

    return await supabaseService.create('reservas', dadosReserva);
  } catch (error) {
    throw error;
  }
},

  // 3. ATUALIZAR STATUS (Ex: Confirmar ou Finalizar)
  async mudarStatus(id, novoStatus) {
    try {
      return await supabaseService.update('reservas', id, { status_reserva: novoStatus });
    } catch (error) {
      throw error;
    }
  },

  // 4. CANCELAR (Em vez de deletar, apenas mudamos o status - Melhor para a Pousada)
  async cancelar(id) {
    try {
      return await this.mudarStatus(id, 'cancelada');
    } catch (error) {
      throw error;
    }
  }
};