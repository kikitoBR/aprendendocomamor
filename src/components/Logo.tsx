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
  // Alturas calibradas e proporcionais para máximo equilíbrio visual
  const heightClasses = {
    sm: 'h-7 sm:h-8',
    md: 'h-10 sm:h-12 lg:h-13',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-30',
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
