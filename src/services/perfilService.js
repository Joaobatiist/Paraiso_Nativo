import { supabaseService } from "./supabaseService";
import { supabase } from "../lib/supabase";

export const perfilService = {
  async obterPerfilLogado(userId) {
    try {
      return await supabaseService.getBy('perfis', 'id', userId, 'role');
    } catch (error) {
      console.error("Perfil não identificado.")
      throw error;
    }
  },

  
  async salvarPerfil(perfil) {
    try {
      return await supabaseService.create('perfis', perfil);
    } catch (error) {
      throw error;
    }
  },

  // Criar/atualizar perfil do cliente autenticado sem expor role no formulário
  async salvarPerfilCliente(idUsuario, perfil) {
    try {
      const { data: perfilExistente } = await supabase
        .from('perfis')
        .select('role')
        .eq('id', idUsuario)
        .maybeSingle();

      

      const payload = {
        id: idUsuario,
        nome: perfil.nome?.trim(),
        email: perfil.email?.trim(),
        documento: perfil.documento?.trim() || null,
        telefone: perfil.telefone?.trim() || null,
        cep: perfil.cep?.trim() || null,
        rua: perfil.rua?.trim() || null,
        bairro: perfil.bairro?.trim() || null,
        cidade: perfil.cidade?.trim() || null,
        estado: perfil.estado?.trim() || null,
        role: perfil.role?.trim() || null
      };

      const { data, error } = await supabase
        .from('perfis')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao salvar o perfil!")
      throw error;
    }
  },

  // Buscar perfil por documento 
  async buscarPorDocumento(doc) {
    try {
      return await supabaseService.getBy('perfis', 'documento', doc);
    } catch (error) {
      throw error;
    }
  }
};