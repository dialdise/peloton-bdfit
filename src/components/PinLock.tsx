import { useState, useEffect } from 'react';
import { Delete } from 'lucide-react';

interface Props {
  correctPin: string;
  onUnlock: () => void;
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function PinLock({ correctPin, onUnlock }: Props) {
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (input.length === 4) {
      if (input === correctPin) {
        onUnlock();
      } else {
        setShake(true);
        setAttempts(a => a + 1);
        setTimeout(() => { setInput(''); setShake(false); }, 600);
      }
    }
  }, [input, correctPin, onUnlock]);

  const press = (k: string) => {
    if (k === '⌫') { setInput(p => p.slice(0, -1)); return; }
    if (k === '') return;
    if (input.length < 4) setInput(p => p + k);
  };

  return (
    <div className="fixed inset-0 bg-brand-dark flex flex-col items-center justify-center safe-top safe-bottom">
      <div className="mb-2">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="#FF6B35" fillOpacity="0.15" />
          <text x="24" y="30" textAnchor="middle" fontSize="22" fill="#FF6B35">🏃</text>
        </svg>
      </div>
      <h1 className="text-white text-2xl font-bold mb-1">Peloton BDFIT</h1>
      <p className="text-white/50 text-sm mb-8">Ingresa tu PIN para continuar</p>

      <div className={`flex gap-4 mb-10 transition-all ${shake ? 'animate-[wiggle_0.4s_ease-in-out]' : ''}`}>
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < input.length ? 'bg-brand-orange border-brand-orange scale-110' : 'border-white/30 bg-transparent'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 w-64">
        {KEYS.map((k, i) => (
          <button
            key={i}
            onClick={() => press(k)}
            disabled={k === ''}
            className={`h-16 rounded-2xl text-xl font-semibold transition-all active:scale-95 ${
              k === ''
                ? 'invisible'
                : k === '⌫'
                ? 'text-white/60 bg-white/5 flex items-center justify-center'
                : 'text-white bg-white/10 hover:bg-white/20 active:bg-brand-orange'
            }`}
          >
            {k === '⌫' ? <Delete size={20} /> : k}
          </button>
        ))}
      </div>

      {attempts > 0 && (
        <p className="mt-6 text-red-400 text-sm">PIN incorrecto ({attempts} intentos)</p>
      )}

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          60% { transform: translateX(8px); }
          80% { transform: translateX(-4px); }
        }
      `}</style>
    </div>
  );
}
