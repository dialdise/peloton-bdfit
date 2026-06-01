import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface Props {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  back?: boolean;
}

export default function Layout({ children, title, action }: Props) {
  return (
    <div className="flex flex-col min-h-dvh">
      {title && (
        <header
          className="bg-brand-dark text-white px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-40 safe-top"
        >
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
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
