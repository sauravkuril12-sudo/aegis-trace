import React from 'react';
import { useApp } from '../../context/AppContext';
import { Agent } from '../../types';
import { TrustBadge, AgentStatusBadge } from '../Common/StatusBadge';
import { 
  X, 
  Bot, 
  ShieldCheck, 
  ShieldX, 
  Wrench, 
  Key, 
  Activity, 
  Server, 
  Layers, 
  Clock, 
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const FleetAgentModal: React.FC = () => {
  const { 
    selectedAgentForModal, 
    setSelectedAgentForModal, 
    restoreAgent,
    applyContainmentDirectly,
    incidents,
    setActiveIncidentId,
    setCurrentView
  } = useApp();

  if (!selectedAgentForModal) return null;
  const agent = selectedAgentForModal;

  const agentIncidents = incidents.filter(i => i.primaryAgentId === agent.id);

  // Sparkline data
  const historyData = agent.trustHistory.map((score, index) => ({
    day: `Day ${index + 1}`,
    score
  }));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-sky-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {agent.codename}
              </span>
              <span className="text-xs text-slate-400 font-mono">Env: {agent.environment}</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {agent.name}
            </h2>
            <p className="text-xs text-slate-300">
              {agent.role}
            </p>
          </div>

          <button
            onClick={() => setSelectedAgentForModal(null)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Top Quick Status Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Trust Score
              </div>
              <TrustBadge score={agent.trustScore} size="lg" />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Runtime Status
              </div>
              <div className="mt-1">
                <AgentStatusBadge status={agent.status} />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                LLM Backbone
              </div>
              <div className="font-semibold text-slate-900 truncate mt-1">
                {agent.model}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Hourly Throughput
              </div>
              <div className="font-mono font-semibold text-slate-900 mt-1">
                {agent.invocationsPerHour.toLocaleString()} calls/hr
              </div>
            </div>
          </div>

          {/* 7-Day Trust Score Trend Chart */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">
                7-Day Trust Score History
              </span>
              <span className="text-slate-500 font-mono">Current: {agent.trustScore}/100</span>
            </div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke={agent.trustScore > 75 ? '#0284c7' : '#e11d48'} 
                    strokeWidth={2.5} 
                    dot={{ r: 3, fill: '#0284c7' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allowed Tools & Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                <span>Authorized Tool Whitelist ({agent.allowedTools.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agent.allowedTools.map((tool) => (
                  <span key={tool} className="font-mono text-[11px] bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-800">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase tracking-wider">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Assigned IAM & Vault Credentials ({agent.assignedCredentials.length})</span>
              </div>
              <div className="space-y-1">
                {agent.assignedCredentials.map((cred) => (
                  <div key={cred} className="font-mono text-[10px] bg-white p-1.5 rounded border border-slate-200 text-slate-700 truncate" title={cred}>
                    {cred}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Linked Incidents */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-700 uppercase tracking-wider">
              Correlated Security Incidents ({agentIncidents.length})
            </div>

            {agentIncidents.length === 0 ? (
              <div className="text-slate-400 py-3 text-center">
                No active or historical incidents recorded for this agent.
              </div>
            ) : (
              <div className="space-y-2">
                {agentIncidents.map((inc) => (
                  <div 
                    key={inc.id}
                    onClick={() => {
                      setSelectedAgentForModal(null);
                      setActiveIncidentId(inc.id);
                      setCurrentView('investigation');
                    }}
                    className="p-3 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <strong className="text-slate-900">{inc.id}</strong>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-600 font-sans font-medium">{inc.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Confidence: {inc.confidenceScore}% • Status: {inc.status}
                      </div>
                    </div>

                    <span className="text-sky-600 font-semibold text-[11px] whitespace-nowrap">
                      Open Investigation →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Owner Team: <strong className="text-slate-700">{agent.ownerTeam}</strong>
          </div>

          <div className="flex items-center gap-2">
            {agent.status === 'contained' ? (
              <button
                onClick={() => {
                  restoreAgent(agent.id);
                  setSelectedAgentForModal(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lift Quarantine & Restore Fleet Access</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (agentIncidents.length > 0) {
                    applyContainmentDirectly(agentIncidents[0].id, 'opt-quarantine');
                  }
                  setSelectedAgentForModal(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <ShieldX className="w-3.5 h-3.5" />
                <span>Emergency Contain Agent</span>
              </button>
            )}

            <button
              onClick={() => setSelectedAgentForModal(null)}
              className="px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
