import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import TopNav from './TopNav';

interface Props {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}

export default function Layout({ children, title, action }: Props) {
  return (
    <div className="flex flex-col min-h-dvh bg-[#F4F3EE]">
      {/* Desktop top nav */}
      <div className="hidden lg:block">
        <TopNav />
      </div>

      {/* Mobile page header */}
      {title && (
        <header className="lg:hidden bg-[#1C1C1E] text-white px-5 pt-4 pb-3 flex items-center justify-between sticky top-0 z-40 safe-top">
          <h1 className="text-[17px] font-bold tracking-tight">{title}</h1>
          {action && <div>{action}</div>}
        </header>
      )}

      <main className="flex-1 pb-safe overflow-y-auto scrollable">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
