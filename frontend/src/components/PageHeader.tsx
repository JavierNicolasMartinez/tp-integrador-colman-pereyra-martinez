import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode; // acciones de la página
}

// Encabezado tipo "hero": chip, título con degradado, subtítulo y acciones centradas
export function PageHeader({ eyebrow, title, subtitle, children }: PageHeaderProps) {
  return (
    <header className="page-hero">
      <span className="chip">
        <span className="chip-icon" aria-hidden="true">✦</span> {eyebrow}
      </span>
      <h1 className="hero-title">{title}</h1>
      {subtitle && <p className="hero-subtitle">{subtitle}</p>}
      {children && <div className="hero-actions">{children}</div>}
    </header>
  );
}
