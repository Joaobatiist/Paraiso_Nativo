import { supabaseService } from "./supabaseService";
import { supabase } from "@lib/supabase";

export const pacotePromoService = {
  // Listar todos os pacotes com dados da acomodação
  async listarTodos() {
    try {
      const { data, error } = await supabase
        .from('pacotes_promocionais')
        .select('*, acomodacoes(id, nome)');
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  },

  // Listar pacotes por acomodação e intervalo
  async listarPorAcomodacaoEIntervalo(acomodacaoId, dataInicial, dataFinal) {
    try {
      // Tenta primeiro com supabase direto para verificar RLS
      const { data, error } = await supabase
        .from('pacotes_promocionais')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Agora filtra em memory já que RLS está funcionando
      const pacotesFiltrados = (data || []).filter(p => {
        const igualacomodacao = p.acomodacao_id === acomodacaoId;
        const dataInicialPacote = new Date(p.data_inicial);
        const dataFinalPacote = new Date(p.data_final);
        const dataInicialReserva = new Date(dataInicial);
        const dataFinalReserva = new Date(dataFinal);
        
        // Verificar sobreposição de datas
        const temSobreposicao = dataInicialPacote <= dataFinalReserva && dataFinalPacote >= dataInicialReserva;
        return igualacomodacao && temSobreposicao;
      });
      return pacotesFiltrados || [];
    } catch (error) {
      throw error;
    }
  },

  // Criar novo pacote
  async criar(pacote) {
    try {
      const novoPacote = {
        acomodacao_id: pacote.acomodacao_id,
        data_inicial: pacote.data_inicial,
        data_final: pacote.data_final,
        valor: pacote.valor,
        descricao: pacote.descricao
      };
      return await supabaseService.create('pacotes_promocionais', novoPacote);
    } catch (error) {
      throw error;
    }
  },

  // Atualizar pacote
  async atualizar(id, pacote) {
    try {
      const pacoteAtualizado = {
        acomodacao_id: pacote.acomodacao_id,
        data_inicial: pacote.data_inicial,
        data_final: pacote.data_final,
        valor: pacote.valor,
        descricao: pacote.descricao
      };
      return await supabaseService.update('pacotes_promocionais', id, pacoteAtualizado);
    } catch (error) {
      throw error;
    }
  },

  // Deletar pacote
  async deletar(id) {
    try {
      return await supabaseService.delete('pacotes_promocionais', id);
    } catch (error) {
      throw error;
    }
  }
};