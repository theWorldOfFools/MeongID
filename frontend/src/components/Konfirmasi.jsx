import Modal from './Modal';

/** Dialog konfirmasi aksi berbahaya (hapus, dsb). */
export default function Konfirmasi({ buka, judul = 'Yakin mau hapus?', pesan, yaLabel = 'Ya, hapus', onYa, onBatal, sedang = false }) {
  return (
    <Modal buka={buka} onTutup={onBatal} judul={judul} lebar="sm:max-w-sm">
      <div className="space-y-5">
        <p className="text-sm text-meong-muted">
          <span className="mr-1.5 text-xl" aria-hidden="true">🥺</span>
          {pesan || 'Data ini akan dihapus permanen dan tidak bisa dikembalikan.'}
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn-besar btn-lembut flex-1" onClick={onBatal}>
            Batal
          </button>
          <button type="button" className="btn-besar btn-primer flex-1" onClick={onYa} disabled={sedang}>
            {sedang ? 'Menghapus...' : yaLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
