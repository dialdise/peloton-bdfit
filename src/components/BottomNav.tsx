import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, BarChart2, Settings } from 'lucide-react';

const TABS = [
  { to: '/',         icon: LayoutDashboard, label: 'Inicio'    },
  { to: '/athletes', icon: Users,           label: 'Atletas'   },
  { to: '/checkin',  icon: CheckSquare,     label: 'Check-In'  },
  { to: '/stats',    icon: BarChart2,       label: 'Stats'     },
  { to: '/settings', icon: Settings,        label: 'Config'    },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 shadow-lg z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex">
        {TABS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-h-[56px] ${
                isActive ? 'text-brand-orange' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-orange-50' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
