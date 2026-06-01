import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Users, TrendingUp, CheckCircle2, XCircle, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { PelotonBadge } from '../components/StatusBadge';
import type { AppData } from '../types';

const today = format(new Date(), 'yyyy-MM-dd');

interface Props { data: AppData }

export default function Dashboard({ data }: Props) {
  const navigate = useNavigate();
  const todayLog = data.trainingDays[today];
  const activeStudents = data.students.filter(s => s.active && (s.group === 'mypp' || !s.group));

  const todayPresent = todayLog?.sessions.filter(s => s.status === 'present').length ?? 0;
  const todayAbsent = todayLog?.sessions.filter(s => s.status === 'absent').length ?? 0;
  const todayInjured = todayLog?.sessions.filter(s => s.status === 'injured').length ?? 0;
  const todayChecked = todayLog?.sessions.length ?? 0;

  const alerts = useMemo(() => {
    const list: { id: number; name: string; msg: string; type: 'injury' | 'alert' }[] = [];
    data.students.forEach(s => {
      if (s.medical.currentInjury) list.push({ id: s.id, name: s.name, msg: s.medical.currentInjury, type: 'injury' });
      if (s.hasAlert && s.alertMessage) list.push({ id: s.id, name: s.name, msg: s.alertMessage, type: 'alert' });
    });
    return list;
  }, [data.students]);

  const pelotonStats = useMemo(() => {
    const groups: Record<number, { total: number; present: number }> = {};
    activeStudents.forEach(s => {
      if (!groups[s.peloton]) groups[s.peloton] = { total: 0, present: 0 };
      groups[s.peloton].total++;
      const session = todayLog?.sessions.find(sess => sess.studentId === s.id);
      if (session?.status === 'present') groups[s.peloton].present++;
    });
    return Object.entries(groups).map(([p, v]) => ({ peloton: Number(p), ...v })).sort((a,b) => a.peloton - b.peloton);
  }, [activeStudents, todayLog]);

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
        <p className="text-white/60 text-sm mt-2">{greet()}, Coach 👋</p>
        <h1 className="text-white text-2xl font-bold mt-0.5">Pelotón MYPP</h1>
        <p className="text-brand-orange text-sm font-medium capitalize">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Today Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-brand-orange px-4 py-3 flex items-center justify-between">
            <span className="text-white font-bold text-sm uppercase tracking-wider">Sesión de Hoy</span>
            <span className="text-white/80 text-xs">{todayChecked}/{activeStudents.length} registrados</span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <Stat icon={<CheckCircle2 size={18} className="text-green-500" />} label="Presentes" value={todayPresent} color="text-green-600" />
            <Stat icon={<XCircle size={18} className="text-red-400" />} label="Ausentes" value={todayAbsent} color="text-red-500" />
            <Stat icon={<AlertTriangle size={18} className="text-orange-400" />} label="Lesionados" value={todayInjured} color="text-orange-500" />
          </div>
          <button
            onClick={() => navigate('/checkin')}
            className="w-full py-3 text-brand-orange text-sm font-semibold border-t border-gray-100 active:bg-orange-50 transition-colors"
          >
            Registrar asistencia →
          </button>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" />
              <span className="font-semibold text-gray-800 text-sm">Alertas ({alerts.length})</span>
            </div>
            <div className="divide-y divide-gray-50">
              {alerts.slice(0, 5).map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/athletes/${a.id}`)}
                  className="w-full px-4 py-3 flex items-start gap-3 text-left active:bg-gray-50"
                >
                  <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${a.type === 'injury' ? 'bg-orange-400' : 'bg-red-400'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{a.name}</p>
                    <p className="text-xs text-gray-500 truncate">{a.msg}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* General Stats */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard
            icon={<Users size={20} className="text-brand-orange" />}
            label="Total Atletas"
            value={activeStudents.length}
            sub="activos"
          />
          <InfoCard
            icon={<TrendingUp size={20} className="text-blue-500" />}
            label="Pelotons"
            value={8}
            sub="grupos (0–7)"
          />
        </div>

        {/* Peloton Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Zap size={16} className="text-brand-orange" />
            <span className="font-semibold text-gray-800 text-sm">Asistencia por Peloton</span>
          </div>
          <div className="divide-y divide-gray-50">
            {pelotonStats.map(({ peloton, total, present }) => {
              const pct = total > 0 && todayChecked > 0 ? Math.round((present / total) * 100) : 0;
              return (
                <div key={peloton} className="px-4 py-3 flex items-center gap-3">
                  <PelotonBadge peloton={peloton} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{total} atletas</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-orange rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-10 text-right">
                    {present}/{total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => navigate('/athletes/new')}
          className="w-full bg-brand-dark text-white py-4 rounded-2xl font-semibold text-sm shadow-sm active:scale-95 transition-transform"
        >
          + Agregar nuevo atleta
        </button>

        <div className="h-2" />
      </div>
    </Layout>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center py-4 gap-1">
      {icon}
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

function InfoCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <span className="text-3xl font-bold text-gray-800">{value}</span>
      <span className="text-xs text-gray-400">{sub}</span>
    </div>
  );
}
