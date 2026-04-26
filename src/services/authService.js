import {  supabaseUrl, supabaseAnonKey } from "@lib/supabase";

export async function loginControlado(email, senha) {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/login-controlado`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ email, senha }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Erro ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}