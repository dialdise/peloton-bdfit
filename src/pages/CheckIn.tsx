import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, Search, CheckCircle2, XCircle,
  AlertTriangle, Clock, ChevronDown, ChevronUp, Loader, Save
} from 'lucide-react';
import Layout from '../components/Layout';
import { PelotonBadge } from '../components/StatusBadge';
import type { AppData, SessionEntry, AttendanceStatus } from '../types';

interface Props {
  data: AppData;
  onSessionUpdate: (date: string, session: SessionEntry) => Promise<void>;
  saving: boolean;
}

const AVATAR_COLORS = ['bg-blue-500','bg-purple-500','bg-pink-500','bg-indigo-500','bg-teal-500','bg-green-500','bg-orange-500','bg-red-500'];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

const STATUS_CYCLE: AttendanceStatus[] = ['present', 'absent', 'excused', 'injured'];

const STATUS_UI: Record<AttendanceStatus, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
  present: { icon: <CheckCircle2 size={18} />, bg: 'bg-green-500', text: 'text-white', label: 'Presente' },
  absent:  { icon: <XCircle size={18} />,       bg: 'bg-red-400',   text: 'text-white', label: 'Ausente' },
  excused: { icon: <Clock size={18} />,          bg: 'bg-yellow-400',text: 'text-white', label: 'Justificado' },
  injured: { icon: <AlertTriangle size={18} />, bg: 'bg-orange-400',text: 'text-white', label: 'Lesionado' },
};

