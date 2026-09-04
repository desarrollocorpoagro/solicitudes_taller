import React, { useState } from 'react';
import {
  Wrench,
  Users,
  BookOpen,
  Bell,
  Image as ImageIcon,
  Terminal,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Sliders,
  Package,
  ExternalLink,
  ShieldCheck,
  Archive,
  CheckCircle2,
  History,
  X,
  Layers,
  ChevronDown,
} from 'lucide-react';
import SanLuisLogo from './SanLuisLogo';

export type MainNavId =
  | 'taller'
  | 'usuarios'
  | 'swagger'
  | 'notificaciones'
  | 'multimedia'
  | 'pruebas';

export type TallerSubTabId =
  | 'apertura'
  | 'areas'
  | 'repuestos'
  | 'externos'
  | 'aprob'
  | 'almacen'
  | 'cierre'
  | 'auditoria';

interface SidebarNavigationProps {
  activeNav: MainNavId;
  activeTallerSubTab: TallerSubTabId;
  onNavigate: (nav: MainNavId, subTab?: TallerSubTabId) => void;
  user: any;
  companies: any[];
  activeCompany: any;
  onSwitchCompany: (companyId: string) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeNav,
  activeTallerSubTab,
  onNavigate,
  user,
  companies,
  activeCompany,
  onSwitchCompany,
  onLogout,
  isMobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
}) => {
  const [tallerSubMenuOpen, setTallerSubMenuOpen] = useState(true);

  // Items de Operaciones de Taller
  const tallerItems = [
    { id: 'apertura', label: 'Apertura & Unidad', icon: ClipboardList },
    { id: 'areas', label: 'Áreas & Diagnóstico', icon: Sliders },
    { id: 'repuestos', label: 'Repuestos (Profit)', icon: Package },
    { id: 'externos', label: 'Servicios Externos', icon: ExternalLink },
    { id: 'aprob', label: 'Aprobación de Gastos', icon: ShieldCheck },
    { id: 'almacen', label: 'Despacho de Almacén', icon: Archive },
    { id: 'cierre', label: 'Cierre & Liquidación', icon: CheckCircle2 },
    { id: 'auditoria', label: 'Auditoría & Trazabilidad', icon: History },
  ];

  // Herramientas & Módulos Globales
  const toolItems: { id: MainNavId; label: string; icon: any }[] = [
    { id: 'usuarios', label: 'Gestión Usuarios (RBAC)', icon: Users },
    { id: 'swagger', label: 'Swagger API Docs', icon: BookOpen },
    { id: 'notificaciones', label: 'Notificaciones & Push', icon: Bell },
    { id: 'multimedia', label: 'Archivos Multimedia', icon: ImageIcon },
    { id: 'pruebas', label: 'Consola de Pruebas', icon: Terminal },
  ];

  const handleTallerItemClick = (subTab: TallerSubTabId) => {
    onNavigate('taller', subTab);
    if (window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  const handleToolItemClick = (navId: MainNavId) => {
    onNavigate(navId);
    if (window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* 1. Header de Marca San Luis */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-[var(--navy-d)] min-h-[64px]">
        {collapsed ? (
          <div className="mx-auto cursor-pointer" onClick={onToggleCollapse} title="Expandir barra lateral">
            <SanLuisLogo variant="isotype" height={32} />
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-hidden">
            <SanLuisLogo variant="inverse" height={28} subtext="Taller & Flota" />
          </div>
        )}

        {/* Botón de Colapso en Desktop */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          title={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          aria-label={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Botón de Cierre en Mobile */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md bg-white/10 text-white hover:bg-white/20"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Selector de Empresa / Tenant */}
      <div className="px-3 py-3 border-b border-white/10 bg-black/20">
        {collapsed ? (
          <div
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/10 text-center cursor-pointer hover:bg-white/15"
            title={`Empresa activa: ${activeCompany?.name || 'San Luis'}`}
          >
            <Building2 className="w-5 h-5 text-[var(--lime)] mb-1" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
              {activeCompany?.code || 'EMP'}
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--lime)]" />
                Empresa Activa
              </span>
              <span className="text-[10px] font-mono text-[var(--lime)] bg-[var(--lime)]/10 px-1.5 py-0.5 rounded">
                {activeCompany?.code || 'CORP'}
              </span>
            </div>
            <div className="relative">
              <select
                value={activeCompany?.id}
                onChange={(e) => onSwitchCompany(e.target.value)}
                className="w-full bg-white/10 text-white text-xs font-medium rounded-md px-2.5 py-2 pr-8 border border-white/15 focus:outline-none focus:border-[var(--lime)] cursor-pointer truncate"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id} className="text-[#12232E] bg-white">
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* 3. Menú de Navegación con Scroll */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
        {/* GRUPO: OPERACIONES DE TALLER */}
        <div>
          {!collapsed ? (
            <button
              onClick={() => setTallerSubMenuOpen(!tallerSubMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-400 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[var(--lime)]" />
                Taller & Flota
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  tallerSubMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          ) : (
            <div className="text-center py-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                TALLER
              </span>
            </div>
          )}

          {/* Sub-items de Taller */}
          {(tallerSubMenuOpen || collapsed) && (
            <div className="mt-1 space-y-0.5">
              {tallerItems.map((item) => {
                const Icon = item.icon;
                const isItemActive = activeNav === 'taller' && activeTallerSubTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTallerItemClick(item.id as TallerSubTabId)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isItemActive
                        ? 'bg-[var(--lime)] text-[var(--navy-d)] font-bold shadow-md shadow-black/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isItemActive ? 'text-[var(--navy-d)]' : 'text-slate-300 group-hover:text-white'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/10 my-2" />

        {/* GRUPO: ADMINISTRACIÓN Y HERRAMIENTAS */}
        <div>
          {!collapsed && (
            <div className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Administración & APIs
            </div>
          )}
          {collapsed && (
            <div className="text-center py-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                HERRAM.
              </span>
            </div>
          )}

          <div className="mt-1 space-y-0.5">
            {toolItems.map((item) => {
              const Icon = item.icon;
              const isItemActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleToolItemClick(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isItemActive
                      ? 'bg-[var(--lime)] text-[var(--navy-d)] font-bold shadow-md shadow-black/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isItemActive ? 'text-[var(--navy-d)]' : 'text-slate-300 group-hover:text-white'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Footer de Usuario y Logout */}
      <div className="p-3 border-t border-white/10 bg-[var(--navy-d)]">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-9 h-9 rounded-full bg-[var(--lime)] text-[var(--navy-d)] font-black flex items-center justify-center text-sm shadow-sm cursor-pointer"
              title={`${user?.fullName || 'Usuario'} (${user?.role || 'OPERADOR'})`}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <button
              onClick={onLogout}
              className="w-8 h-8 rounded-md flex items-center justify-center text-rose-300 hover:text-white hover:bg-rose-500/30 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[var(--lime)] text-[var(--navy-d)] font-black flex items-center justify-center text-sm shrink-0 shadow-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <span className="block font-semibold text-white text-xs leading-snug truncate">
                  {user?.fullName || 'Usuario'}
                </span>
                <span className="inline-block text-[10px] text-[var(--lime)] font-mono uppercase bg-white/10 px-1.5 py-0.2 rounded leading-tight">
                  {user?.role || 'OPERADOR'}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-md text-rose-300 hover:text-white hover:bg-rose-600/30 transition-colors shrink-0"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Backdrop Móvil */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* 2. Drawer Móvil (animado de izquierda a derecha) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--navy)] text-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 3. Sidebar Fijo de Escritorio */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-[var(--navy)] text-white border-r border-black/20 shadow-lg transition-all duration-300 ease-in-out z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
