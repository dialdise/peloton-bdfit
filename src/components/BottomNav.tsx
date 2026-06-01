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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-3 mb-3 bg-[#1C1C1E]/96 backdrop-blur-xl rounded-2xl shadow-card-md overflow-hidden">
        <div className="flex">
          {TABS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all ${
                  isActive ? 'text-[#F5C33C]' : 'text-white/35 hover:text-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-[8px] font-semibold leading-none tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
