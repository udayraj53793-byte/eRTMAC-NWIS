import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, MapPin, Target, AlertTriangle, Activity,
  Cpu, BookOpen, FileText, User, LogOut, ChevronRight,
  Layers, GitBranch, Settings, Users, Database, Shield,
  BarChart2, Radio, Menu, X, Zap, Eye, MessageCircle, FlaskConical,
} from 'lucide-react';

const engineerNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/engineer/dashboard' },
  { label: 'Active Wells', icon: Radio, path: '/engineer/wells' },
  { label: 'Well Map', icon: MapPin, path: '/engineer/map' },
  { label: 'Offset Intelligence', icon: Target, path: '/engineer/offset-intelligence' },
  { label: 'Risk Radar', icon: AlertTriangle, path: '/engineer/risk-alerts' },
  { label: 'Digital Well Twin', icon: Cpu, path: '/engineer/digital-twin' },
  { label: 'Incidents', icon: Zap, path: '/engineer/incidents' },
  { label: 'Analytics', icon: BarChart2, path: '/engineer/analytics' },
  { label: 'AI Copilot', icon: MessageCircle, path: '/engineer/ai-assistant' },
  { label: 'Knowledge', icon: BookOpen, path: '/engineer/knowledge' },
  { label: 'Simulator', icon: FlaskConical, path: '/engineer/simulator' },
  { label: 'Reports', icon: FileText, path: '/engineer/reports' },
  { label: 'Profile', icon: User, path: '/engineer/profile' },
];

const managerNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/manager/dashboard' },
  { label: 'Operations', icon: Activity, path: '/manager/operations' },
  { label: 'All Wells', icon: Layers, path: '/manager/wells' },
  { label: 'Risk Overview', icon: AlertTriangle, path: '/manager/risk' },
  { label: 'Analytics', icon: BarChart2, path: '/manager/analytics' },
  { label: 'Incidents', icon: Zap, path: '/manager/incidents' },
  { label: 'AI Briefing', icon: MessageCircle, path: '/manager/ai-briefing' },
  { label: 'Reports', icon: FileText, path: '/manager/reports' },
  { label: 'Team Activity', icon: Users, path: '/manager/team' },
  { label: 'Profile', icon: User, path: '/manager/profile' },
];

const adminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Wells', icon: Layers, path: '/admin/wells' },
  { label: 'Documents', icon: FileText, path: '/admin/reports' },
  { label: 'AI Extraction', icon: Cpu, path: '/admin/extraction-review' },
  { label: 'Verification', icon: Shield, path: '/admin/data-verification' },
  { label: 'Knowledge Base', icon: Database, path: '/admin/knowledge-base' },
  { label: 'Knowledge Graph', icon: GitBranch, path: '/admin/knowledge-graph' },
  { label: 'Data Quality', icon: Eye, path: '/admin/data-quality' },
  { label: 'Audit Logs', icon: Activity, path: '/admin/audit-logs' },
  { label: 'System Health', icon: Settings, path: '/admin/system-health' },
  { label: 'Profile', icon: User, path: '/admin/profile' },
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  const navItems = user?.role === 'ADMIN' ? adminNav : user?.role === 'MANAGER' ? managerNav : engineerNav;
  const roleColors = {
    ENGINEER: { badge: 'bg-blue-50 text-blue-800 border-blue-200', accent: '#234c70' },
    MANAGER: { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', accent: '#28743b' },
    ADMIN: { badge: 'bg-amber-50 text-amber-800 border-amber-200', accent: '#bc870b' },
  };
  const rc = roleColors[user?.role] || roleColors.ENGINEER;
  const currentPage = navItems.find(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
        />
      )}

      <aside className={`workspace-sidebar fixed inset-y-0 left-0 z-40 flex w-72 flex-shrink-0 flex-col shadow-xl transition-all duration-200 ease-in-out md:relative md:z-auto md:shadow-none ${sidebarOpen ? 'translate-x-0 md:w-64' : '-translate-x-full md:w-[4.5rem] md:translate-x-0'}`}>
        <div className="workspace-brand flex items-center justify-between px-4 py-4">
          {sidebarOpen && (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="workspace-logo flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
                <Radio className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold leading-tight tracking-tight text-slate-900">eRTMAC-NWIS</div>
                <div className="mt-0.5 truncate text-[11px] text-slate-500">Nearby Wells Intelligence</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(p => !p)}
            aria-label={sidebarOpen ? 'Collapse navigation' : 'Expand navigation'}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <span className="hidden md:block">{sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</span>
            <span className="md:hidden"><X className="h-4 w-4" /></span>
          </button>
        </div>

        {sidebarOpen && (
          <div className="border-b border-slate-100 px-4 py-3">
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${rc.badge}`}>{user?.role}</span>
          </div>
        )}

        <nav aria-label="Main navigation" className="workspace-nav flex-1 overflow-y-auto py-4">
          {navItems.map(item => {
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                aria-current={active ? 'page' : undefined}
                className={`mx-2 mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${active
                  ? 'bg-primary-50 font-semibold text-primary-800 shadow-sm shadow-primary-100/70'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${active ? 'text-primary-700' : ''}`} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {sidebarOpen && active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary-600" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3">
            <div className="workspace-avatar flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl">
              <span className="text-xs font-bold">{user?.name?.[0] || 'U'}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="truncate text-xs font-semibold text-slate-800">{user?.name}</div>
                <div className="truncate text-[11px] text-slate-500">{user?.email}</div>
              </div>
            )}
            <button onClick={handleLogout} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600" title="Logout" aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="workspace-header sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
              className="workspace-mobile-menu flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-800">{currentPage?.label || 'Operations'}</div>
              <div className="hidden text-[11px] text-slate-400 sm:block">eRTMAC-NWIS <span className="mx-1.5">/</span> {user?.role?.toLowerCase()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-semibold text-slate-700">{user?.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">{user?.role?.toLowerCase()}</div>
            </div>
            <div className="workspace-header-avatar flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold">
              {user?.name?.[0] || 'U'}
            </div>
          </div>
        </header>
        <div className="app-main mx-auto max-w-screen-2xl p-4 sm:p-7">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
