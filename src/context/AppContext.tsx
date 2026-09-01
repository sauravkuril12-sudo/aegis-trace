import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Agent, 
  Incident, 
  Precedent, 
  PolicyRule, 
  SystemNotification,
  LogEntry
} from '../types';
import { 
  INITIAL_AGENTS, 
  SAMPLE_INCIDENTS, 
  PRECEDENT_LIBRARY, 
  INITIAL_POLICIES 
} from '../data/mockData';
import confetti from 'canvas-confetti';

export type AppView = 'dashboard' | 'investigation' | 'approval_queue' | 'precedents' | 'policies';

export type InvestigationStep = 'evidence' | 'graph' | 'policy' | 'redteam' | 'blastradius' | 'finalreport';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  agents: Agent[];
  incidents: Incident[];
  precedents: Precedent[];
  policies: PolicyRule[];
  notifications: SystemNotification[];
  toasts: ToastMessage[];
  
  // Investigation state
  activeIncidentId: string;
  setActiveIncidentId: (id: string) => void;
  activeIncident: Incident | undefined;
  isInvestigating: boolean;
  currentInvestigationStep: InvestigationStep;
  investigationProgress: Record<InvestigationStep, 'pending' | 'processing' | 'completed'>;
  runInvestigation: (incidentId?: string, customLog?: LogEntry[]) => Promise<void>;
  resetInvestigation: () => void;
  setInvestigationStepDirectly: (step: InvestigationStep) => void;
  
  // Approval Queue Actions
  approveContainment: (incidentId: string, containmentOptionId: string, notes?: string) => void;
  rejectIncident: (incidentId: string, notes?: string) => void;
  requestEvidence: (incidentId: string) => void;
  
  // Containment Execution
  applyContainmentDirectly: (incidentId: string, optionId: string) => void;
  restoreAgent: (agentId: string) => void;

  // Policy Editor Actions
  addPolicy: (policy: Omit<PolicyRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePolicy: (id: string, policy: Partial<PolicyRule>) => void;
  deletePolicy: (id: string) => void;

  // Toast / Helpers
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Selected agent modal inspection
  selectedAgentForModal: Agent | null;
  setSelectedAgentForModal: (agent: Agent | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [incidents, setIncidents] = useState<Incident[]>(SAMPLE_INCIDENTS);
  const [precedents] = useState<Precedent[]>(PRECEDENT_LIBRARY);
  const [policies, setPolicies] = useState<PolicyRule[]>(INITIAL_POLICIES);
  
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      timestamp: '1 min ago',
      type: 'auto_contained',
      title: 'Autonomous Containment Executed',
      message: 'Customer-Support-Orchestrator STS credential scope revoked with 96.4% confidence (0% downtime).',
      incidentId: 'INC-2026-9041',
      read: false
    },
    {
      id: 'notif-2',
      timestamp: '10 mins ago',
      type: 'approval_needed',
      title: 'Human Approval Required',
      message: 'Financial-Reconciliation-Agent incident INC-2026-8922 has 84.8% confidence (< 90% threshold).',
      incidentId: 'INC-2026-8922',
      read: false
    },
    {
      id: 'notif-3',
      timestamp: '2 hours ago',
      type: 'precedent_match',
      title: 'Early Warning Pattern Match',
      message: 'CodeReview-Copilot-Worker shows 82% similarity to recursive sub-agent delegation pattern PAT-2026-041.',
      read: true
    }
  ]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeIncidentId, setActiveIncidentId] = useState<string>('INC-2026-9041');
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<Agent | null>(null);

  // Investigation Pipeline State
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [currentInvestigationStep, setCurrentInvestigationStep] = useState<InvestigationStep>('finalreport');
  const [investigationProgress, setInvestigationProgress] = useState<Record<InvestigationStep, 'pending' | 'processing' | 'completed'>>({
    evidence: 'completed',
    graph: 'completed',
    policy: 'completed',
    redteam: 'completed',
    blastradius: 'completed',
    finalreport: 'completed'
  });

  const activeIncident = incidents.find(inc => inc.id === activeIncidentId) || incidents[0];

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Run Investigation Simulation with staged async delays
  const runInvestigation = useCallback(async (incidentId?: string, _customLogs?: LogEntry[]) => {
    const targetId = incidentId || activeIncidentId;
    setActiveIncidentId(targetId);
    setIsInvestigating(true);
    setCurrentInvestigationStep('evidence');
    
    setInvestigationProgress({
      evidence: 'processing',
      graph: 'pending',
      policy: 'pending',
      redteam: 'pending',
      blastradius: 'pending',
      finalreport: 'pending'
    });

    // Step 1: Evidence Ingestion (1.5s)
    await new Promise(r => setTimeout(r, 1400));
    setInvestigationProgress(prev => ({ ...prev, evidence: 'completed', graph: 'processing' }));
    setCurrentInvestigationStep('graph');

    // Step 2: Causal Graph Reconstruction (1.8s)
    await new Promise(r => setTimeout(r, 1700));
    setInvestigationProgress(prev => ({ ...prev, graph: 'completed', policy: 'processing' }));
    setCurrentInvestigationStep('policy');

    // Step 3: Policy Check (1.4s)
    await new Promise(r => setTimeout(r, 1400));
    setInvestigationProgress(prev => ({ ...prev, policy: 'completed', redteam: 'processing' }));
    setCurrentInvestigationStep('redteam');

    // Step 4: Adversarial Red-Team Challenge (2.0s)
    await new Promise(r => setTimeout(r, 1900));
    setInvestigationProgress(prev => ({ ...prev, redteam: 'completed', blastradius: 'processing' }));
    setCurrentInvestigationStep('blastradius');

    // Step 5: Blast Radius Calculation (1.3s)
    await new Promise(r => setTimeout(r, 1300));
    setInvestigationProgress(prev => ({ ...prev, blastradius: 'completed', finalreport: 'processing' }));
    setCurrentInvestigationStep('finalreport');

    // Step 6: Final Decision Synthesis (1.0s)
    await new Promise(r => setTimeout(r, 1000));
    setInvestigationProgress({
      evidence: 'completed',
      graph: 'completed',
      policy: 'completed',
      redteam: 'completed',
      blastradius: 'completed',
      finalreport: 'completed'
    });
    setIsInvestigating(false);

    const targetIncident = incidents.find(i => i.id === targetId);
    if (targetIncident) {
      if (targetIncident.confidenceScore >= 90) {
        addToast({
          type: 'success',
          title: 'Autonomous Verification Complete (≥ 90%)',
          message: `Root cause confirmed with ${targetIncident.confidenceScore}% confidence. Minimum blast-radius containment staged.`
        });
      } else {
        addToast({
          type: 'warning',
          title: 'Routed to Human Approval (< 90%)',
          message: `Confidence is ${targetIncident.confidenceScore}%. Incident queued for security analyst authorization.`
        });
      }
    }
  }, [activeIncidentId, incidents, addToast]);

  const resetInvestigation = useCallback(() => {
    setInvestigationProgress({
      evidence: 'pending',
      graph: 'pending',
      policy: 'pending',
      redteam: 'pending',
      blastradius: 'pending',
      finalreport: 'pending'
    });
    setCurrentInvestigationStep('evidence');
    setIsInvestigating(false);
  }, []);

  const setInvestigationStepDirectly = useCallback((step: InvestigationStep) => {
    if (isInvestigating) return;
    setCurrentInvestigationStep(step);
  }, [isInvestigating]);

  // Apply containment option
  const applyContainmentDirectly = useCallback((incidentId: string, optionId: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'contained',
          selectedContainmentId: optionId,
          resolvedAt: new Date().toISOString()
        };
      }
      return inc;
    }));

    const inc = incidents.find(i => i.id === incidentId);
    if (inc) {
      setAgents(prev => prev.map(ag => {
        if (ag.id === inc.primaryAgentId) {
          return {
            ...ag,
            status: 'contained',
            trustScore: Math.max(30, ag.trustScore - 15)
          };
        }
        return ag;
      }));
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0284c7', '#0d9488', '#10b981']
      });
    } catch {
      // ignore
    }

    addToast({
      type: 'success',
      title: 'Containment Action Executed',
      message: `Successfully applied minimum fix for ${incidentId}. Downstream systems protected.`
    });
  }, [incidents, addToast]);

  // Approval Queue Actions
  const approveContainment = useCallback((incidentId: string, containmentOptionId: string, notes?: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'contained',
          approvalStatus: 'approved',
          selectedContainmentId: containmentOptionId,
          approvalNotes: notes || 'Approved by Security Analyst in Aegis console.',
          reviewedBy: 'Security Ops Analyst (SecOps)',
          reviewedAt: new Date().toISOString(),
          resolvedAt: new Date().toISOString()
        };
      }
      return inc;
    }));

    const inc = incidents.find(i => i.id === incidentId);
    if (inc) {
      setAgents(prev => prev.map(ag => {
        if (ag.id === inc.primaryAgentId) {
          return { ...ag, status: 'contained' };
        }
        return ag;
      }));
    }

    addToast({
      type: 'success',
      title: 'Incident Containment Approved',
      message: `Incident ${incidentId} containment approved and dispatched to agent supervisor.`
    });
  }, [incidents, addToast]);

  const rejectIncident = useCallback((incidentId: string, notes?: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'dismissed',
          approvalStatus: 'rejected',
          approvalNotes: notes || 'Marked as false positive / authorized exception by analyst.',
          reviewedBy: 'Security Ops Lead',
          reviewedAt: new Date().toISOString()
        };
      }
      return inc;
    }));

    const inc = incidents.find(i => i.id === incidentId);
    if (inc) {
      setAgents(prev => prev.map(ag => {
        if (ag.id === inc.primaryAgentId) {
          return { ...ag, status: 'healthy', trustScore: Math.min(100, ag.trustScore + 10) };
        }
        return ag;
      }));
    }

    addToast({
      type: 'info',
      title: 'Incident Dismissed (False Positive)',
      message: `Incident ${incidentId} marked as dismissed. Agent trust score restored.`
    });
  }, [incidents, addToast]);

  const requestEvidence = useCallback((incidentId: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          approvalStatus: 'evidence_requested'
        };
      }
      return inc;
    }));

    addToast({
      type: 'warning',
      title: 'Deep Forensic Snapshot Requested',
      message: `Dispatched container memory dump and extended audit probe for incident ${incidentId}.`
    });
  }, [addToast]);

  const restoreAgent = useCallback((agentId: string) => {
    setAgents(prev => prev.map(ag => {
      if (ag.id === agentId) {
        return {
          ...ag,
          status: 'healthy',
          trustScore: 92,
          trustHistory: [...ag.trustHistory.slice(1), 92]
        };
      }
      return ag;
    }));

    addToast({
      type: 'success',
      title: 'Agent Quarantine Lifted',
      message: `Agent ${agentId} re-verified and returned to active production pool.`
    });
  }, [addToast]);

  // Policy Management
  const addPolicy = useCallback((policy: Omit<PolicyRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `POL-CUSTOM-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString().split('T')[0];
    const newPolicy: PolicyRule = {
      ...policy,
      id,
      createdAt: now,
      updatedAt: now
    };
    setPolicies(prev => [newPolicy, ...prev]);
    addToast({
      type: 'success',
      title: 'Policy Created',
      message: `Policy rule "${newPolicy.name}" (${id}) successfully registered and active.`
    });
  }, [addToast]);

  const updatePolicy = useCallback((id: string, updatedFields: Partial<PolicyRule>) => {
    const now = new Date().toISOString().split('T')[0];
    setPolicies(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, ...updatedFields, updatedAt: now };
      }
      return p;
    }));
    addToast({
      type: 'success',
      title: 'Policy Updated',
      message: `Policy rule ${id} updated and synchronized across all agent sandboxes.`
    });
  }, [addToast]);

  const deletePolicy = useCallback((id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
    addToast({
      type: 'info',
      title: 'Policy Removed',
      message: `Policy rule ${id} deactivated and removed from runtime guardrail.`
    });
  }, [addToast]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        agents,
        incidents,
        precedents,
        policies,
        notifications,
        toasts,
        activeIncidentId,
        setActiveIncidentId,
        activeIncident,
        isInvestigating,
        currentInvestigationStep,
        investigationProgress,
        runInvestigation,
        resetInvestigation,
        setInvestigationStepDirectly,
        approveContainment,
        rejectIncident,
        requestEvidence,
        applyContainmentDirectly,
        restoreAgent,
        addPolicy,
        updatePolicy,
        deletePolicy,
        addToast,
        removeToast,
        markNotificationAsRead,
        clearAllNotifications,
        selectedAgentForModal,
        setSelectedAgentForModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
