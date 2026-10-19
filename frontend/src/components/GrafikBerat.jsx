import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { tanggalIndo } from '../utils/format';

/** Grafik garis tren berat badan — SVG ringan tanpa dependensi. */
export default function GrafikBerat({ data = [] }) {
  if (!data.length) {
    return (
      <div className="rounded-2xl border border-dashed border-meong-peach bg-meong-peachSoft/50 p-6 text-center">
        <p className="text-sm font-semibold text-meong-muted">Belum ada catatan berat. Timbang hewanmu, yuk! ⚖️</p>
      </div>
    );
  }
  if (data.length === 1) {
    const hanya = data[0];
    return (
      <div className="rounded-2xl border border-dashed border-meong-peach bg-meong-peachSoft/50 p-6 text-center">
        <p className="font-display text-2xl font-semibold text-meong-primaryDark">{Number(hanya.berat_kg)} kg</p>
        <p className="mt-1 text-sm text-meong-muted">
          Catat berat lagi minimal sekali untuk melihat tren naik/turunnya ya 🐾
        </p>
      </div>
    );
  }

  const W = 560;
  const H = 230;
  const padX = 46;
  const padY = 34;
  const nilai = data.map((d) => Number(d.berat_kg));
  const min = Math.min(...nilai);
  const max = Math.max(...nilai);
  const span = max - min || 1;
  const x = (i) => padX + (i * (W - padX * 2)) / (data.length - 1);
  const y = (v) => H - padY - ((v - min) / span) * (H - padY * 2);
  const titik = data.map((d, i) => [x(i), y(d.berat_kg)]);
  const garis = titik.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
  const area = `M${padX},${H - padY} L${garis} L${(W - padX).toFixed(1)},${H - padY} Z`;
  const pertama = nilai[0];
  const terakhir = nilai[nilai.length - 1];
  const selisih = Number((terakhir - pertama).toFixed(2));

  return (
    <div className="w-full overflow-hidden">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-sm font-semibold text-meong-ink">
          Berat terbaru: <span className="text-meong-primaryDark">{terakhir} kg</span>
        </p>
        <span className={`badge border ${selisih > 0 ? 'border-meong-mint/60 bg-meong-mintSoft text-emerald-800' : selisih < 0 ? 'border-meong-rose/60 bg-meong-roseSoft text-rose-700' : 'border-meong-line bg-white text-meong-muted'}`}>
          {selisih > 0 ? <TrendingUp size={13} /> : selisih < 0 ? <TrendingDown size={13} /> : <Minus size={13} />}
          {selisih > 0 ? '+' : ''}{selisih} kg
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full" role="img" aria-label="Grafik tren berat badan">
        <defs>
          <linearGradient id="areaBerat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D2694A" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#D2694A" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => {
          const gy = padY + f * (H - padY * 2);
          const v = (max - f * span).toFixed(1);
          return (
            <g key={f}>
              <line x1={padX} x2={W - padX} y1={gy} y2={gy} stroke="#F0E2D8" strokeDasharray="5 6" />
              <text x={padX - 8} y={gy + 4} textAnchor="end" fontSize={10.5} fontWeight={700} fill="#8B7A72">
                {v}
              </text>
            </g>
          );
        })}
        <path d={area} fill="url(#areaBerat)" />
        <polyline points={garis} fill="none" stroke="#D2694A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {titik.map(([px, py], i) => (
          <g key={i}>
            <circle cx={px} cy={py} r={5.5} fill="#fff" stroke="#D2694A" strokeWidth={3} />
            {(i === 0 || i === titik.length - 1 || data.length <= 8) && (
              <text x={px} y={py - 12} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#B85434">
                {nilai[i]}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="flex justify-between px-1 text-[11px] font-semibold text-meong-muted">
        <span>{tanggalIndo(data[0].tanggal_str || data[0].tanggal)}</span>
        <span>{tanggalIndo(data[data.length - 1].tanggal_str || data[data.length - 1].tanggal)}</span>
      </div>
    </div>
  );
}
