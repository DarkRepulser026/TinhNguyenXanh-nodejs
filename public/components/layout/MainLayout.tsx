import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header.tsx';
import Footer from './Footer.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();

  const hideShellRoute = pathname.startsWith('/admin') || pathname.startsWith('/organizer');

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/events' ||
    pathname.startsWith('/events/') ||
    pathname === '/search' ||
    pathname === '/donate' ||
    pathname === '/payment-result' ||
    pathname === '/privacy' ||
    pathname === '/events/register' ||
    pathname === '/organizations' ||
    pathname.startsWith('/organizations/') ||
    pathname === '/about' ||
    pathname === '/contact' ||
    pathname === '/login' ||
    pathname === '/register';

  return (
    <div className="layout-root">
      {!hideShellRoute ? <Header /> : null}
      {isPublicRoute ? (
        <main className="main-content">
          <div className="container py-4">{children}</div>
        </main>
      ) : (
        <main className="main-content">{children}</main>
      )}
      {!hideShellRoute ? <Footer /> : null}
    </div>
  );
};

export default MainLayout;
