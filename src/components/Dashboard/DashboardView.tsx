import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrustBadge, 
  AgentStatusBadge, 
  SeverityBadge, 
  IncidentStatusBadge 
} from '../Common/StatusBadge';
import { FleetAgentModal } from './FleetAgentModal';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Bot, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ChevronRight, 
  SlidersHorizontal,
  Lock,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { 
    agents, 
    incidents, 
    setActiveIncidentId, 
    setCurrentView, 
    setSelectedAgentForModal,
    runInvestigation
  } = useApp();

  const [agentFilterStatus, setAgentFilterStatus] = useState<string>('all');
  const [incidentSearchQuery, setIncidentSearchQuery] = useState<string>('');
  const [incidentSortField, setIncidentSortField] = useState<'detectedAt' | 'confidenceScore' | 'severity'>('detectedAt');

  // Metrics calculations
  const activeIncidents = incidents.filter(i => i.status === 'open' || i.status === 'pending_approval' || i.status === 'investigating');
  const autoContainedCount = incidents.filter(i => i.status === 'contained').length;
  const criticalCount = incidents.filter(i => i.severity === 'critical').length;
  const avgTrustScore = Math.round(agents.reduce((acc, a) => acc + a.trustScore, 0) / (agents.length || 1));

  // Chart data: 7-Day Activity & Containments
  const activityTrendData = [
    { day: 'Mon', invocations: 18200, anomalies: 4, autoContained: 1 },
    { day: 'Tue', invocations: 22400, anomalies: 7, autoContained: 2 },
    { day: 'Wed', invocations: 25100, anomalies: 3, autoContained: 0 },
    { day: 'Thu', invocations: 28900, anomalies: 9, autoContained: 3 },
    { day: 'Fri', invocations: 31200, anomalies: 5, autoContained: 1 },
    { day: 'Sat', invocations: 19800, anomalies: 2, autoContained: 0 },
    { day: 'Sun (Today)', invocations: 24500, anomalies: 6, autoContained: 2 }
  ];

  // Chart data: Trust Distribution
  const trustDistributionData = [
    { range: '90-100 (Optimal)', count: agents.filter(a => a.trustScore >= 90).length, fill: '#059669' },
    { range: '75-89 (Healthy)', count: agents.filter(a => a.trustScore >= 75 && a.trustScore < 90).length, fill: '#0284c7' },
    { range: '50-74 (Degraded)', count: agents.filter(a => a.trustScore >= 50 && a.trustScore < 75).length, fill: '#d97706' },
    { range: '< 50 (Critical)', count: agents.filter(a => a.trustScore < 50).length, fill: '#e11d48' }
  ];

  // Filtered Agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      if (agentFilterStatus === 'all') return true;
      return agent.status === agentFilterStatus;
    });
  }, [agents, agentFilterStatus]);

  // Filtered & Sorted Incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter(inc => {
        const matchesSearch = inc.title.toLowerCase().includes(incidentSearchQuery.toLowerCase()) ||
          inc.id.toLowerCase().includes(incidentSearchQuery.toLowerCase()) ||
          inc.primaryAgentName.toLowerCase().includes(incidentSearchQuery.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        if (incidentSortField === 'confidenceScore') {
          return b.confidenceScore - a.confidenceScore;
        }
        if (incidentSortField === 'severity') {
          const weights: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
          return (weights[b.severity] || 0) - (weights[a.severity] || 0);
        }
        return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      });
  }, [incidents, incidentSearchQuery, incidentSortField]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Incidents */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Incidents
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {activeIncidents.length}
              </span>
              <span className="text-xs font-semibold text-rose-600 font-mono">
                {criticalCount} Critical
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Autonomous containment running on mesh
            </p>
          </div>
        </div>

        {/* Card 2: Agents Auto-Contained */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Auto-Contained This Week
            </span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {autoContainedCount}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                0% SLA Impact
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Minimum credential pruning applied
            </p>
          </div>
        </div>

        {/* Card 3: Avg Investigation Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Investigation Time
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                1.84s
              </span>
              <span className="text-xs font-semibold text-emerald-600 font-mono">
                -99.9% vs manual
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Down from 4.2h SecOps human triage
            </p>
          </div>
        </div>

        {/* Card 4: False Positive Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              False-Positive Rate
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                0.4%
              </span>
              <span className="text-xs font-semibold text-sky-600">
                Post Red-Team
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Adversarially challenged & verified
            </p>
          </div>
        </div>
      </div>

      {/* Pre-emptive Early Warning Flags Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500 text-white shadow-2xs shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  Pre-Emptive Early Warning System
                </span>
                <span className="text-xs text-amber-900 font-medium">
                  2 Active Agents Match Historical Incident Signatures
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Aegis Trace compares live tool invocation trajectories against known precedent breach patterns before violation boundaries are breached.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('precedents')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <span>Inspect Pattern Library</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Warning cards row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-amber-200/60">
          <div className="bg-white/90 p-3.5 rounded-lg border border-amber-200 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-slate-700" />
                <strong className="text-xs text-slate-900 font-mono">CodeReview-Copilot-Worker</strong>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-mono">
                  82% Match
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                Pattern: <strong className="text-slate-800">PAT-2026-041 (Recursive Sub-Agent Loop)</strong>
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Flag: 4 child agents spawned in &lt;10s without task completion
              </div>
            </div>
            <button
              onClick={() => setCurrentView('precedents')}
              className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 hover:underline shrink-0"
            >
              Analyze →
            </button>
          </div>

          <div className="bg-white/90 p-3.5 rounded-lg border border-amber-200 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-slate-700" />
                <strong className="text-xs text-slate-900 font-mono">Financial-Reconciliation-Agent</strong>
                <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded font-mono">
                  91% Match
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                Pattern: <strong className="text-slate-800">PAT-2026-089 (Chained Unapproved Write)</strong>
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Flag: Tool chaining sequence matches SAP batch write bypass
              </div>
            </div>
            <button
              onClick={() => setCurrentView('precedents')}
              className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 hover:underline shrink-0"
            >
              Analyze →
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Overview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Monitored Autonomous AI Agent Fleet ({agents.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live trust scoring, tool privilege boundaries, and runtime quarantine controls.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {['all', 'healthy', 'warning', 'contained'].map((status) => (
              <button
                key={status}
                onClick={() => setAgentFilterStatus(status)}
                className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-all ${
                  agentFilterStatus === status
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5">Agent Identity</th>
                <th className="py-3 px-4">Live Trust Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Model Backbone</th>
                <th className="py-3 px-4">Tools & Creds</th>
                <th className="py-3 px-4 font-mono">Invocations/Hr</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAgents.map((agent) => (
                <tr
                  key={agent.id}
                  onClick={() => setSelectedAgentForModal(agent)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{agent.name}</span>
                      <span className="text-[10px] font-mono font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {agent.environment}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                      {agent.role}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <TrustBadge score={agent.trustScore} />
                  </td>

                  <td className="py-3.5 px-4">
                    <AgentStatusBadge status={agent.status} />
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {agent.model}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    <div>{agent.allowedTools.length} tools whitelisted</div>
                    <div className="text-slate-400 text-[10px]">{agent.assignedCredentials.length} vault secrets</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    {agent.invocationsPerHour.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgentForModal(agent);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-200 shadow-2xs"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: 7-Day Invocations & Anomaly Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Fleet Activity vs. Autonomous Containments (7 Days)
              </h3>
              <p className="text-xs text-slate-500">
                Correlated invocations and real-time containment triggers.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-slate-600">Invocations</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-600">Auto-Contained</span>
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrendData}>
                <defs>
                  <linearGradient id="colorInvocations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="invocations" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorInvocations)" />
                <Area type="monotone" dataKey="autoContained" stroke="#e11d48" strokeWidth={2} fillOpacity={0.8} fill="#e11d48" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fleet Trust Distribution (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Fleet Trust Score Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Live safety distribution across active agent population.
            </p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trustDistributionData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="range" type="category" width={110} tick={{ fontSize: 10 }} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {trustDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-600 font-medium">Fleet Trust Average:</span>
            <strong className="font-mono text-emerald-700 text-sm">{avgTrustScore}/100</strong>
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Recent Autonomous Incident Investigations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any incident row to jump into the 6-stage investigation evidence graph.
            </p>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter incidents..."
                value={incidentSearchQuery}
                onChange={(e) => setIncidentSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <select
              value={incidentSortField}
              onChange={(e) => setIncidentSortField(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none font-medium"
            >
              <option value="detectedAt">Sort by Date</option>
              <option value="confidenceScore">Sort by Confidence</option>
              <option value="severity">Sort by Severity</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5 font-mono">Incident ID</th>
                <th className="py-3 px-4">Title & Agent Subject</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 font-mono">Confidence</th>
                <th className="py-3 px-4">Decision Route</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => {
                    setActiveIncidentId(inc.id);
                    setCurrentView('investigation');
                  }}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-700">
                    {inc.id}
                  </td>

                  <td className="py-3.5 px-4 max-w-md">
                    <div className="font-bold text-slate-900 line-clamp-1">
                      {inc.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Subject: {inc.primaryAgentName}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <SeverityBadge severity={inc.severity} />
                  </td>

                  <td className="py-3.5 px-4">
                    <IncidentStatusBadge status={inc.status} />
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className={`font-bold ${
                      inc.confidenceScore >= 90 ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {inc.confidenceScore}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {inc.confidenceScore >= 90 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Auto-Executed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Human Approval Required
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <span className="inline-flex items-center gap-1 text-sky-600 font-semibold text-xs hover:text-sky-800">
                      <span>Investigate</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Agent Modal */}
      <FleetAgentModal />
    </div>
  );
};
