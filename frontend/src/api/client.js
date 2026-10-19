import axios from 'axios';

/** Kosong = satu origin (proxy nginx/vite). Bisa diisi URL absolut via env. */
export const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** URL foto upload (relatif /uploads/... atau absolut untuk data lama). */
export function fileUrl(u) {
  if (!u) return null;
  if (u.startsWith('http') || u.startsWith('data:')) return u;
  return API_URL + u;
}

export function rupiah(n) {
  return 'Rp' + Number(n || 0).toLocaleString('id-ID');
}

/** Ambil pesan error yang ramah dari respons API. */
export function pesanError(e, bawaan = 'Ups, ada yang gagal. Coba lagi ya.') {
  return e?.response?.data?.pesan || bawaan;
}

export default api;
