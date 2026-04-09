import { supabase } from '../lib/supabase';

export const storageService = {
  async subirFotoAcomodacao(arquivo) {
    const nomeArquivo = `${Date.now()}_${arquivo.name}`;
    
    const { data, error } = await supabase.storage
      .from('fotos-pousada')
      .upload(nomeArquivo, arquivo);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('fotos-pousada')
      .getPublicUrl(nomeArquivo);

    return urlData.publicUrl; 
  }
};