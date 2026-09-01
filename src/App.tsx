/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Navigation/Header';
import { DashboardView } from './components/Dashboard/DashboardView';
import { InvestigationView } from './components/Investigation/InvestigationView';
import { ApprovalQueueView } from './components/ApprovalQueue/ApprovalQueueView';
import { PrecedentLibraryView } from './components/Precedents/PrecedentLibraryView';
import { PolicyEditorView } from './components/Policies/PolicyEditorView';
import { ToastContainer } from './components/Common/ToastContainer';

const MainLayout: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Global Header & Navigation */}
      <Header />

      {/* Main Content View Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'investigation' && <InvestigationView />}
        {currentView === 'approval_queue' && <ApprovalQueueView />}
        {currentView === 'precedents' && <PrecedentLibraryView />}
        {currentView === 'policies' && <PolicyEditorView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-slate-500 text-[11px] font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800">AEGIS TRACE</span>
          <span>•</span>
          <span>Autonomous AI Agent Mesh Security</span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold">Guardrail Engine v2.4.8 Online</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Enterprise Tenant: acme-prod-cloud</span>
          <span>•</span>
          <span>SOC2 Type II Certified</span>
        </div>
      </footer>

      {/* Global Toasts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
