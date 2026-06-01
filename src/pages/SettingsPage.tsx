import { useState, useRef } from 'react';
import {
  Shield, Download, Upload, RefreshCw,
  Eye, EyeOff, Loader, CheckCircle2, AlertTriangle, Delete
} from 'lucide-react';
import Layout from '../components/Layout';
import type { AppData } from '../types';
import { exportJSON, importJSON } from '../lib/storage';
import { syncFromGitHub } from '../lib/github';

interface Props {
  data: AppData;
  onSettingsUpdate: (s: AppData['settings']) => Promise<void>;
  onImport: (d: AppData) => Promise<void>;
  saveError: string;
}

export default function SettingsPage({ data, onSettingsUpdate, onImport, saveError }: Props) {
  const { settings } = data;
  const [showToken, setShowToken] = useState(false);
  const [pinSetup, setPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const upd = (key: keyof AppData['settings'], val: string) =>
    onSettingsUpdate({ ...settings, [key]: val });

  const handlePinKey = (k: string) => {
    if (k === '⌫') { setNewPin(p => p.slice(0, -1)); return; }
    if (newPin.length >= 4) return;
    const next = newPin + k;
    setNewPin(next);
    if (next.length === 4) {
      onSettingsUpdate({ ...settings, pin: next });
      setPinSetup(false);
      setNewPin('');
      setPinError('');
    }
  };

  const handleSync = async () => {
    if (!settings.githubToken) return;
    setSyncing(true);
    setSyncMsg('');
    try {
      const remote = await syncFromGitHub(settings.githubToken, settings.githubOwner, settings.githubRepo);
      if (remote) {
        await onImport(remote);
        setSyncMsg('✓ Datos sincronizados desde GitHub');
      } else {
        setSyncMsg('No hay datos en GitHub todavía. Guarda primero.');
      }
    } catch (e) {
      setSyncMsg('Error: ' + (e instanceof Error ? e.message : 'desconocido'));
    } finally {
      setSyncing(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importJSON(file);
      await onImport(imported);
      setSyncMsg('✓ Datos importados correctamente');
    } catch (err) {
      setSyncMsg('Error al importar: ' + (err instanceof Error ? err.message : ''));
    }
  };

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <Layout title="Configuración">
      <div className="px-4 pt-4 space-y-4">
        {/* PIN */}
        <Section icon={<Shield size={16} className="text-brand-orange" />} title="Seguridad">
          <p className="text-xs text-gray-500 mb-3">PIN actual: {'•'.repeat(settings.pin.length)}</p>
          {!pinSetup ? (
            <button
              onClick={() => { setPinSetup(true); setNewPin(''); }}
              className="w-full py-3 bg-brand-dark text-white rounded-xl text-sm font-semibold"
            >
              Cambiar PIN
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-center text-gray-600">
                Nuevo PIN: <span className="font-bold tracking-widest">{newPin.padEnd(4, '·')}</span>
              </p>
              {pinError && <p className="text-xs text-red-500 text-center">{pinError}</p>}
              <div className="grid grid-cols-3 gap-2">
                {KEYS.map((k, i) => (
                  <button
                    key={i}
                    onClick={() => handlePinKey(k)}
                    disabled={k === ''}
                    className={`h-12 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                      k === '' ? 'invisible' :
                      k === '⌫' ? 'bg-gray-100 text-gray-600' :
                      'bg-brand-dark text-white'
                    }`}
                  >
                    {k === '⌫' ? <Delete size={16} className="mx-auto" /> : k}
                  </button>
                ))}
              </div>
              <button onClick={() => { setPinSetup(false); setNewPin(''); }} className="w-full text-xs text-gray-400 py-1">
                Cancelar
              </button>
            </div>
          )}
        </Section>

        {/* GitHub */}
        <Section icon={<span className="text-gray-800 text-xs font-bold">GH</span>} title="GitHub (base de datos)">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Usuario/Organización</label>
              <input
                value={settings.githubOwner}
                onChange={e => upd('githubOwner', e.target.value)}
                placeholder="dialdise"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Nombre del repositorio</label>
              <input
                value={settings.githubRepo}
                onChange={e => upd('githubRepo', e.target.value)}
                placeholder="peloton-bdfit"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Personal Access Token (PAT)</label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={settings.githubToken}
                  onChange={e => upd('githubToken', e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                />
                <button
                  onClick={() => setShowToken(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Crea un PAT en GitHub → Settings → Developer settings → Personal access tokens → Classic. Scope necesario: repo
              </p>
            </div>

            {settings.githubToken && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="w-full py-3 bg-gray-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95"
              >
                {syncing ? <Loader size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                Sincronizar desde GitHub
              </button>
            )}

            {syncMsg && (
              <div className={`text-xs px-3 py-2 rounded-xl flex items-center gap-2 ${
                syncMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>
                {syncMsg.startsWith('✓') ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                {syncMsg}
              </div>
            )}

            {settings.lastSync && (
              <p className="text-xs text-gray-400 text-center">Último sync: {new Date(settings.lastSync).toLocaleString('es-PE')}</p>
            )}

            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 flex items-center gap-2">
                <AlertTriangle size={12} />
                {saveError}
              </div>
            )}
          </div>
        </Section>

        {/* Data */}
        <Section icon={<Download size={16} className="text-blue-500" />} title="Datos">
          <div className="space-y-2">
            <button
              onClick={() => exportJSON(data)}
              className="w-full py-3 bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95"
            >
              <Download size={15} />
              Exportar JSON (backup)
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95"
            >
              <Upload size={15} />
              Importar JSON
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </Section>

        {/* About */}
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center space-y-1">
          <p className="text-lg">🏃</p>
          <p className="text-sm font-bold text-gray-800">Peloton BDFIT</p>
          <p className="text-xs text-gray-400">Dashboard de coaching para corredores</p>
          <p className="text-xs text-gray-300">{data.students.length} atletas · v1.0</p>
        </div>

        <div className="h-4" />
      </div>
    </Layout>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
