import { Outlet } from 'react-router';
import { Navbar } from './Navbar.tsx';

// Estructura común de las páginas con sesión iniciada
export function Layout() {
  return (
    <>
      <Navbar />
      <main className="container page">
        <Outlet />
      </main>
    </>
  );
}
