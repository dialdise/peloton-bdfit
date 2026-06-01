import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Users, CheckCircle2, XCircle, Plus, ArrowUpRight } from 'lucide-react';
import Layout from '../components/Layout';
import type { AppData } from '../types';

const today = format(new Date(), 'yyyy-MM-dd');

interface Props { data: AppData }

export default function Dashboard({ data }: Props) {
  const navigate = useNavigate();
  const todayLog = data.trainingDays[today];
  const activeStudents = data.students.filter(s => s.active && (s.group === 'mypp' || !s.group));

  const todayPresent  = todayLog?.sessions.filter(s => s.status === 'present').length  ?? 0;
  const todayAbsent   = todayLog?.sessions.filter(s => s.status === 'absent').length   ?? 0;
  const todayInjured  = todayLog?.sessions.filter(s => s.status === 'injured').length  ?? 0;
  const todayChecked  = todayLog?.sessions.length ?? 0;
  const presentPct    = activeStudents.length > 0 ? Math.round((todayPresent / activeStudents.length) * 100) : 0;

  const alerts = useMemo(() => {
    const list: { id: number; name: string; msg: string; type: 'injury' | 'alert' }[] = [];
    activeStudents.forEach(s => {
      if (s.medical.currentInjury) list.push({ id: s.id, name: s.name, msg: s.medical.currentInjury, type: 'injury' });
      if (s.hasAlert && s.alertMessage) list.push({ id: s.id, name: s.name, msg: s.alertMessage, type: 'alert' });
    });
    return list;
  }, [activeStudents]);

  const pelotonStats = useMemo(() => {
    const groups: Record<number, { total: number; present: number }> = {};
    activeStudents.forEach(s => {
      if (!groups[s.peloton]) groups[s.peloton] = { total: 0, present: 0 };
      groups[s.peloton].total++;
      const session = todayLog?.sessions.find(sess => sess.studentId === s.id);
      if (session?.status === 'present') groups[s.peloton].present++;
    });
    return Object.entries(groups)
      .map(([p, v]) => ({ peloton: Number(p), ...v }))
      .sort((a, b) => a.peloton - b.peloton);
  }, [activeStudents, todayLog]);

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
              <p className="text-[#9B9B9B] text-sm font-medium">{greet()}, Coach Bruno 👋</p>
              <h1 className="text-[#1C1C1E] text-3xl lg:text-4xl font-bold mt-1 tracking-tight">
                Pelotón MYPP
              </h1>
              <p className="text-[#9B9B9B] text-sm mt-1 capitalize">
                {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>

            {/* Large numbers — desktop only */}
            <div className="hidden lg:flex items-center gap-10 flex-shrink-0">
              <LargeNum value={activeStudents.length} label="Atletas" />
              <LargeNum value={todayPresent} label="Presentes hoy" accent />
              <LargeNum value={alerts.length} label="Alertas" dim={alerts.length === 0} />
            </div>
          </div>

          {/* Inline progress metrics */}
          <div className="flex items-center gap-3 mt-5 flex-wrap">
            <MetricPill
              label="Presentes"
              value={todayPresent}
              total={activeStudents.length}
              pct={presentPct}
              variant="yellow"
            />
            <MetricPill
              label="Ausentes"
              value={todayAbsent}
              total={activeStudents.length}
              pct={activeStudents.length > 0 ? Math.round((todayAbsent / activeStudents.length) * 100) : 0}
              variant="dark"
            />
            <MetricPill
              label="Sin registrar"
              value={activeStudents.length - todayChecked}
              total={activeStudents.length}
              pct={activeStudents.length > 0 ? Math.round(((activeStudents.length - todayChecked) / activeStudents.length) * 100) : 0}
              variant="ghost"
            />
          </div>
        </div>

        {/* ── Mobile compact stats ── */}
        <div className="lg:hidden grid grid-cols-3 gap-3 mb-5">
          <CompactStat value={activeStudents.length} label="Atletas" />
          <CompactStat value={todayPresent} label="Presentes" accent />
          <CompactStat value={alerts.length} label="Alertas" warn={alerts.length > 0} />
        </div>

        {/* ── Card grid ── */}
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-5">

          {/* Today's session — yellow card */}
          <div className="bg-[#F5C33C] rounded-3xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[#1C1C1E]/70 text-xs font-semibold uppercase tracking-widest">Sesión de hoy</span>
              <button
                onClick={() => navigate('/checkin')}
                className="w-7 h-7 bg-[#1C1C1E]/10 rounded-lg flex items-center justify-center hover:bg-[#1C1C1E]/20 transition-colors"
              >
                <ArrowUpRight size={14} className="text-[#1C1C1E]" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-4xl font-bold text-[#1C1C1E] leading-none">{todayPresent}</p>
                <p className="text-xs text-[#1C1C1E]/60 mt-1 font-medium">Presentes</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-[#1C1C1E] leading-none">{todayAbsent}</p>
                <p className="text-xs text-[#1C1C1E]/60 mt-1 font-medium">Ausentes</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-[#1C1C1E] leading-none">{todayInjured}</p>
                <p className="text-xs text-[#1C1C1E]/60 mt-1 font-medium">Lesionados</p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-[#1C1C1E]/60 mb-1.5">
                <span>{todayChecked}/{activeStudents.length} registrados</span>
                <span>{presentPct}%</span>
              </div>
              <div className="h-1.5 bg-[#1C1C1E]/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1C1C1E]/50 rounded-full transition-all duration-700"
                  style={{ width: `${presentPct}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => navigate('/checkin')}
              className="w-full bg-[#1C1C1E] text-white text-sm font-semibold py-3 rounded-2xl active:scale-95 transition-transform hover:bg-[#2c2c2e]"
            >
              Registrar asistencia
            </button>
          </div>

          {/* Peloton bar chart — white card */}
          <div className="bg-white rounded-3xl p-5 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[#1C1C1E]/70 text-xs font-semibold uppercase tracking-widest">Por Pelotón</span>
              <button
                onClick={() => navigate('/stats')}
                className="w-7 h-7 bg-[#F4F3EE] rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ArrowUpRight size={14} className="text-[#9B9B9B]" />
              </button>
            </div>

            {pelotonStats.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[#9B9B9B] text-sm">Sin datos</p>
              </div>
            ) : (
              <>
                {/* Bar chart */}
                <div className="flex items-end gap-1.5 h-24 mt-2">
                  {pelotonStats.map(({ peloton, present, total }) => {
                    const pct = total > 0 ? present / total : 0;
                    return (
                      <div key={peloton} className="flex-1 flex flex-col items-center gap-1">
                        <div className="relative w-full rounded-full overflow-hidden" style={{ height: '72px' }}>
                          <div className="absolute inset-0 bg-[#F4F3EE] rounded-full" />
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-[#F5C33C] rounded-full transition-all duration-700"
                            style={{ height: `${pct * 72}px` }}
                          />
                        </div>
                        <span className="text-[9px] text-[#9B9B9B] font-medium">P{peloton}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Summary rows */}
                <div className="space-y-2 border-t border-[#F4F3EE] pt-3">
                  {pelotonStats.slice(0, 4).map(({ peloton, present, total }) => {
                    const pct = total > 0 && todayChecked > 0 ? Math.round((present / total) * 100) : 0;
                    return (
                      <div key={peloton} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1C1C1E] w-6">P{peloton}</span>
                        <div className="flex-1 h-1 bg-[#F4F3EE] rounded-full overflow-hidden">
                          <div className="h-full bg-[#F5C33C] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-[#9B9B9B] w-10 text-right">{present}/{total}</span>
                      </div>
                    );
                  })}
                  {pelotonStats.length > 4 && (
                    <p className="text-xs text-[#9B9B9B]">+{pelotonStats.length - 4} más pelotons</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Alerts — dark card */}
          <div className="bg-[#1C1C1E] rounded-3xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">Alertas</span>
              <span className="bg-white/10 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                {alerts.length}
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
                <CheckCircle2 size={28} className="text-[#F5C33C]/60" />
                <p className="text-white/40 text-sm text-center">Sin alertas activas</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 flex-1">
                {alerts.slice(0, 5).map((a, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(`/athletes/${a.id}`)}
                    className="flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-left transition-colors active:scale-95"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${a.type === 'injury' ? 'bg-[#F5C33C]' : 'bg-red-400'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs font-semibold truncate">{a.name}</p>
                      <p className="text-white/40 text-xs truncate mt-0.5">{a.msg}</p>
                    </div>
                  </button>
                ))}
                {alerts.length > 5 && (
                  <p className="text-white/30 text-xs text-center">+{alerts.length - 5} más</p>
                )}
              </div>
            )}

            <button
              onClick={() => navigate('/athletes')}
              className="w-full border border-white/15 text-white/70 text-sm font-medium py-2.5 rounded-2xl hover:bg-white/5 transition-colors"
            >
              Ver todos los atletas
            </button>
          </div>
        </div>

        {/* ── Second row ── */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-5 mt-4 lg:mt-5">
          {/* Quick stats */}
          <div className="bg-white rounded-3xl p-5 shadow-card">
            <p className="text-[#1C1C1E]/70 text-xs font-semibold uppercase tracking-widest mb-4">Resumen</p>
            <div className="grid grid-cols-2 gap-4">
              <StatRow icon={<Users size={15} className="text-[#F5C33C]" />} label="Atletas activos" value={activeStudents.length} />
              <StatRow icon={<CheckCircle2 size={15} className="text-green-500" />} label="Presentes" value={todayPresent} />
              <StatRow icon={<XCircle size={15} className="text-red-400" />} label="Ausentes" value={todayAbsent} />
              <StatRow icon={<AlertTriangle size={15} className="text-orange-400" />} label="Lesionados" value={todayInjured} />
            </div>
          </div>

          {/* Add athlete CTA */}
          <button
            onClick={() => navigate('/athletes/new')}
            className="bg-[#1C1C1E] rounded-3xl p-5 flex items-center justify-between group hover:bg-[#2c2c2e] transition-colors active:scale-[0.98] text-left shadow-card"
          >
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Acción rápida</p>
              <p className="text-white text-xl font-bold">Agregar nuevo atleta</p>
              <p className="text-white/40 text-sm mt-1">Registrar en Pelotón MYPP</p>
            </div>
            <div className="w-12 h-12 bg-[#F5C33C] rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Plus size={22} className="text-[#1C1C1E]" />
            </div>
          </button>
        </div>

        <div className="h-6" />
      </div>
    </Layout>
  );
}

/* ─── Sub-components ──────────────────────────────────────── */

function LargeNum({ value, label, accent, dim }: { value: number; label: string; accent?: boolean; dim?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-5xl font-bold leading-none tracking-tight ${accent ? 'text-[#F5C33C]' : dim ? 'text-[#D0CFC9]' : 'text-[#1C1C1E]'}`}>
        {value}
      </p>
      <p className="text-xs text-[#9B9B9B] mt-1.5 font-medium flex items-center gap-1">
        <Users size={10} className="inline" />
        {label}
      </p>
    </div>
  );
}

function MetricPill({ label, value, pct, variant }: {
  label: string; value: number; total: number; pct: number; variant: 'yellow' | 'dark' | 'ghost';
}) {
  const base = 'flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm';
  const styles = {
    yellow: 'bg-[#F5C33C] text-[#1C1C1E]',
    dark:   'bg-[#1C1C1E] text-white',
    ghost:  'bg-white/70 text-[#9B9B9B] border border-[#E5E4DF]',
  };

  return (
    <div className={`${base} ${styles[variant]}`}>
      <div>
        <span className="font-bold">{value}</span>
        <span className={`text-xs ml-1.5 ${variant === 'ghost' ? 'text-[#C0BDB8]' : variant === 'yellow' ? 'text-[#1C1C1E]/60' : 'text-white/50'}`}>{label}</span>
      </div>
      <div className={`h-4 w-[1px] ${variant === 'ghost' ? 'bg-[#E5E4DF]' : variant === 'yellow' ? 'bg-[#1C1C1E]/20' : 'bg-white/20'}`} />
      <span className={`text-xs font-semibold ${variant === 'ghost' ? 'text-[#C0BDB8]' : variant === 'yellow' ? 'text-[#1C1C1E]/60' : 'text-white/60'}`}>
        {pct}%
      </span>
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

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-[#F4F3EE] rounded-xl flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] text-[#9B9B9B] leading-none">{label}</p>
        <p className="text-base font-bold text-[#1C1C1E] mt-0.5">{value}</p>
      </div>
    </div>
  );
}
