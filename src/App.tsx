import React, { useState } from 'react';
import {
  Menu,
  Building2,
  LogOut,
  ChevronRight,
  Shield,
  UserCheck,
} from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import TallerModule from './components/TallerModule';
import UserManagementModule from './components/UserManagementModule';
import SwaggerModule from './components/SwaggerModule';
import NotificationsModule from './components/NotificationsModule';
import MultimediaModule from './components/MultimediaModule';
import TestConsoleModule from './components/TestConsoleModule';
import SyncStatusBadge from './components/SyncStatusBadge';
import RoleSimulatorBar, { SYSTEM_ROLES } from './components/RoleSimulatorBar';
import { SidebarNavigation, MainNavId, TallerSubTabId } from './components/SidebarNavigation';
import { parseJsonResponse } from './utils/api';

export default function App() {
  const [token, setToken] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [activeNav, setActiveNav] = useState<MainNavId>('taller');
  const [activeTallerSubTab, setActiveTallerSubTab] = useState<TallerSubTabId>('apertura');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showRoleSimulator, setShowRoleSimulator] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = (data: {
    token: string;
    user: any;
    activeCompany: any;
    companies: any[];
  }) => {
    setToken(data.token);
    setUser(data.user);
    setActiveCompany(data.activeCompany);
    setCompanies(data.companies);
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setActiveCompany(null);
    setCompanies([]);
    setActiveNav('taller');
  };

  const handleSwitchCompany = async (compId: string) => {
    setLoading(true);
    try {
      // Re-autenticar o seleccionar empresa
      const resLogin = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, password: 'Password123!' }),
      });
      const dataLogin = await parseJsonResponse(resLogin, 'Error al autenticar');
      if (dataLogin.success) {
        const resSelect = await fetch('/api/v1/auth/select-company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${dataLogin.preAuthToken}`,
          },
          body: JSON.stringify({ companyId: compId }),
        });
        const dataSelect = await parseJsonResponse(resSelect, 'Error al seleccionar empresa');
        if (dataSelect.success) {
          setToken(dataSelect.token);
          setActiveCompany(dataSelect.activeCompany);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = async (userEmail: string) => {
    setLoading(true);
    try {
      const resLogin = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: 'Password123!' }),
      });
      const dataLogin = await parseJsonResponse(resLogin, 'Error al autenticar rol');
      if (dataLogin.success && dataLogin.companies?.length > 0) {
        const matchingComp = dataLogin.companies.find((c: any) => c.id === activeCompany?.id);
        const compIdToSelect = matchingComp ? matchingComp.id : dataLogin.companies[0].id;

        const resSelect = await fetch('/api/v1/auth/select-company', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${dataLogin.preAuthToken}`,
          },
          body: JSON.stringify({ companyId: compIdToSelect }),
        });
        const dataSelect = await parseJsonResponse(resSelect, 'Error al seleccionar empresa para rol');
        if (dataSelect.success) {
          setToken(dataSelect.token);
          setUser(dataLogin.user);
          setActiveCompany(dataSelect.activeCompany);
          setCompanies(dataLogin.companies);
        }
      }
    } catch (err) {
      console.error('Error al cambiar de rol de prueba:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (nav: MainNavId, subTab?: TallerSubTabId) => {
    setActiveNav(nav);
    if (subTab) {
      setActiveTallerSubTab(subTab);
    }
  };

  // Helper de títulos y breadcrumbs
  const getNavTitle = () => {
    switch (activeNav) {
      case 'taller':
        const subTabNames: Record<TallerSubTabId, string> = {
          apertura: 'Apertura & Unidad',
          areas: 'Áreas & Diagnóstico',
          repuestos: 'Repuestos Profit',
          externos: 'Servicios Externos',
          aprob: 'Aprobación de Gastos',
          almacen: 'Despacho de Almacén',
          cierre: 'Cierre & Liquidación',
          auditoria: 'Auditoría & Trazabilidad',
        };
        return {
          section: 'Operaciones de Taller',
          detail: subTabNames[activeTallerSubTab] || 'Taller San Luis',
        };
      case 'usuarios':
        return { section: 'Gobernanza', detail: 'Gestión Usuarios & RBAC' };
      case 'swagger':
        return { section: 'APIs & Integración', detail: 'Swagger API Explorer' };
      case 'notificaciones':
        return { section: 'Comunicaciones', detail: 'Bandeja & Push' };
      case 'multimedia':
        return { section: 'Documentación', detail: 'Archivos Multimedia' };
      case 'pruebas':
        return { section: 'Diagnóstico & QA', detail: 'Consola de Pruebas Unitarias' };
      default:
        return { section: 'Grupo San Luis', detail: 'Plataforma Corporativa' };
    }
  };

  // Si no hay sesión activa, mostrar la pantalla de Login
  if (!token || !user || !activeCompany) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const breadcrumb = getNavTitle();
  const currentRoleDef = SYSTEM_ROLES.find(
    (r) => r.role === (user?.role || 'OPERADOR')
  ) || SYSTEM_ROLES[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--paper)] text-[var(--ink)] font-['Rubik']">
      {/* 1. Barra Lateral Moderna (Sidebar) */}
      <SidebarNavigation
        activeNav={activeNav}
        activeTallerSubTab={activeTallerSubTab}
        onNavigate={handleNavigate}
        user={user}
        companies={companies}
        activeCompany={activeCompany}
        onSwitchCompany={handleSwitchCompany}
        onLogout={handleLogout}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 2. Área de Trabajo Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--paper)]">
        {/* Top Header Corporativo */}
        <header className="h-16 bg-white border-b border-[var(--line)] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-xs z-20">
          {/* Lado Izquierdo: Botón Hamburguesa Móvil y Breadcrumbs */}
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[var(--navy)] hover:bg-slate-100 transition-colors focus:outline-none"
              title="Abrir menú de navegación"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 text-xs text-[var(--slate)] truncate font-medium">
              <span className="hidden sm:inline text-slate-500 font-semibold">{breadcrumb.section}</span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-400 shrink-0" />
              <h1 className="text-sm font-bold text-[var(--navy)] tracking-tight truncate m-0 p-0">
                {breadcrumb.detail}
              </h1>
            </div>
          </div>

          {/* Lado Derecho: Sync Status, Switcher de Rol, Tenant y Perfil */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Indicador de Sincronización MSSQL Profit */}
            <SyncStatusBadge token={token} />

            {/* Botón Acceso Rápido al Simulador de Roles */}
            <button
              onClick={() => setShowRoleSimulator(!showRoleSimulator)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                showRoleSimulator
                  ? 'bg-[var(--navy)] text-white border-[var(--navy)] shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
              title="Simular roles para validar reglas de negocio y permisos"
            >
              <currentRoleDef.icon className="w-3.5 h-3.5" style={{ color: showRoleSimulator ? '#95C800' : currentRoleDef.color }} />
              <span className="hidden md:inline font-mono">{user?.role || 'ROL'}</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                {showRoleSimulator ? '▲' : '▼'}
              </span>
            </button>

            {/* Selector de Empresa Compacto en Header */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 transition-colors px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--navy)]">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={activeCompany?.id}
                onChange={(e) => handleSwitchCompany(e.target.value)}
                className="bg-transparent text-xs font-bold text-[var(--navy)] border-0 p-0 focus:outline-none cursor-pointer max-w-[140px] truncate"
                title="Cambiar empresa activa"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Logout Compacto */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors shrink-0"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Simulador Desplegable de Roles para Pruebas */}
        {showRoleSimulator && (
          <div className="border-b border-amber-200 bg-amber-50/50 shadow-inner shrink-0">
            <RoleSimulatorBar
              currentUser={user}
              activeCompany={activeCompany}
              onSwitchRole={handleSwitchRole}
              loading={loading}
              onClose={() => setShowRoleSimulator(false)}
            />
          </div>
        )}

        {/* 3. Lienzo de Contenido Scrollable */}
        <main className="flex-1 overflow-y-auto min-h-0 custom-scrollbar flex flex-col">
          <div className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-6">
            {activeNav === 'taller' && (
              <TallerModule
                token={token}
                activeCompany={activeCompany}
                currentUser={user}
                subTab={activeTallerSubTab}
                onSubTabChange={setActiveTallerSubTab}
              />
            )}
            {activeNav === 'usuarios' && <UserManagementModule token={token} currentUser={user} />}
            {activeNav === 'swagger' && <SwaggerModule />}
            {activeNav === 'notificaciones' && <NotificationsModule />}
            {activeNav === 'multimedia' && <MultimediaModule />}
            {activeNav === 'pruebas' && <TestConsoleModule />}
          </div>

          {/* Footer Corporativo Elegante */}
          <footer className="mt-auto bg-white border-t border-[var(--line)] text-[var(--slate)] text-xs py-3 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
              <span className="text-[11px] sm:text-xs">
                © 2026 Grupo San Luis — Sistema de Gestión Taller & Flota (Profit Plus MSSQL / SQLite)
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] text-slate-400">
                Tenant: <b>{activeCompany?.code || 'N/A'}</b> • RIF: {activeCompany?.taxId || 'N/A'} • OpenAPI 3.0.3
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
