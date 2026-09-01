import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Activity, 
  GitPullRequest, 
  BookOpen, 
  Sliders, 
  Search, 
  Bell, 
  Play, 
  Check, 
  AlertCircle, 
  Zap,
  Server
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    agents, 
    incidents, 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications,
    runInvestigation,
    isInvestigating
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingApprovalsCount = incidents.filter(i => i.status === 'pending_approval').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const containedAgentsCount = agents.filter(a => a.status === 'contained').length;

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Fleet Dashboard',
      icon: <Activity className="w-4 h-4" />
    },
    {
      id: 'investigation',
      label: 'Incident Investigation',
      icon: <Zap className="w-4 h-4" />,
      badge: isInvestigating ? 1 : undefined,
      badgeColor: 'bg-sky-500 text-white animate-pulse'
    },
    {
      id: 'approval_queue',
      label: 'Approval Queue',
      icon: <GitPullRequest className="w-4 h-4" />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500 text-white font-bold'
    },
    {
      id: 'precedents',
      label: 'Precedent Library',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'policies',
      label: 'Policy Editor',
      icon: <Sliders className="w-4 h-4" />
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Telemetry Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-6 py-1.5 flex items-center justify-between font-mono border-b border-slate-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-medium">AUTONOMOUS RUNTIME: GUARDRAIL v2.4</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>CLUSTER: <strong className="text-slate-200">us-east-agent-mesh</strong></span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-slate-400">
            <span>MONITORED FLEET: <strong className="text-emerald-400">{agents.length} Agents</strong></span>
            <span>•</span>
            <span>AUTO-CONTAINED: <strong className="text-amber-300">{containedAgentsCount} Isolated</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">Decision Confidence Threshold: <strong className="text-white">≥ 90.0%</strong></span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">Sync: <span className="text-emerald-400 font-semibold">18ms</span></span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-sky-400 shadow-sm ring-1 ring-slate-800">
            <ShieldCheck className="w-5 h-5 text-sky-400 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">AEGIS TRACE</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none">Autonomous Agent Incident & Containment</p>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200/80">
          {navItems.map((tab) => {
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setCurrentView(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className={isActive ? 'text-sky-600' : 'text-slate-400'}>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${tab.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative hidden md:block w-48 lg:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search agents, policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Run Investigation CTA */}
          <button
            id="btn-quick-run-investigation"
            onClick={() => {
              setCurrentView('investigation');
              if (!isInvestigating) {
                runInvestigation();
              }
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
          >
            <Play className={`w-3.5 h-3.5 text-sky-400 ${isInvestigating ? 'animate-spin' : 'fill-sky-400'}`} />
            <span>{isInvestigating ? 'Analyzing Pipeline...' : 'Run Investigation'}</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              id="btn-notifications-toggle"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notifications Flyout */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-84 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Audit Stream Notifications ({unreadNotificationsCount})
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-slate-500 hover:text-slate-900"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No active audit notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.incidentId) {
                            setCurrentView('investigation');
                          }
                          setShowNotifications(false);
                        }}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                          !n.read ? 'bg-sky-50/40 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            {n.type === 'auto_contained' && <Zap className="w-3 h-3 text-emerald-600" />}
                            {n.type === 'approval_needed' && <AlertCircle className="w-3 h-3 text-amber-600" />}
                            {n.type === 'precedent_match' && <BookOpen className="w-3 h-3 text-sky-600" />}
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / Responsive Sub-Nav for screens under xl */}
      <div className="xl:hidden px-6 py-2 bg-slate-50 border-t border-slate-200 overflow-x-auto flex items-center gap-2">
        {navItems.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1 rounded-full ${tab.badgeColor || 'bg-slate-300 text-slate-800'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
