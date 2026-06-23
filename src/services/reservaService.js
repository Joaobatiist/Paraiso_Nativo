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

  // Verifica disponibilidade sem criar reserva — usado na home e no formulário
  async verificarDisponibilidade(idAcomodacao, checkin, checkout, quantidade = 1) {
    const limite = new Date(Date.now() - 20 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('reservas')
      .select('id')
      .eq('id_acomodacao', idAcomodacao)
      .not('status_reserva', 'eq', 'cancelada')
      .lte('data_checkin', checkout)
      .gte('data_checkout', checkin)
      .or(`status_reserva.neq.pendente,criado_em.gt.${limite}`);

    if (error) throw error;

    const reservasAtivas = data?.length ?? 0;
    const disponiveis    = Math.max(0, quantidade - reservasAtivas);
    return { disponivel: disponiveis > 0, disponiveis };
  },

async criarNovaReserva(dadosReserva) {
  let quantidade = 1;
  try {
    await supabase.rpc('cancelar_reservas_expiradas');

    const { data: acomData, error: erroAcom } = await supabase
      .from('acomodacoes')
      .select('quantidade')
      .eq('id', dadosReserva.id_acomodacao)
      .single();

    if (erroAcom) throw erroAcom;
    quantidade = acomData?.quantidade ?? 1;

    const { disponivel } = await reservaService.verificarDisponibilidade(
      dadosReserva.id_acomodacao,
      dadosReserva.data_checkin,
      dadosReserva.data_checkout,
      quantidade,
    );

    if (!disponivel) {
      throw new Error(
        quantidade > 1
          ? `Sem vagas disponíveis para este período. Todas as ${quantidade} unidades estão ocupadas.`
          : 'Esta acomodação já está reservada para as datas selecionadas.'
      );
    }

    const created = await supabaseService.create('reservas', dadosReserva);
    reservaService._cache = {};
    return created;
  } catch (error) {
    const msg = error?.message ?? '';
    const eTriggerSemVaga =
      error?.code === 'P0001' ||
      msg.includes('impedir_conflito') ||
      msg.includes('exclusion constraint');

    if (eTriggerSemVaga) {
      throw new Error(
        quantidade > 1
          ? `Sem vagas disponíveis para este período. Todas as ${quantidade} unidades estão ocupadas.`
          : 'Esta acomodação já está reservada para as datas selecionadas.'
      );
    }
    throw error;
  }
},

  async iniciarPagamento(reservaId) {
    const { data, error } = await supabase.functions.invoke('criar-preferencia', {
      body: { reserva_id: reservaId },
    });

    if (error) throw new Error(error.message || 'Erro ao iniciar pagamento');
    return data.init_point;
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