import { Outlet } from 'react-router';
import { AppFrame } from './AppFrame.tsx';
import { Navbar } from './Navbar.tsx';

// Estructura común de las páginas con sesión iniciada
export function Layout() {
  return (
    <AppFrame>
      <Navbar />
      <main className="container page">
        <Outlet />
      </main>
    </AppFrame>
  );
}
