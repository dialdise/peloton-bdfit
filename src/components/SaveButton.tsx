import { Save, Check, Loader, WifiOff } from 'lucide-react';

interface Props {
  saving: boolean;
  lastSaved: Date | null;
  error: string;
  onClick: () => void;
}

export default function SaveButton({ saving, lastSaved, error, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
        error
          ? 'bg-red-500 text-white'
          : saving
          ? 'bg-gray-200 text-gray-500'
          : 'bg-brand-orange text-brand-dark shadow-md'
      }`}
    >
      {saving ? (
        <Loader size={16} className="animate-spin" />
      ) : error ? (
        <WifiOff size={16} />
      ) : lastSaved ? (
        <Check size={16} />
      ) : (
        <Save size={16} />
      )}
      {saving ? 'Guardando…' : error ? 'Sin sync' : lastSaved ? 'Guardado' : 'Guardar'}
    </button>
  );
}
