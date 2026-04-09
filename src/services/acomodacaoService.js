import { supabaseService } from "./supabaseService";

export const acomodacaoService = {
  // Listar todos os quartos com a galeria de fotos (JOIN)
  async listarTodasComFotos() {
    try {
      // O '*, galeria_fotos(*)' traz o quarto e todas as fotos dele de uma vez
      return await supabaseService.getAll('acomodacoes', '*, galeria_fotos(*)');
    } catch (error) {
      throw error;
    }
  },

  // Mudar status (ex: colocar quarto em manutenção)
  async atualizarStatus(id, novoStatus) {
    try {
      return await supabaseService.update('acomodacoes', id, { status: novoStatus });
    } catch (error) {
      throw error;
    }
  }
};