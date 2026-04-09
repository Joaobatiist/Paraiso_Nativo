import { supabaseService } from "./supabaseService";
import { supabase } from "../lib/supabase";

export const reservaService = {
  
  // 1. LISTAR RESERVAS (Com JOIN para saber o nome do quarto e do hóspede)
  async listarTodas() {
    try {
      // Usamos o mestre passando um select que traz dados das tabelas relacionadas
      return await supabaseService.getAll(
        'reservas', 
        '*, acomodacoes(nome), perfis(nome,email,documento,telefone)'
      );
    } catch (error) {
      // O erro já foi logado no mestre, aqui podemos tratar algo específico se quisermos
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

  // 2. CRIAR RESERVA (Com validação de negócio)
  async criarNovaReserva(dadosReserva) {
    try {
      const { data: conflito } = await supabase
        .from('reservas')
        .select('id')
        .eq('id_acomodacao', dadosReserva.id_acomodacao)
        .eq('status_reserva', 'confirmada')
        .or(`data_checkin.lte.${dadosReserva.data_checkout},data_checkout.gte.${dadosReserva.data_checkin}`);

      if (conflito && conflito.length > 0) {
        throw new Error("Este quarto já está reservado para as datas selecionadas.");
      }

      // Se passou na validação, usa o mestre para criar
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