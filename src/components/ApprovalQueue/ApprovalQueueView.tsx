import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SeverityBadge, IncidentStatusBadge } from '../Common/StatusBadge';
import { 
  GitPullRequest, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  FileSearch, 
  ExternalLink,
  Clock,
  UserCheck
} from 'lucide-react';

export const ApprovalQueueView: React.FC = () => {
  const { 
    incidents, 
    approveContainment, 
    rejectIncident, 
    requestEvidence, 
    setActiveIncidentId, 
    setCurrentView 
  } = useApp();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-2026-8922');
  const [analystNotes, setAnalystNotes] = useState<string>('');
  const [selectedContainmentId, setSelectedContainmentId] = useState<string>('opt-recon-micro');

  const pendingIncidents = incidents.filter(i => i.status === 'pending_approval' || i.approvalStatus === 'evidence_requested');
  const pastReviewedIncidents = incidents.filter(i => i.approvalStatus === 'approved' || i.approvalStatus === 'rejected');

  const currentIncident = incidents.find(i => i.id === selectedIncidentId) || pendingIncidents[0] || incidents[0];

  const handleApprove = () => {
    if (!currentIncident) return;
    const optionId = selectedContainmentId || (currentIncident.blastRadiusOptions[0]?.id ?? 'default-containment');
    approveContainment(currentIncident.id, optionId, analystNotes);
    setAnalystNotes('');
  };

  const handleReject = () => {
    if (!currentIncident) return;
    rejectIncident(currentIncident.id, analystNotes);
    setAnalystNotes('');
  };

  const handleRequestEvidence = () => {
    if (!currentIncident) return;
    requestEvidence(currentIncident.id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-amber-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Human-in-the-Loop Approval Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Incidents with decision confidence &lt; 90% or high-blast-radius actions routed for security analyst dual-signature.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-amber-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{pendingIncidents.length} Pending Dual Authorization</span>
          </div>
        </div>
      </div>

      {pendingIncidents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">All Approval Queues Clear</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All recent autonomous agent incidents were either self-verified above 90% confidence or reviewed by the security team.
          </p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="mt-2 px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
          >
            Return to Fleet Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of Pending Queue Items */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 px-1">
              Pending Incidents ({pendingIncidents.length})
            </h2>

            <div className="space-y-2.5">
              {pendingIncidents.map((inc) => {
                const isSelected = inc.id === currentIncident?.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncidentId(inc.id);
                      if (inc.blastRadiusOptions[0]) {
                        setSelectedContainmentId(inc.blastRadiusOptions[0].id);
                      }
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {inc.id}
                      </span>
                      <SeverityBadge severity={inc.severity} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
                      {inc.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-100 pt-2">
                      <span>Agent: {inc.primaryAgentName.split('-')[0]}</span>
                      <span className="font-bold text-amber-700">
                        Confidence: {inc.confidenceScore}%
                      </span>
                    </div>

                    {inc.approvalStatus === 'evidence_requested' && (
                      <div className="mt-2 text-[10px] font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <FileSearch className="w-3 h-3" />
                        <span>Extended Forensics Requested</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center & Right Column: Interactive Review Workbench */}
          {currentIncident && (
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Workbench Header */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {currentIncident.id}
                    </span>
                    <SeverityBadge severity={currentIncident.severity} />
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Confidence: {currentIncident.confidenceScore}% (&lt; 90% Threshold)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {currentIncident.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Subject Agent: <strong className="text-slate-800 font-mono">{currentIncident.primaryAgentName}</strong>
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveIncidentId(currentIncident.id);
                    setCurrentView('investigation');
                  }}
                  className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 px-3 py-1.5 rounded-md border border-sky-200 hover:bg-sky-50 transition-colors whitespace-nowrap"
                >
                  <span>Open Full 6-Stage Graph</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Root Cause & Adversarial Challenge Note */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Root Cause Assessment
                  </h4>
                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-medium">
                    {currentIncident.rootCause}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Why Human Sign-Off Was Triggered
                  </h4>
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed space-y-1">
                    <div>
                      • Adversarial Red-Team Challenger revised confidence to <strong>{currentIncident.confidenceScore}%</strong>.
                    </div>
                    <div>
                      • High blast-radius financial settlement endpoint targeted. Two-person dual rule applies.
                    </div>
                  </div>
                </div>

                {/* Containment Selection Matrix */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Containment Scope to Authorize:
                  </h4>
                  <div className="space-y-2">
                    {currentIncident.blastRadiusOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                          selectedContainmentId === opt.id
                            ? 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-400'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="containmentOption"
                          value={opt.id}
                          checked={selectedContainmentId === opt.id}
                          onChange={() => setSelectedContainmentId(opt.id)}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <strong className="text-slate-900">{opt.title}</strong>
                            <span className="font-mono text-emerald-700 font-bold">
                              {opt.downtimePercentage}% Downtime
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed mb-2">
                            {opt.actionDescription}
                          </p>
                          <div className="font-mono text-[10px] text-slate-500 bg-slate-100 p-1.5 rounded">
                            {opt.containmentCommand}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Analyst Notes Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Security Analyst Audit Justification / Sign-off Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={analystNotes}
                    onChange={(e) => setAnalystNotes(e.target.value)}
                    placeholder="e.g. Verified transaction delta with FinOps lead. Authorizing micro-containment of write privileges..."
                    className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleRequestEvidence}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Request Deep Memory Snapshot</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Reject / Dismiss (False Positive)</span>
                  </button>

                  <button
                    onClick={handleApprove}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Dispatch Containment</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historical Audit Trail of Reviewed Incidents */}
      {pastReviewedIncidents.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Analyst Review Audit Trail (This Session)</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {pastReviewedIncidents.map((inc) => (
              <div key={inc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-mono text-[11px] mb-1">
                    <strong className="text-slate-900">{inc.id}</strong>
                    <span className="text-slate-400">•</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                      inc.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {inc.approvalStatus}
                    </span>
                    <span className="text-slate-500 font-sans">{inc.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Reviewer Notes: <span className="italic">"{inc.approvalNotes}"</span>
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 font-mono text-right">
                  Reviewed: {inc.reviewedAt ? new Date(inc.reviewedAt).toLocaleTimeString() : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
