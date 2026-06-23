import { useState } from 'react';
import { reservaService } from '@services/reservaService';

export const useDisponibilidade = (item) => {
  const [checkin, setCheckin]         = useState('');
  const [checkout, setCheckout]       = useState('');
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado]     = useState(null);

  const resetar = () => setResultado(null);

  const handleCheckin = (e) => {
    const val = e.target.value;
    setCheckin(val);
    resetar();
    if (checkout && val >= checkout) setCheckout('');
  };

  const handleCheckout = (e) => {
    setCheckout(e.target.value);
    resetar();
  };

  const verificar = async () => {
    if (!checkin || !checkout) return;
    setConsultando(true);
    resetar();
    try {
      const { disponivel, disponiveis } = await reservaService.verificarDisponibilidade(
        item.id, checkin, checkout, item.quantidade,
      );
      const noites     = Math.ceil((new Date(checkout) - new Date(checkin)) / 86_400_000);
      const valorTotal = disponivel && item.valorDiaria > 0 ? noites * item.valorDiaria : null;
      setResultado({ disponivel, disponiveis, noites, valorTotal });
    } catch {
      setResultado({ erro: true });
    } finally {
      setConsultando(false);
    }
  };

  return { checkin, checkout, consultando, resultado, handleCheckin, handleCheckout, verificar };
};
