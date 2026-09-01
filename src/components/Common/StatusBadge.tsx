import React from 'react';
import { AgentStatus, IncidentSeverity, IncidentStatus } from '../../types';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, CheckCircle2, Clock, Ban } from 'lucide-react';

interface TrustBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ score, size = 'md', showLabel = true }) => {
  let colorBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';
  let label = 'High Trust';

  if (score < 50) {
    colorBg = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
    label = 'Critical Risk';
  } else if (score < 80) {
    colorBg = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
    label = 'Degraded Trust';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-bold px-3 py-1.5'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-md border font-mono ${colorBg} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      <span>{score}/100</span>
      {showLabel && size !== 'sm' && (
        <span className="font-sans font-normal text-[11px] opacity-80 border-l pl-1.5 ml-0.5 border-current/20">
          {label}
        </span>
      )}
    </div>
  );
};

export const AgentStatusBadge: React.FC<{ status: AgentStatus }> = ({ status }) => {
  switch (status) {
    case 'healthy':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Healthy
        </span>
      );
    case 'investigating':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          Investigating
        </span>
      );
    case 'warning':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200/80">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
          Warning
        </span>
      );
    case 'contained':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80">
          <ShieldX className="w-3.5 h-3.5 text-rose-600" />
          Contained
        </span>
      );
    default:
      return null;
  }
};

export const SeverityBadge: React.FC<{ severity: IncidentSeverity }> = ({ severity }) => {
  switch (severity) {
    case 'critical':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
          Critical
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-300">
          High
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
          Medium
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
          Low
        </span>
      );
  }
};

export const IncidentStatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  switch (status) {
    case 'open':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3 h-3" /> Open
        </span>
      );
    case 'investigating':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 animate-pulse">
          <Clock className="w-3 h-3" /> Investigating
        </span>
      );
    case 'pending_approval':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3" /> Pending Approval
        </span>
      );
    case 'contained':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Contained
        </span>
      );
    case 'dismissed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <Ban className="w-3 h-3" /> Dismissed
        </span>
      );
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Resolved
        </span>
      );
  }
};
