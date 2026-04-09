import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { supabase } from '../../../lib/supabase';
import './FloatingBook.css';

const FloatingBook = () => {
  const handleReservaClick = async (event) => {
    event.preventDefault();
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      window.location.href = '/dashboard?page=reservar';
      return;
    }
    window.location.href = '/login';
  };

  return (
    <a
      href="/login"
      className="floating-book"
      aria-label="Reservar agora"
      onClick={handleReservaClick}
    >
      <FaCalendarAlt />
      <span>Reservar</span>
    </a>
  );
};

export default FloatingBook;
