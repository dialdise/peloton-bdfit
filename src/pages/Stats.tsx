import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, Users, Activity, Trophy, Target } from 'lucide-react';
import Layout from '../components/Layout';
import { PelotonBadge, CoachBadge } from '../components/StatusBadge';
import type { AppData } from '../types';

interface Props { data: AppData }

export default function Stats({ data }: Props) {
  const { students, trainingDays } = data;
  const activeStudents = students.filter(s => s.active);

  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
      const day = trainingDays[d];
      return {
        date: d,
        label: format(subDays(new Date(), 6 - i), 'EEE', { locale: es }),
        present: day?.sessions.filter(s => s.status === 'present').length ?? 0,
        total: activeStudents.length,
      };
    });
  }, [trainingDays, activeStudents]);

  const maxPresent = Math.max(...last7.map(d => d.present), 1);

  const injuredCount = useMemo(() => students.filter(s => s.medical.currentInjury).length, [students]);
  const alertCount = useMemo(() => students.filter(s => s.hasAlert).length, [students]);

  const pelotonDistribution = useMemo(() => {
    const g: Record<number, number> = {};
    activeStudents.forEach(s => { g[s.peloton] = (g[s.peloton] ?? 0) + 1; });
    return Object.entries(g).map(([p, count]) => ({ peloton: Number(p), count })).sort((a, b) => a.peloton - b.peloton);
  }, [activeStudents]);

  const coachDistribution = useMemo(() => {
    const g: Record<string, number> = {};
    activeStudents.forEach(s => { g[s.coach] = (g[s.coach] ?? 0) + 1; });
    return Object.entries(g).map(([coach, count]) => ({ coach, count })).sort((a, b) => b.count - a.count);
  }, [activeStudents]);

  const topPerformers = useMemo(() => {
    const counts: Record<number, number> = {};
    Object.values(trainingDays).forEach(day => {
      day.sessions.filter(s => s.status === 'present').forEach(s => {
        counts[s.studentId] = (counts[s.studentId] ?? 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([id, count]) => ({ student: students.find(s => s.id === Number(id)), count }))
      .filter(x => x.student)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [trainingDays, students]);

  const overallAttendance = useMemo(() => {
    const days = Object.keys(trainingDays).length;
    if (!days) return 0;
    const totalPresent = Object.values(trainingDays).reduce((sum, day) =>
      sum + day.sessions.filter(s => s.status === 'present').length, 0);
    return Math.round((totalPresent / (days * activeStudents.length)) * 100);
  }, [trainingDays, activeStudents]);

  return (
    <Layout title="Estadísticas">
      <div className="px-4 pt-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <BigStat icon={<Users size={22} className="text-brand-orange" />} label="Atletas activos" value={activeStudents.length} />
          <BigStat icon={<Activity size={22} className="text-blue-500" />} label="Asistencia global" value={`${overallAttendance}%`} />
          <BigStat icon={<AlertTriangle size={22} className="text-orange-400" />} label="Lesionados" value={injuredCount} />
          <BigStat icon={<Target size={22} className="text-red-400" />} label="Con alerta" value={alertCount} />
        </div>

        {/* 7-day chart */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-brand-orange" />
            <span className="text-sm font-semibold text-gray-800">Asistencia — últimos 7 días</span>
          </div>
          <div className="flex items-end gap-1 h-24">
            {last7.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: '72px' }}>
                  <div
                    className="w-full bg-brand-orange rounded-t-lg transition-all duration-500 min-h-[4px]"
                    style={{ height: `${(d.present / maxPresent) * 72}px` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 capitalize">{d.label}</span>
                <span className="text-[10px] font-bold text-gray-600">{d.present}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peloton Distribution */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">Distribución por Peloton</span>
          </div>
          <div className="divide-y divide-gray-50">
            {pelotonDistribution.map(({ peloton, count }) => (
              <div key={peloton} className="px-4 py-3 flex items-center gap-3">
                <PelotonBadge peloton={peloton} />
                <div className="flex-1">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-orange rounded-full"
                      style={{ width: `${(count / activeStudents.length) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-700 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coach Distribution */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">Atletas por Coach</span>
          </div>
          <div className="divide-y divide-gray-50">
            {coachDistribution.map(({ coach, count }) => (
              <div key={coach} className="px-4 py-3 flex items-center gap-3">
                <CoachBadge coach={coach} />
                <div className="flex-1">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${(count / activeStudents.length) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-700 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top performers */}
        {topPerformers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Trophy size={15} className="text-brand-orange" />
              <span className="text-sm font-semibold text-gray-800">Mejor asistencia</span>
            </div>
            <div className="divide-y divide-gray-50">
              {topPerformers.map(({ student, count }, i) => (
                <div key={student!.id} className="px-4 py-3 flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                  }`}>{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-800">{student!.name}</span>
                  <span className="text-sm font-bold text-brand-orange">{count} sesiones</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Injuries */}
        {injuredCount > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-orange-100 bg-orange-50 flex items-center gap-2">
              <AlertTriangle size={15} className="text-orange-500" />
              <span className="text-sm font-semibold text-orange-700">Atletas lesionados ({injuredCount})</span>
            </div>
            <div className="divide-y divide-gray-50">
              {students.filter(s => s.medical.currentInjury).map(s => (
                <div key={s.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-800">{s.name}</span>
                    <PelotonBadge peloton={s.peloton} />
                  </div>
                  <p className="text-xs text-gray-500">{s.medical.currentInjury}</p>
                  {s.medical.injuryLevel && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                      s.medical.injuryLevel === 'leve' ? 'bg-yellow-100 text-yellow-700' :
                      s.medical.injuryLevel === 'moderada' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-600'
                    }`}>{s.medical.injuryLevel}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </Layout>
  );
}

function AlertTriangle({ size, className }: { size: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
}

function BigStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <span className="text-3xl font-bold text-gray-800">{value}</span>
    </div>
  );
}
