import { Outlet } from 'react-router';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import { StarsBackground } from '../sections/StarsBackground.jsx';

export function SiteLayout({ alternateUrl = null }) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-fg selection:bg-primary-subtle selection:text-primary">
      <StarsBackground />
      <Header alternateUrl={alternateUrl} />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default SiteLayout;
