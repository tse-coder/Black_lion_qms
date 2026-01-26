import React, { ReactNode } from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  title?: string;
}

export function MainLayout({ children, showHeader = true, title }: MainLayoutProps) {
  React.useEffect(() => {
    if (title) {
      document.title = `${title} | Black Lion DQMS`;
    } else {
       document.title = 'Black Lion Hospital | Digital Queue Management System';
    }
  }, [title]);

  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