function dateStr(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export default function CheckIn({ data, onSessionUpdate, saving }: Props) {
  const [date, setDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sessionEdits, setSessionEdits] = useState<Record<number, Partial<SessionEntry>>>({});
  const [pendingSave, setPendingSave] = useState<Set<number>>(new Set());

  const day = data.trainingDays[dateStr(date)];
  const activeStudents = data.students.filter(s => s.active);

  const getSession = useCallback((studentId: number): SessionEntry | undefined => {
    return day?.sessions.find(s => s.studentId === studentId);
  }, [day]);

  const filtered = useMemo(() => {
    return activeStudents.filter(s =>
      !search || s.name.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => a.peloton - b.peloton || a.name.localeCompare(b.name));
  }, [activeStudents, search]);

  const presentCount = day?.sessions.filter(s => s.status === 'present').length ?? 0;

  const shiftDate = (n: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    setDate(d);
  };

  const cycleStatus = useCallback(async (studentId: number) => {
    const current = getSession(studentId);
    const currentStatus = current?.status ?? 'present';
    const nextIdx = (STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length;
    const nextStatus = STATUS_CYCLE[nextIdx];

    const session: SessionEntry = {
      ...(current ?? { studentId }),
      studentId,
      status: nextStatus,
      ...sessionEdits[studentId],
    };

    await onSessionUpdate(dateStr(date), session);
  }, [getSession, onSessionUpdate, date, sessionEdits]);

  const saveSessionDetails = useCallback(async (studentId: number) => {
    const current = getSession(studentId);
    const edits = sessionEdits[studentId] ?? {};
    const session: SessionEntry = {
      studentId,
      status: current?.status ?? 'present',
      ...current,
      ...edits,
    };
    setPendingSave(p => new Set(p).add(studentId));
    await onSessionUpdate(dateStr(date), session);
    setPendingSave(p => { const n = new Set(p); n.delete(studentId); return n; });
    setExpandedId(null);
    setSessionEdits(p => { const n = { ...p }; delete n[studentId]; return n; });
  }, [getSession, sessionEdits, onSessionUpdate, date]);

  const markAll = useCallback(async (status: AttendanceStatus) => {
    for (const s of filtered) {
      const current = getSession(s.id);
      const session: SessionEntry = { studentId: s.id, status, ...(current ?? {}) };
      await onSessionUpdate(dateStr(date), session);
    }
  }, [filtered, getSession, onSessionUpdate, date]);

  return (
    <Layout title="Check-In">
      <div className="px-4 pt-4 space-y-4">
        {/* Date navigation */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => shiftDate(-1)} className="p-2 rounded-xl active:bg-gray-100">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-800 capitalize">
                {format(date, "EEEE, d 'de' MMMM", { locale: es })}
              </p>
              <p className="text-xs text-gray-400">{format(date, 'yyyy')}</p>
            </div>
            <button
              onClick={() => shiftDate(1)}
              disabled={dateStr(date) >= dateStr(new Date())}
              className="p-2 rounded-xl active:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-orange rounded-full transition-all duration-300"
                style={{ width: activeStudents.length > 0 ? `${(presentCount / activeStudents.length) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-xs font-bold text-gray-600">
              {presentCount}/{activeStudents.length}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <StatPill label="Presentes" value={presentCount} color="text-green-600" />
            <StatPill label="Ausentes" value={day?.sessions.filter(s => s.status === 'absent').length ?? 0} color="text-red-500" />
            <StatPill label="Justific." value={day?.sessions.filter(s => s.status === 'excused').length ?? 0} color="text-yellow-600" />
            <StatPill label="Lesión" value={day?.sessions.filter(s => s.status === 'injured').length ?? 0} color="text-orange-500" />
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            onClick={() => markAll('present')}
            className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform"
          >
            ✓ Todos presentes
          </button>
          <button
            onClick={() => markAll('absent')}
            className="flex-1 py-2.5 bg-red-400 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform"
          >
            ✗ Todos ausentes
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar atleta…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
          />
        </div>

        {/* Student list */}
        <div className="space-y-2">
          {filtered.map((student, i) => {
            const session = getSession(student.id);
            const status = session?.status;
            const ui = status ? STATUS_UI[status] : null;
            const isExpanded = expandedId === student.id;
            const isSaving = pendingSave.has(student.id);

            return (
              <div key={student.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-3 py-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    <span className="text-white text-xs font-bold">{initials(student.name)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0" onClick={() => setExpandedId(isExpanded ? null : student.id)}>
                    <p className="text-sm font-semibold text-gray-800 truncate">{student.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <PelotonBadge peloton={student.peloton} />
                      {session?.distance && <span className="text-xs text-gray-400">{session.distance}km</span>}
                      {session?.pace && <span className="text-xs text-gray-400">{session.pace}/km</span>}
                    </div>
                  </div>

                  {/* Status button */}
                  <button
                    onClick={() => cycleStatus(student.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
                      ui ? `${ui.bg} ${ui.text}` : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {ui ? ui.icon : <span className="text-lg">•••</span>}
                  </button>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : student.id)}
                    className="p-1 text-gray-400"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Distancia (km)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="km"
                          defaultValue={session?.distance ?? ''}
                          onChange={e => setSessionEdits(p => ({ ...p, [student.id]: { ...p[student.id], distance: Number(e.target.value) } }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Pace (min/km)</label>
                        <input
                          type="text"
                          placeholder="5:30"
                          defaultValue={session?.pace ?? ''}
                          onChange={e => setSessionEdits(p => ({ ...p, [student.id]: { ...p[student.id], pace: e.target.value } }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">FC media (bpm)</label>
                        <input
                          type="number"
                          placeholder="150"
                          defaultValue={session?.heartRateAvg ?? ''}
                          onChange={e => setSessionEdits(p => ({ ...p, [student.id]: { ...p[student.id], heartRateAvg: Number(e.target.value) } }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">RPE (1-10)</label>
                        <input
                          type="number"
                          min="1" max="10"
                          placeholder="6"
                          defaultValue={session?.rpe ?? ''}
                          onChange={e => setSessionEdits(p => ({ ...p, [student.id]: { ...p[student.id], rpe: Number(e.target.value) } }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Notas</label>
                      <textarea
                        rows={2}
                        placeholder="Observaciones…"
                        defaultValue={session?.notes ?? ''}
                        onChange={e => setSessionEdits(p => ({ ...p, [student.id]: { ...p[student.id], notes: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 resize-none"
                      />
                    </div>
                    <button
                      onClick={() => saveSessionDetails(student.id)}
                      disabled={isSaving}
                      className="w-full bg-brand-orange text-brand-dark py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      {isSaving ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
                      Guardar sesión
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {saving && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <Loader size={12} className="animate-spin" />
            Sincronizando…
          </div>
        )}

        <div className="h-4" />
      </div>
    </Layout>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  );
}
