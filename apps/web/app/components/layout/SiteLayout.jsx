import { Outlet } from 'react-router';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import { AmbientBackground } from '../sections/AmbientBackground.jsx';
import { FloatingContactDock } from '../floating/FloatingContactDock.jsx';

export function SiteLayout({ alternateUrl = null }) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-transparent text-fg selection:bg-primary-subtle selection:text-primary">
      <AmbientBackground />
      <Header alternateUrl={alternateUrl} />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <FloatingContactDock />
    </div>
  );
}

export default SiteLayout;
