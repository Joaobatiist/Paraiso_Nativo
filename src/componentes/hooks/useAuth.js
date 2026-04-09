import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { perfilService } from '../../services/perfilService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [perfilLoading, setPerfilLoading] = useState(false);

  
  useEffect(() => {
    let cancelado = false;

    const carregarPerfil = async () => {
      if (!user?.id) {
        setPerfil(null);
        setPerfilLoading(false);
        return;
      }

      setPerfilLoading(true);
      try {
        const data = await perfilService.obterPerfilLogado(user.id);
        if (cancelado) return;
        setPerfil(data?.[0] ?? null);
      } catch (err) {
        if (cancelado) return;
        console.error('Erro ao carregar perfil no useAuth:', err);
        setPerfil(null);
      } finally {
        if (!cancelado) setPerfilLoading(false);
      }
    };

    carregarPerfil();
    return () => {
      cancelado = true;
    };
  }, [user?.id]);

  useEffect(() => {
    const carregarSessaoInicial = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } finally {
        setAuthLoading(false);
      }
    };

    carregarSessaoInicial();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setPerfil(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loading = authLoading || (user?.id ? perfilLoading : false);
  return { user, session, perfil, loading };
}