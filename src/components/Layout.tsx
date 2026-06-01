import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import SideNav from './SideNav';

interface Props {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}

export default function Layout({ children, title, action }: Props) {
  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-56 bg-brand-dark fixed inset-y-0 left-0 z-50">
        <SideNav />
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-56">
        {title && (
          <header className="bg-brand-dark text-white px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-40 safe-top">
            <h1 className="text-lg font-bold tracking-tight">{title}</h1>
            {action && <div>{action}</div>}
          </header>
        )}
        <main className="flex-1 pb-safe overflow-y-auto scrollable">
          {children}
        </main>
        {/* Mobile-only bottom nav */}
        <BottomNav />
      </div>
    </div>
  );
}
