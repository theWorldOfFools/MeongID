import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [pengguna, setPengguna] = useState(null);
  const [siap, setSiap] = useState(false);

  async function muatPengguna() {
    const { data } = await api.get('/api/auth/me');
    setPengguna(data);
    return data;
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSiap(true);
      return;
    }
    muatPengguna()
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setSiap(true));
  }, []);

  async function masuk(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setPengguna(data.pengguna);
    return data.pengguna;
  }

  async function daftar(nama, email, password) {
    const { data } = await api.post('/api/auth/register', { nama, email, password });
    localStorage.setItem('token', data.token);
    setPengguna(data.pengguna);
    return data.pengguna;
  }

  function keluar() {
    localStorage.removeItem('token');
    setPengguna(null);
  }

  return (
    <AuthContext.Provider value={{ pengguna, setPengguna, masuk, daftar, keluar, siap, muatPengguna }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
