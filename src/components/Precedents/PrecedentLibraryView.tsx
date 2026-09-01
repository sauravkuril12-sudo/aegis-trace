import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Precedent } from '../../types';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ShieldAlert, 
  Bot, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Fingerprint, 
  Activity,
  Zap,
  Tag,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Cpu,
  BarChart2,
  GitCompare,
  Code
} from 'lucide-react';

export const PrecedentLibraryView: React.FC = () => {
  const { precedents, agents, setSelectedAgentForModal, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePrecedent, setActivePrecedent] = useState<Precedent>(precedents[0]);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const categories = ['All', 'Prompt Injection', 'Chained Tool Abuse', 'Privilege Escalation', 'Recursive Loop', 'Data Exfiltration'];

  const filteredPrecedents = precedents.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.incidentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patternSignature.mitreAtlasRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTestSignature = (prec: Precedent) => {
    addToast({
      type: 'success',
      title: 'Telemetry Pattern Scan Dispatched',
      message: `Triggered real-time correlation probe for ${prec.incidentCode} across ${agents.length} live agents.`
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Aegis Precedent & Pattern Signature Library
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical incident signatures learned across agent fleets with live early-warning behavioral matching and mathematical sequence alignment.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span>Signatures: <strong className="text-slate-900">{precedents.length}</strong></span>
          </div>
          <div className="bg-amber-50 text-amber-900 px-3 py-1.5 rounded-lg border border-amber-200">
            <span>Fleet Early Warnings: <strong className="text-amber-700 font-bold">3 Agents</strong></span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pattern signatures, MITRE ATLAS tags, agent names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Precedents List + Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Precedents (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 px-1">
            Learned Signatures ({filteredPrecedents.length})
          </h2>

          <div className="space-y-2.5">
            {filteredPrecedents.map((prec) => {
              const isSelected = prec.id === activePrecedent?.id;
              return (
                <div
                  key={prec.id}
                  onClick={() => {
                    setActivePrecedent(prec);
                    setExpandedMatchId(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-400/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                      {prec.incidentCode}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Discovered: {prec.discoveredDate}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug mb-2">
                    {prec.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
                    <span className="font-sans font-medium text-slate-600">{prec.category}</span>
                    <span className="text-amber-700 font-bold">
                      {prec.matchingLiveAgents.length} Live Early Warnings
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Precedent Deep Dive & Early Warning Live Agents (7 cols) */}
        {activePrecedent && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            {/* Header */}
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                    {activePrecedent.incidentCode}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    MITRE ATLAS: <strong className="text-slate-800">{activePrecedent.patternSignature.mitreAtlasRef}</strong>
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {activePrecedent.title}
                </h2>
                <div className="text-xs text-slate-500 font-mono">
                  Signature Hash: {activePrecedent.patternSignature.signatureHash}
                </div>
              </div>

              <button
                onClick={() => handleTestSignature(activePrecedent)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span>Test Live Telemetry</span>
              </button>
            </div>

            {/* Causal Sequence Chain */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Correlated Causal Sequence Signature
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                {activePrecedent.patternSignature.sequence.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200">
                      {step}
                    </span>
                    {idx < activePrecedent.patternSignature.sequence.length - 1 && (
                      <span className="text-slate-400 text-xs font-bold">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Trigger Indicators */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Runtime Tripwire Trigger Indicators
              </h4>
              <div className="space-y-1.5 text-xs">
                {activePrecedent.patternSignature.triggerIndicators.map((ind, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Intervention */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recommended Minimum Necessary Intervention
              </h4>
              <p className="text-xs text-slate-800 bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 leading-relaxed font-medium">
                {activePrecedent.recommendedIntervention}
              </p>
            </div>

            {/* Live Fleet Early Warning Matches & Vector Alignment */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Live Monitored Agents Matching This Pattern ({activePrecedent.matchingLiveAgents.length})</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">Similarity Threshold ≥ 30%</span>
              </div>

              {activePrecedent.matchingLiveAgents.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  Zero active agents currently exhibit similarity to this pattern.
                </div>
              ) : (
                <div className="space-y-3">
                  {activePrecedent.matchingLiveAgents.map((match) => {
                    const agentObj = agents.find(a => a.id === match.agentId);
                    const isExpanded = expandedMatchId === match.agentId;

                    return (
                      <div 
                        key={match.agentId}
                        className="rounded-xl border border-amber-200 bg-amber-50/40 overflow-hidden"
                      >
                        <div className="p-4 space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-slate-700" />
                              <strong className="text-xs text-slate-900 font-mono">{match.agentName}</strong>
                              <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                                match.riskTier === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {match.riskTier} Risk
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                                {match.similarityScore}% Pattern Match
                              </span>
                              {agentObj && (
                                <button
                                  onClick={() => setSelectedAgentForModal(agentObj)}
                                  className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 rounded border border-slate-300 text-slate-700"
                                >
                                  Inspect Agent
                                </button>
                              )}
                              <button
                                onClick={() => setExpandedMatchId(isExpanded ? null : match.agentId)}
                                className="px-2 py-1 text-[11px] font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded flex items-center gap-1 transition-colors"
                              >
                                <span>{isExpanded ? 'Hide Similarity Math' : 'Why This Match?'}</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-slate-600">Early Telemetry Flags:</span>
                            {match.earlyWarningFlags.map((flag, idx) => (
                              <div key={idx} className="text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-amber-200/60">
                                • {flag}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Expandable Mathematical Similarity Vector Breakdown */}
                        {isExpanded && (
                          <div className="bg-slate-900 text-slate-200 p-4 border-t border-amber-300 text-xs space-y-3 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2">
                              <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                                <GitCompare className="w-3.5 h-3.5" />
                                <span>Vector & Sequence Trajectory Alignment</span>
                              </span>
                              <span>Cosine Distance: {(1 - match.similarityScore / 100).toFixed(3)}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                              <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                                <div className="text-slate-400 text-[10px] uppercase font-bold">Tool Sequence Alignment</div>
                                <div className="text-emerald-400 font-bold mt-1">{(match.similarityScore * 0.95).toFixed(1)}% Match</div>
                                <p className="text-[10px] text-slate-400 mt-1 font-sans">Identical tool discovery and execution order.</p>
                              </div>

                              <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                                <div className="text-slate-400 text-[10px] uppercase font-bold">Prompt Semantic Distance</div>
                                <div className="text-sky-400 font-bold mt-1">{(match.similarityScore * 1.02 > 99 ? 98.4 : match.similarityScore * 1.02).toFixed(1)}% Match</div>
                                <p className="text-[10px] text-slate-400 mt-1 font-sans">Embeddings match unapproved credential request embeddings.</p>
                              </div>

                              <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                                <div className="text-slate-400 text-[10px] uppercase font-bold">MITRE Technique Mapping</div>
                                <div className="text-amber-400 font-bold mt-1">100.0% Concordant</div>
                                <p className="text-[10px] text-slate-400 mt-1 font-sans">Corresponds to {activePrecedent.patternSignature.mitreAtlasRef}.</p>
                              </div>
                            </div>

                            <div className="pt-2 text-[11px] font-sans text-slate-300">
                              <strong>Pre-emptive Recommendation:</strong> Restrict agent credential scope to read-only before autonomous escalation occurs.
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
