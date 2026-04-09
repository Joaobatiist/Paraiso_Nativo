import { supabaseService } from "./supabaseService";

export const galeriaService = {
  // Adicionar uma nova foto a um quarto
  async adicionarFoto(idAcomodacao, url, legenda = "") {
    try {
      const novaFoto = {
        id_acomodacao: idAcomodacao,
        url_imagem: url,
        legenda: legenda
      };
      return await supabaseService.create('galeria_fotos', novaFoto);
    } catch (error) {
      throw error;
    }
  },

  // Remover uma foto da galeria
  async removerFoto(idFoto) {
    try {
      return await supabaseService.delete('galeria_fotos', idFoto);
    } catch (error) {
      throw error;
    }
  }
};