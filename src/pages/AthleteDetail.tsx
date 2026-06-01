import { useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Save, Phone, AlertTriangle, Heart, Trophy,
  Activity, Calendar, ChevronDown, ChevronUp, Loader, UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppData, Student, BloodType, Gender, InjuryLevel } from '../types';
import { PelotonBadge, CoachBadge, AttendanceBadge } from '../components/StatusBadge';

interface Props {
  data: AppData;
  onSave: (s: Student) => Promise<void>;
  saving: boolean;
}

const COACHES = ['Bruno', 'Interino', 'Sergio', 'Crisha', 'Jesus'];
const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS: { v: Gender; l: string }[] = [{ v: 'M', l: 'Masculino' }, { v: 'F', l: 'Femenino' }, { v: 'Otro', l: 'Otro' }];
const INJURY_LEVELS: { v: InjuryLevel; l: string; color: string }[] = [
  { v: 'leve', l: 'Leve', color: 'bg-yellow-100 text-yellow-700' },
  { v: 'moderada', l: 'Moderada', color: 'bg-orange-100 text-orange-700' },
  { v: 'grave', l: 'Grave', color: 'bg-red-100 text-red-600' },
];
const PHASES = ['Base', 'Build', 'Peak', 'Taper', 'Recovery'] as const;
const AVATAR_COLORS = ['bg-blue-500','bg-purple-500','bg-pink-500','bg-indigo-500','bg-teal-500','bg-green-500','bg-orange-500','bg-red-500'];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export default function AthleteDetail({ data, onSave, saving }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = id === 'new';

  const locationGroup = (location.state as { group?: string } | null)?.group;
  const defaultGroup: 'mypp' | 'bdfit' = locationGroup === 'bdfit' ? 'bdfit' : 'mypp';
  const defaultCoach = defaultGroup === 'bdfit' ? 'Bruno' : 'Interino';

  const DEFAULT_STUDENT: Student = {
    id: 0, name: '', coach: defaultCoach, peloton: 0, mainDistance: '21km',
    group: defaultGroup,
    trainingType: 'Presencial', active: true, notes: '', hasAlert: false, alertMessage: '',
    medical: { conditions: '', currentInjury: '', medications: '', emergencyContact: '', emergencyPhone: '' },
    performance: { weeklyKmGoal: 40, currentTrainingPhase: 'Base', shoeKm: 0 },
  };

  const original = isNew
    ? DEFAULT_STUDENT
    : data.students.find(s => s.id === Number(id));

  const [student, setStudent] = useState<Student>(original ?? DEFAULT_STUDENT);
  const [activeTab, setActiveTab] = useState<'profile' | 'medical' | 'performance' | 'history'>('profile');
  const [saved, setSaved] = useState(false);

  if (!original && !isNew) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4">
        <p className="text-gray-500">Atleta no encontrado</p>
        <button onClick={() => navigate(-1)} className="text-brand-orange font-semibold">← Volver</button>
      </div>
    );
  }

  const upd = <K extends keyof Student>(key: K, val: Student[K]) =>
    setStudent(s => ({ ...s, [key]: val }));
  const updMed = <K extends keyof Student['medical']>(key: K, val: Student['medical'][K]) =>
    setStudent(s => ({ ...s, medical: { ...s.medical, [key]: val } }));
  const updPerf = <K extends keyof Student['performance']>(key: K, val: Student['performance'][K]) =>
    setStudent(s => ({ ...s, performance: { ...s.performance, [key]: val } }));

  const handleSave = useCallback(async () => {
    let toSave = student;
    if (isNew) {
      const maxId = data.students.length > 0 ? Math.max(...data.students.map(s => s.id)) : 0;
      toSave = { ...student, id: maxId + 1 };
    }
    await onSave(toSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (isNew) navigate(`/athletes/${toSave.id}`, { replace: true, state: { group: toSave.group } });
  }, [student, onSave, isNew, data.students, navigate]);

  // Recent sessions for history tab
  const recentSessions = Object.entries(data.trainingDays)
    .flatMap(([date, day]) =>
      day.sessions
        .filter(s => s.studentId === student.id)
        .map(s => ({ date, ...s }))
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  const avatarColor = AVATAR_COLORS[student.id % AVATAR_COLORS.length];

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      {/* Header */}
      <div className="bg-brand-dark safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-white p-1 -ml-1">
            <ArrowLeft size={22} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          >
            {saving ? <Loader size={15} className="animate-spin" /> : saved ? '✓' : <Save size={15} />}
            {saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-4 pb-6 flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${avatarColor}`}>
            <span className="text-white text-xl font-bold">{isNew ? <UserPlus size={28} /> : initials(student.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <input
              className="bg-transparent text-white text-xl font-bold w-full focus:outline-none placeholder-white/40"
              placeholder="Nombre del atleta"
              value={student.name}
              onChange={e => upd('name', e.target.value)}
            />
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <PelotonBadge peloton={student.peloton} />
              <CoachBadge coach={student.coach} />
              {student.medical.currentInjury && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle size={10} /> Lesión
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {(['profile','medical','performance','history'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 text-xs font-semibold capitalize transition-colors ${
                activeTab === t ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-white/50'
              }`}
            >
              {t === 'profile' ? 'Perfil' : t === 'medical' ? 'Médico' : t === 'performance' ? 'Rendimiento' : 'Historial'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollable px-4 py-4 pb-safe space-y-4">
        {activeTab === 'profile' && (
          <>
            <Section title="Información General" icon={<Activity size={15} />}>
              <Row label="Coach">
                <Select value={student.coach} onChange={v => upd('coach', v)} options={COACHES.map(c => ({ v: c, l: c }))} />
              </Row>
              <Row label="Peloton">
                <Select value={String(student.peloton)} onChange={v => upd('peloton', Number(v))}
                  options={[0,1,2,3,4,5,6,7].map(p => ({ v: String(p), l: `Peloton ${p}` }))} />
              </Row>
              <Row label="Distancia">
                <Select value={student.mainDistance} onChange={v => upd('mainDistance', v)}
                  options={[{ v: '21km', l: '21 km (Media Maratón)' }, { v: '42km', l: '42 km (Maratón)' }, { v: '10km', l: '10 km' }, { v: '5km', l: '5 km' }]} />
              </Row>
              <Row label="Tipo">
                <Select value={student.trainingType} onChange={v => upd('trainingType', v as Student['trainingType'])}
                  options={[{ v: 'Presencial', l: 'Presencial' }, { v: 'Virtual', l: 'Virtual' }, { v: 'Mixto', l: 'Mixto' }]} />
              </Row>
              <Row label="Género">
                <Select value={student.gender ?? ''} onChange={v => upd('gender', v as Gender)}
                  options={[{ v: '', l: 'No especificado' }, ...GENDERS]} />
              </Row>
              <Row label="Edad">
                <TextInput type="number" value={String(student.age ?? '')} onChange={v => upd('age', v ? Number(v) : undefined)} placeholder="Años" />
              </Row>
              <Row label="Estado">
                <button
                  onClick={() => upd('active', !student.active)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${student.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {student.active ? '✓ Activo' : '✗ Inactivo'}
                </button>
              </Row>
            </Section>

            <Section title="Contacto" icon={<Phone size={15} />}>
              <Row label="Teléfono">
                <TextInput type="tel" value={student.phone ?? ''} onChange={v => upd('phone', v)} placeholder="+51 999 000 000" />
              </Row>
              <Row label="Email">
                <TextInput type="email" value={student.email ?? ''} onChange={v => upd('email', v)} placeholder="atleta@email.com" />
              </Row>
            </Section>

            <Section title="Alertas y Notas" icon={<AlertTriangle size={15} />}>
              <div className="space-y-2">
                <label className="flex items-center gap-3 py-1">
                  <button
                    onClick={() => upd('hasAlert', !student.hasAlert)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${student.hasAlert ? 'bg-red-400' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${student.hasAlert ? 'left-7' : 'left-1'}`} />
                  </button>
                  <span className="text-sm text-gray-700">Tiene alerta activa</span>
                </label>
                {student.hasAlert && (
                  <TextInput value={student.alertMessage} onChange={v => upd('alertMessage', v)} placeholder="Describe la alerta…" />
                )}
              </div>
              <div className="mt-3">
                <label className="text-xs text-gray-500 mb-1 block">Notas generales</label>
                <textarea
                  value={student.notes}
                  onChange={e => upd('notes', e.target.value)}
                  rows={3}
                  placeholder="Observaciones del coach…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 resize-none"
                />
              </div>
            </Section>
          </>
        )}

        {activeTab === 'medical' && (
          <>
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <Heart size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-orange-700">Información médica confidencial. Mantenla actualizada para emergencias.</p>
            </div>

            <Section title="Condición Actual" icon={<Activity size={15} />}>
              <Row label="Tipo de sangre">
                <Select value={student.medical.bloodType ?? ''} onChange={v => updMed('bloodType', v as BloodType || undefined)}
                  options={[{ v: '', l: 'No registrado' }, ...BLOOD_TYPES.map(b => ({ v: b, l: b }))]} />
              </Row>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Condiciones médicas</label>
                <textarea
                  value={student.medical.conditions}
                  onChange={e => updMed('conditions', e.target.value)}
                  rows={2}
                  placeholder="Diabetes, hipertensión, asma, etc."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Medicamentos</label>
                <textarea
                  value={student.medical.medications}
                  onChange={e => updMed('medications', e.target.value)}
                  rows={2}
                  placeholder="Medicamentos actuales…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 resize-none"
                />
              </div>
            </Section>

            <Section title="Lesión Actual" icon={<AlertTriangle size={15} />}>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Descripción de la lesión</label>
                <textarea
                  value={student.medical.currentInjury}
                  onChange={e => updMed('currentInjury', e.target.value)}
                  rows={2}
                  placeholder="Rodilla derecha, tibial anterior, etc. Dejar vacío si no hay lesión."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 resize-none"
                />
              </div>
              {student.medical.currentInjury && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Severidad</label>
                  <div className="flex gap-2">
                    {INJURY_LEVELS.map(({ v, l, color }) => (
                      <button
                        key={v}
                        onClick={() => updMed('injuryLevel', v)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          student.medical.injuryLevel === v ? color + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Row label="Alta médica">
                <TextInput type="date" value={student.medical.clearanceDate ?? ''} onChange={v => updMed('clearanceDate', v)} />
              </Row>
            </Section>

            <Section title="Contacto de Emergencia" icon={<Phone size={15} />}>
              <Row label="Nombre">
                <TextInput value={student.medical.emergencyContact} onChange={v => updMed('emergencyContact', v)} placeholder="Nombre del contacto" />
              </Row>
              <Row label="Teléfono">
                <TextInput type="tel" value={student.medical.emergencyPhone} onChange={v => updMed('emergencyPhone', v)} placeholder="+51 999 000 000" />
              </Row>
            </Section>
          </>
        )}

        {activeTab === 'performance' && (
          <>
            <Section title="Récords Personales" icon={<Trophy size={15} />}>
              {[['5km', 'pr5k'], ['10km', 'pr10k'], ['21km', 'pr21k'], ['42km', 'pr42k']].map(([label, key]) => (
                <Row key={key} label={label}>
                  <TextInput
                    value={(student.performance as Record<string, string | undefined>)[key] ?? ''}
                    onChange={v => updPerf(key as keyof Student['performance'], v || undefined)}
                    placeholder="h:mm:ss"
                  />
                </Row>
              ))}
            </Section>

            <Section title="Plan de Entrenamiento" icon={<Activity size={15} />}>
              <Row label="Fase actual">
                <Select
                  value={student.performance.currentTrainingPhase ?? 'Base'}
                  onChange={v => updPerf('currentTrainingPhase', v as typeof PHASES[number])}
                  options={PHASES.map(p => ({ v: p, l: p }))}
                />
              </Row>
              <Row label="Meta km/semana">
                <TextInput
                  type="number"
                  value={String(student.performance.weeklyKmGoal ?? '')}
                  onChange={v => updPerf('weeklyKmGoal', v ? Number(v) : undefined)}
                  placeholder="km"
                />
              </Row>
              <Row label="Km en zapatillas">
                <TextInput
                  type="number"
                  value={String(student.performance.shoeKm ?? '')}
                  onChange={v => updPerf('shoeKm', v ? Number(v) : undefined)}
                  placeholder="km acumulados"
                />
              </Row>
              {(student.performance.shoeKm ?? 0) > 600 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-xs text-yellow-700 flex items-center gap-2">
                  <AlertTriangle size={12} /> Zapatillas con más de 600km — considera reemplazarlas
                </div>
              )}
              <Row label="VO₂ Max">
                <TextInput
                  type="number"
                  value={String(student.performance.vo2max ?? '')}
                  onChange={v => updPerf('vo2max', v ? Number(v) : undefined)}
                  placeholder="ml/kg/min"
                />
              </Row>
            </Section>

            {/* Last race */}
            {student.lastRaceTime && (
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="text-xs text-gray-500 mb-1">Último resultado de carrera</p>
                <div className="flex items-center gap-3">
                  <Trophy size={20} className="text-brand-orange" />
                  <div>
                    <p className="text-xl font-bold text-gray-800">{student.lastRaceTime}</p>
                    <p className="text-xs text-gray-400">{student.mainDistance}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {recentSessions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">Sin sesiones registradas</p>
              </div>
            ) : (
              recentSessions.map((s, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center gap-3">
                  <div className="text-center w-12 flex-shrink-0">
                    <p className="text-xs font-bold text-gray-700 capitalize">
                      {format(new Date(s.date + 'T12:00:00'), 'EEE', { locale: es })}
                    </p>
                    <p className="text-lg font-bold text-brand-orange leading-none">
                      {format(new Date(s.date + 'T12:00:00'), 'd')}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {format(new Date(s.date + 'T12:00:00'), 'MMM', { locale: es })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <AttendanceBadge status={s.status} />
                      {s.distance && <span className="text-xs text-gray-500">{s.distance} km</span>}
                      {s.pace && <span className="text-xs text-gray-500">{s.pace} /km</span>}
                    </div>
                    {s.notes && <p className="text-xs text-gray-400 truncate">{s.notes}</p>}
                  </div>
                  {s.rpe && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">RPE {s.rpe}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}

// Helper components
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full px-4 py-3 flex items-center gap-2 border-b border-gray-100"
      >
        <span className="text-brand-orange">{icon}</span>
        <span className="text-sm font-semibold text-gray-800 flex-1 text-left">{title}</span>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 py-3 space-y-3">{children}</div>}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 min-h-[44px]">
      <label className="text-xs text-gray-500 w-28 flex-shrink-0">{label}</label>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-right text-sm text-gray-800 focus:outline-none focus:text-brand-orange placeholder-gray-300 bg-transparent"
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { v: string; l: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-sm text-gray-800 bg-transparent focus:outline-none text-right"
    >
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}
