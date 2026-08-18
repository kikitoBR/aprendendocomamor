'use client';

import React from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Logo } from '@/components/Logo';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  CheckCircle2,
  GraduationCap,
  Settings,
  Plus,
  Shield,
  UserCheck,
  BookOpen,
  Receipt,
  Heart,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNovoAluno: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNovoAluno,
}) => {
  const { currentRole, setCurrentRole, dbConnected } = useSchool();

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard, roles: ['diretoria', 'secretaria', 'professor'] },
    { id: 'portal-pais', label: 'Portal da Família', icon: Heart, roles: ['responsavel'] },
    { id: 'alunos', label: 'Alunos', icon: Users, roles: ['diretoria', 'secretaria'] },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, roles: ['diretoria', 'secretaria'] },
    { id: 'despesas', label: 'Despesas', icon: Receipt, roles: ['diretoria'] },
    { id: 'frequencia', label: 'Frequência', icon: CheckCircle2, roles: ['diretoria', 'secretaria', 'professor'] },
    { id: 'turmas', label: 'Turmas', icon: GraduationCap, roles: ['diretoria', 'secretaria'] },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, roles: ['diretoria'] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-18 sm:h-22 gap-2 sm:gap-3">
          {/* Logo & Marca da Escola */}
          <div
            onClick={() => onSelectTab(currentRole === 'responsavel' ? 'portal-pais' : 'dashboard')}
            className="cursor-pointer hover:opacity-95 transition shrink-0 py-1"
          >
            <Logo size="md" />
          </div>

          {/* Navegação Desktop (Linear / Apple Style) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl font-bold text-xs transition whitespace-nowrap ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${item.id === 'portal-pais' ? 'fill-current' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Seletor de Perfil & Ação Rápida */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Seletor de Perfil do Usuário */}
            <div className="flex items-center bg-slate-100/90 p-0.5 sm:p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setCurrentRole('diretoria')}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-bold transition text-[11px] sm:text-xs ${
                  currentRole === 'diretoria'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Perfil Diretoria (Acesso Total)"
              >
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline">Diretoria</span>
              </button>

              <button
                onClick={() => {
                  setCurrentRole('secretaria');
                  if (activeTab === 'despesas' || activeTab === 'configuracoes' || activeTab === 'portal-pais') {
                    onSelectTab('dashboard');
                  }
                }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-bold transition text-[11px] sm:text-xs ${
                  currentRole === 'secretaria'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Perfil Secretaria"
              >
                <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline">Secretaria</span>
              </button>

              <button
                onClick={() => {
                  setCurrentRole('professor');
                  if (['financeiro', 'despesas', 'alunos', 'turmas', 'configuracoes', 'portal-pais'].includes(activeTab)) {
                    onSelectTab('dashboard');
                  }
                }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-bold transition text-[11px] sm:text-xs ${
                  currentRole === 'professor'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Perfil Professor (100% Pedagógico)"
              >
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline">Professor</span>
              </button>

              <button
                onClick={() => {
                  setCurrentRole('responsavel');
                  onSelectTab('portal-pais');
                }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg font-bold transition text-[11px] sm:text-xs ${
                  currentRole === 'responsavel'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Portal dos Pais & Responsáveis"
              >
                <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 fill-current" />
                <span className="hidden sm:inline">Pais</span>
              </button>
            </div>

            {/* Status do Banco MySQL phpMyAdmin */}
            {dbConnected ? (
              <span
                className="hidden xl:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-2xs"
                title="Banco de Dados MySQL Conectado (phpMyAdmin Hostinger)"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>MySQL Remoto</span>
              </span>
            ) : (
              <span
                className="hidden xl:inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded-xl text-[11px] font-bold"
                title="Armazenamento Local Ativo"
              >
                <span>Cache Local</span>
              </span>
            )}

            {/* Botão Nova Matrícula */}
            {['diretoria', 'secretaria'].includes(currentRole) && (
              <button
                onClick={onOpenNovoAluno}
                className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition transform active:scale-95 shrink-0"
                title="Cadastrar Nova Matrícula"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden md:inline">Matrícula</span>
              </button>
            )}
          </div>
        </div>

        {/* Navegação Mobile / Tablet (quando tela for menor que lg) */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition shrink-0 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
