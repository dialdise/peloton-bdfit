import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, BarChart2, Settings, Dumbbell } from 'lucide-react';

const TABS = [
  { to: '/',         icon: LayoutDashboard, label: 'Pelotón MYPP', end: true  },
  { to: '/bdfit',    icon: Dumbbell,        label: 'Pelotón BDFIT', end: true },
  { to: '/athletes', icon: Users,           label: 'Atletas',       end: false },
  { to: '/checkin',  icon: CheckSquare,     label: 'Check-In',      end: false },
  { to: '/stats',    icon: BarChart2,       label: 'Stats',         end: false },
  { to: '/settings', icon: Settings,        label: 'Configuración', end: false },
];

export default function SideNav() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/10">
        <p className="text-white font-bold text-base tracking-tight leading-tight">Peloton</p>
        <p className="text-brand-orange text-xs font-semibold mt-0.5">Coach Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {TABS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-brand-orange text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-sm font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/40 text-xs font-medium">Coach Bruno</p>
      </div>
    </div>
  );
}
