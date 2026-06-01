import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Plus, Search, AlertTriangle, ChevronRight,
  Users, CheckCircle2, Dumbbell,
} from 'lucide-react';
import Layout from '../components/Layout';
import { AttendanceBadge } from '../components/StatusBadge';
import type { AppData } from '../types';

const today = format(new Date(), 'yyyy-MM-dd');

interface Props { data: AppData }

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500', 'bg-indigo-500',
  'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500',
];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

const TRAINING_TYPE_COLORS: Record<string, string> = {
  Presencial: 'bg-green-100 text-green-700',
  Virtual:    'bg-blue-100 text-blue-700',
  Mixto:      'bg-purple-100 text-purple-700',
};

export default function BDFitPage({ data }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const bdfitStudents = useMemo(
    () => data.students.filter(s => s.group === 'bdfit'),
    [data.students],
  );

  const filtered = useMemo(() => {
    return bdfitStudents
      .filter(s => {
        if (!showInactive && !s.active) return false;
        if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [bdfitStudents, search, showInactive]);

  const todayLog = data.trainingDays[today];
  const activeCount = bdfitStudents.filter(s => s.active).length;
  const presentToday = todayLog?.sessions.filter(s =>
    bdfitStudents.some(b => b.id === s.studentId) && s.status === 'present'
  ).length ?? 0;
  const alertCount = bdfitStudents.filter(s => s.hasAlert || s.medical.currentInjury).length;

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <Layout>
      {/* Hero Header */}
      <div className="bg-brand-dark px-4 pt-safe pb-6">
        <div className="flex items-start justify-between mt-2">
          <div>
            <p className="text-white/60 text-sm">{greet()}, Bruno 👊</p>
            <h1 className="text-white text-2xl font-bold mt-0.5">Pelotón BDFIT</h1>
            <p className="text-brand-orange text-sm font-medium capitalize">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </p>
          </div>
          <button
            onClick={() => navigate('/athletes/new', { state: { group: 'bdfit' } })}
            className="bg-brand-orange text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-transform mt-1"
            title="Agregar alumno"
          >
            <Plus size={22} />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <MiniStat
            icon={<Users size={16} className="text-brand-orange" />}
            label="Alumnos"
            value={activeCount}
            color="text-gray-800"
          />
          <MiniStat
            icon={<CheckCircle2 size={16} className="text-green-500" />}
            label="Hoy"
            value={presentToday}
            color="text-green-600"
          />
          <MiniStat
            icon={<AlertTriangle size={16} className="text-orange-400" />}
            label="Alertas"
            value={alertCount}
            color="text-orange-500"
          />
        </div>

        {/* Empty state */}
        {bdfitStudents.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
              <Dumbbell size={32} className="text-brand-orange" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Sin alumnos personales aún</p>
              <p className="text-sm text-gray-400 mt-1">Agrega tus primeros alumnos BDFIT</p>
            </div>
            <button
              onClick={() => navigate('/athletes/new', { state: { group: 'bdfit' } })}
              className="bg-brand-orange text-white px-6 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
            >
              + Agregar primer alumno
            </button>
          </div>
        )}

        {/* Search + list */}
        {bdfitStudents.length > 0 && (
          <>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar alumno…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{filtered.length} alumnos</span>
              <button
                onClick={() => setShowInactive(p => !p)}
                className="text-xs text-brand-orange font-medium"
              >
                {showInactive ? 'Ocultar inactivos' : 'Ver inactivos'}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50 overflow-hidden">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">No se encontraron alumnos</p>
              ) : (
                filtered.map((s, i) => {
                  const todaySession = todayLog?.sessions.find(sess => sess.studentId === s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/athletes/${s.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-orange-50 transition-colors"
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]} ${!s.active ? 'opacity-40' : ''}`}>
                        <span className="text-white text-xs font-bold">{initials(s.name)}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-semibold ${!s.active ? 'text-gray-400' : 'text-gray-800'}`}>
                            {s.name}
                          </span>
                          {(s.hasAlert || s.medical.currentInjury) && (
                            <AlertTriangle size={12} className="text-orange-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${TRAINING_TYPE_COLORS[s.trainingType] ?? 'bg-gray-100 text-gray-500'}`}>
                            {s.trainingType}
                          </span>
                          <span className="text-xs text-gray-400">{s.mainDistance}</span>
                          {todaySession && <AttendanceBadge status={todaySession.status} />}
                        </div>
                      </div>

                      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </div>

            <button
              onClick={() => navigate('/athletes/new', { state: { group: 'bdfit' } })}
              className="w-full bg-brand-dark text-white py-4 rounded-2xl font-semibold text-sm shadow-sm active:scale-95 transition-transform"
            >
              + Agregar alumno BDFIT
            </button>
          </>
        )}

        <div className="h-2" />
      </div>
    </Layout>
  );
}

function MiniStat({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] text-gray-500 font-medium">{label}</span>
      </div>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
