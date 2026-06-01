import type { AttendanceStatus } from '../types';

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; className: string }> = {
  present:  { label: 'Presente',   className: 'bg-green-100 text-green-700' },
  absent:   { label: 'Ausente',    className: 'bg-red-100 text-red-600'     },
  excused:  { label: 'Justificado',className: 'bg-yellow-100 text-yellow-700' },
  injured:  { label: 'Lesionado',  className: 'bg-orange-100 text-orange-700' },
};

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.className}`}>
      {c.label}
    </span>
  );
}

export function PelotonBadge({ peloton }: { peloton: number }) {
  const colors = [
    'bg-purple-100 text-purple-700',
    'bg-blue-100 text-blue-700',
    'bg-cyan-100 text-cyan-700',
    'bg-teal-100 text-teal-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-orange-100 text-orange-700',
    'bg-red-100 text-red-700',
  ];
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[peloton] ?? colors[0]}`}>
      P{peloton}
    </span>
  );
}

export function CoachBadge({ coach }: { coach: string }) {
  const colors: Record<string, string> = {
    'Interino': 'bg-gray-100 text-gray-600',
    'Sergio':   'bg-indigo-100 text-indigo-700',
    'Crisha':   'bg-pink-100 text-pink-700',
    'Jesus':    'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[coach] ?? 'bg-gray-100 text-gray-600'}`}>
      {coach}
    </span>
  );
}
