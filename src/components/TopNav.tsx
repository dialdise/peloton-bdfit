import { NavLink } from 'react-router-dom';
import { Bell } from 'lucide-react';

const TABS = [
  { to: '/',         label: 'MYPP',     end: true  },
  { to: '/bdfit',    label: 'BDFIT',    end: true  },
  { to: '/athletes', label: 'Atletas',  end: false },
  { to: '/checkin',  label: 'Check-In', end: false },
  { to: '/stats',    label: 'Stats',    end: false },
  { to: '/settings', label: 'Config',   end: false },
];

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 bg-[#F4F3EE]/90 backdrop-blur-md border-b border-[#E5E4DF]">
      <div className="flex items-center gap-4 px-6 h-15 max-w-screen-xl mx-auto" style={{ height: '60px' }}>
        {/* Logo */}
        <div className="flex-shrink-0 bg-white border border-[#E5E4DF] rounded-xl px-3 py-1.5 shadow-sm">
          <span className="font-bold text-sm text-[#1C1C1E] tracking-tight">Peloton</span>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-0.5 flex-1">
          {TABS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1C1C1E] text-white shadow-sm'
                    : 'text-[#9B9B9B] hover:text-[#1C1C1E] hover:bg-white/70'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="w-8 h-8 rounded-xl bg-white/70 border border-[#E5E4DF] flex items-center justify-center text-[#9B9B9B] hover:text-[#1C1C1E] transition-colors">
            <Bell size={15} />
          </button>
          <div className="w-8 h-8 rounded-xl bg-[#1C1C1E] flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">B</span>
          </div>
        </div>
      </div>
    </header>
  );
}
