import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, AlertTriangle, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { PelotonBadge, CoachBadge } from '../components/StatusBadge';
import type { AppData } from '../types';

interface Props { data: AppData }

const COACHES = ['Todos', 'Bruno', 'Interino', 'Sergio', 'Crisha', 'Jesus'];
const PELOTONS = ['Todos', '0', '1', '2', '3', '4', '5', '6', '7'];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-teal-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500',
];

export default function Athletes({ data }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [coachFilter, setCoachFilter] = useState('Todos');
  const [pelotonFilter, setPelotonFilter] = useState('Todos');
  const [showInactive, setShowInactive] = useState(false);

  const filtered = useMemo(() => {
    return data.students.filter(s => {
      if (s.group === 'bdfit') return false;
      if (!showInactive && !s.active) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (coachFilter !== 'Todos' && s.coach !== coachFilter) return false;
      if (pelotonFilter !== 'Todos' && s.peloton !== Number(pelotonFilter)) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [data.students, search, coachFilter, pelotonFilter, showInactive]);

  return (
    <Layout title="Atletas" action={
      <button onClick={() => navigate('/athletes/new')} className="text-white">
        <Plus size={22} />
      </button>
    }>
      <div className="px-4 pt-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar atleta…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          />
        </div>

        {/* Coach filter */}
        <div className="flex gap-2 overflow-x-auto scrollable pb-1">
          {COACHES.map(c => (
            <button
              key={c}
              onClick={() => setCoachFilter(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                coachFilter === c ? 'bg-brand-dark text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Peloton filter */}
        <div className="flex gap-2 overflow-x-auto scrollable pb-1">
          {PELOTONS.map(p => (
            <button
              key={p}
              onClick={() => setPelotonFilter(p)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                pelotonFilter === p ? 'bg-brand-orange text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {p === 'Todos' ? 'Todos' : `P${p}`}
            </button>
          ))}
        </div>

        {/* Count + inactive toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{filtered.length} atletas</span>
          <button
            onClick={() => setShowInactive(p => !p)}
            className="text-xs text-brand-orange font-medium"
          >
            {showInactive ? 'Ocultar inactivos' : 'Ver inactivos'}
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50 overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">No se encontraron atletas</p>
          ) : (
            filtered.map((s, i) => (
              <button
                key={s.id}
                onClick={() => navigate(`/athletes/${s.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-orange-50 transition-colors"
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]} ${!s.active ? 'opacity-40' : ''}`}>
                  <span className="text-white text-xs font-bold">{initials(s.name)}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${!s.active ? 'text-gray-400' : 'text-gray-800'}`}>
                      {s.name}
                    </span>
                    {s.hasAlert || s.medical.currentInjury ? (
                      <AlertTriangle size={12} className="text-orange-400 flex-shrink-0" />
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <PelotonBadge peloton={s.peloton} />
                    <CoachBadge coach={s.coach} />
                    <span className="text-xs text-gray-400">{s.mainDistance}</span>
                  </div>
                </div>

                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </button>
            ))
          )}
        </div>
        <div className="h-2" />
      </div>
    </Layout>
  );
}
