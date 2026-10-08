import type { ReactNode } from 'react';

// Marco redondeado sobre el fondo degradado, con los arcos de luz decorativos
export function AppFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`app-frame ${className}`.trim()}>
      <div className="frame-arcs" aria-hidden="true">
        <span className="arc arc-left" />
        <span className="arc arc-right" />
      </div>
      {children}
    </div>
  );
}
