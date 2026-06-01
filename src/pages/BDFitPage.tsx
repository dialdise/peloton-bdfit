import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Search, AlertTriangle, ChevronRight, CheckCircle2, Dumbbell, ArrowUpRight } from 'lucide-react';
import Layout from '../components/Layout';
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

export default function BDFitPage({ data }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const bdfitStudents = useMemo(
    () => data.students.filter(s => s.group === 'bdfit'),
    [data.students],
  );

  const filtered = useMemo(() =>
    bdfitStudents
      .filter(s => {
        if (!showInactive && !s.active) return false;
        if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
    [bdfitStudents, search, showInactive],
  );

  const todayLog  = data.trainingDays[today];
  const activeCount   = bdfitStudents.filter(s => s.active).length;
  const presentToday  = todayLog?.sessions.filter(s =>
    bdfitStudents.some(b => b.id === s.studentId) && s.status === 'present'
  ).length ?? 0;
  const alertCount = bdfitStudents.filter(s => s.hasAlert || s.medical.currentInjury).length;
  const presentPct = activeCount > 0 ? Math.round((presentToday / activeCount) * 100) : 0;

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8">

        {/* ── Welcome header ── */}
        <div className="pt-6 pb-6 lg:pt-10 lg:pb-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[#9B9B9B] text-sm font-medium">{greet()}, Bruno 👊</p>
              <h1 className="text-[#1C1C1E] text-3xl lg:text-4xl font-bold mt-1 tracking-tight">
                Pelotón BDFIT
              </h1>
              <p className="text-[#9B9B9B] text-sm mt-1 capitalize">
                {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden lg:flex items-center gap-10">
                <LargeNum value={activeCount} label="Alumnos" />
                <LargeNum value={presentToday} label="Presentes hoy" accent />
                <LargeNum value={alertCount} label="Alertas" dim={alertCount === 0} />
              </div>
              <button
                onClick={() => navigate('/athletes/new', { state: { group: 'bdfit' } })}
                className="w-10 h-10 bg-[#1C1C1E] rounded-2xl flex items-center justify-center shadow-card hover:bg-[#2c2c2e] transition-colors active:scale-95"
                title="Agregar alumno"
              >
                <Plus size={18} className="text-[#F5C33C]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile compact stats ── */}
        <div className="lg:hidden grid grid-cols-3 gap-3 mb-5">
          <CompactStat value={activeCount} label="Alumnos" />
          <CompactStat value={presentToday} label="Presentes" accent />
          <CompactStat value={alertCount} label="Alertas" warn={alertCount > 0} />
        </div>

        {/* ── Empty state ── */}
        {bdfitStudents.length === 0 && (
          <div className="bg-white rounded-3xl shadow-card p-10 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 bg-[#F5C33C]/15 rounded-2xl flex items-center justify-center">
              <Dumbbell size={28} className="text-[#F5C33C]" />
            </div>
            <div>
              <p className="font-bold text-[#1C1C1E] text-lg">Sin alumnos personales</p>
              <p className="text-[#9B9B9B] text-sm mt-1">Agrega tu primer alumno BDFIT</p>
            </div>
            <button
              onClick={() => navigate('/athletes/new', { state: { group: 'bdfit' } })}
              className="bg-[#1C1C1E] text-white px-8 py-3.5 rounded-2xl font-semibold text-sm hover:bg-[#2c2c2e] active:scale-95 transition-all shadow-card"
            >
              + Agregar primer alumno
            </button>
          </div>
        )}

        {/* ── Content when students exist ── */}
        {bdfitStudents.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-5">

            {/* Left: student list (2 cols on desktop) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
                <input
                  type="text"
                  placeholder="Buscar alumno…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-[#E5E4DF] text-sm text-[#1C1C1E] placeholder-[#C0BDB8] focus:outline-none focus:ring-2 focus:ring-[#F5C33C]/40 focus:border-[#F5C33C] shadow-sm transition-shadow"
                />
              </div>

              {/* Count + inactive toggle */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-[#9B9B9B] font-medium">{filtered.length} alumnos</span>
                <button
                  onClick={() => setShowInactive(p => !p)}
                  className="text-xs text-[#F5C33C] font-semibold hover:text-[#E8A820] transition-colors"
                >
                  {showInactive ? 'Ocultar inactivos' : 'Ver inactivos'}
                </button>
              </div>

              {/* Student list */}
              <div className="bg-white rounded-3xl shadow-card overflow-hidden divide-y divide-[#F4F3EE]">
                {filtered.length === 0 ? (
                  <p className="text-center text-[#9B9B9B] py-12 text-sm">No se encontraron alumnos</p>
                ) : (
                  filtered.map((s, i) => {
                    const todaySession = todayLog?.sessions.find(sess => sess.studentId === s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => navigate(`/athletes/${s.id}`)}
                        className="w-full flex items-center gap-3.5 px-5 py-3.5 text-left hover:bg-[#F4F3EE]/60 active:bg-[#F4F3EE] transition-colors"
                      >
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]} ${!s.active ? 'opacity-40' : ''}`}>
                          <span className="text-white text-xs font-bold">{initials(s.name)}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${!s.active ? 'text-[#C0BDB8]' : 'text-[#1C1C1E]'}`}>
                              {s.name}
                            </span>
                            {(s.hasAlert || s.medical.currentInjury) && (
                              <AlertTriangle size={11} className="text-orange-400 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[#9B9B9B]">{s.mainDistance}</span>
                            <span className="text-[#E5E4DF]">·</span>
                            <span className="text-xs text-[#9B9B9B]">{s.trainingType}</span>
                            {todaySession && (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg ${
                                todaySession.status === 'present'
                                  ? 'bg-green-100 text-green-700'
                                  : todaySession.status === 'absent'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-orange-100 text-orange-600'
                              }`}>
                                {todaySession.status === 'present' ? 'Presente' : todaySession.status === 'absent' ? 'Ausente' : 'Lesión'}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight size={15} className="text-[#C0BDB8] flex-shrink-0" />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Add button */}
              <button
                onClick={() => navigate('/athletes/new', { state: { group: 'bdfit' } })}
                className="w-full bg-[#1C1C1E] text-white py-4 rounded-2xl font-semibold text-sm shadow-card hover:bg-[#2c2c2e] active:scale-[0.98] transition-all"
              >
                + Agregar alumno BDFIT
              </button>
            </div>

            {/* Right: stats panel */}
            <div className="flex flex-col gap-4">
              {/* Today attendance card — yellow */}
              <div className="bg-[#F5C33C] rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#1C1C1E]/70 text-xs font-semibold uppercase tracking-widest">Hoy</span>
                  <ArrowUpRight size={14} className="text-[#1C1C1E]/40" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#1C1C1E] leading-none">{presentToday}</p>
                    <p className="text-xs text-[#1C1C1E]/60 mt-1">Presentes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[#1C1C1E] leading-none">{activeCount - presentToday}</p>
                    <p className="text-xs text-[#1C1C1E]/60 mt-1">Pendientes</p>
                  </div>
                </div>
                <div className="h-1.5 bg-[#1C1C1E]/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1C1C1E]/50 rounded-full transition-all duration-700"
                    style={{ width: `${presentPct}%` }}
                  />
                </div>
                <p className="text-[#1C1C1E]/60 text-xs mt-2">{presentPct}% de asistencia</p>
              </div>

              {/* Alerts dark card */}
              <div className="bg-[#1C1C1E] rounded-3xl p-5 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">Alertas</span>
                  <span className="bg-white/10 text-white text-xs font-bold px-2 py-0.5 rounded-lg">{alertCount}</span>
                </div>
                {alertCount === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <CheckCircle2 size={24} className="text-[#F5C33C]/50" />
                    <p className="text-white/30 text-xs text-center">Sin alertas</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bdfitStudents.filter(s => s.hasAlert || s.medical.currentInjury).map(s => (
                      <button
                        key={s.id}
                        onClick={() => navigate(`/athletes/${s.id}`)}
                        className="w-full flex items-start gap-2.5 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F5C33C] flex-shrink-0 mt-1.5" />
                        <div className="min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{s.name}</p>
                          <p className="text-white/40 text-xs truncate">{s.medical.currentInjury || s.alertMessage}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="h-6" />
      </div>
    </Layout>
  );
}

function LargeNum({ value, label, accent, dim }: { value: number; label: string; accent?: boolean; dim?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-5xl font-bold leading-none tracking-tight ${accent ? 'text-[#F5C33C]' : dim ? 'text-[#D0CFC9]' : 'text-[#1C1C1E]'}`}>
        {value}
      </p>
      <p className="text-xs text-[#9B9B9B] mt-1.5 font-medium">{label}</p>
    </div>
  );
}

function CompactStat({ value, label, accent, warn }: { value: number; label: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-card text-center">
      <p className={`text-2xl font-bold leading-none ${accent ? 'text-[#F5C33C]' : warn ? 'text-orange-500' : 'text-[#1C1C1E]'}`}>{value}</p>
      <p className="text-[10px] text-[#9B9B9B] mt-1 font-medium">{label}</p>
    </div>
  );
}
