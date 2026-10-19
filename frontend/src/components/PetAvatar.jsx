import { fileUrl } from '../api/client';
import { emojiSpesies } from '../data/kategori';
import { cn } from './cn';

/** Avatar hewan: pakai foto kalau ada, kalau tidak tampil emoji spesies. */
export default function PetAvatar({ pet, ukuran = 'h-14 w-14', teks = 'text-2xl', className }) {
  const foto = fileUrl(pet?.foto_url);
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-meong-peach to-meong-peachSoft',
        ukuran,
        className
      )}
      aria-hidden={foto ? undefined : 'true'}
    >
      {foto ? (
        <img src={foto} alt={pet?.nama || 'Hewan'} className="h-full w-full object-cover" />
      ) : (
        <span className={teks}>{emojiSpesies(pet?.spesies)}</span>
      )}
    </span>
  );
}
