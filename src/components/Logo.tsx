'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  // Alturas aumentadas para máximo destaque visual da marca
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-13 sm:h-15 lg:h-17',
    lg: 'h-20 sm:h-24',
    xl: 'h-32 sm:h-40',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Imagem Oficial Vetorial em Alta Resolução */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="Escola Aprendendo com Amor"
          className={`${heightClasses[size]} w-auto object-contain transition-transform duration-300 hover:scale-[1.03] drop-shadow-xs`}
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>

      {/* Subtítulo ou Badge Institucional Opcional */}
      {showSubtitle && (
        <div className="hidden sm:flex flex-col border-l-2 border-orange-200/80 pl-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 leading-tight">
            Educação Infantil
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 leading-tight">
            & Ensino Fundamental
          </span>
        </div>
      )}
    </div>
  );
};
