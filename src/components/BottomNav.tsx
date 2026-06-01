import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, BarChart2, Settings, Dumbbell } from 'lucide-react';

const TABS = [
  { to: '/',         icon: LayoutDashboard, label: 'MYPP',     end: true  },
  { to: '/bdfit',    icon: Dumbbell,        label: 'BDFIT',    end: true  },
  { to: '/athletes', icon: Users,           label: 'Atletas',  end: false },
  { to: '/checkin',  icon: CheckSquare,     label: 'Check-In', end: false },
  { to: '/stats',    icon: BarChart2,       label: 'Stats',    end: false },
  { to: '/settings', icon: Settings,        label: 'Config',   end: false },
];

export default function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-white border-t border-gray-100 shadow-lg z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', maxWidth: 'min(100%, 430px)' }}
    >
      <div className="flex">
        {TABS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-h-[56px] ${
                isActive ? 'text-brand-orange' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-orange-50' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className="text-[9px] font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
