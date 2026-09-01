export type AgentStatus = 'healthy' | 'investigating' | 'contained' | 'warning';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus = 'open' | 'investigating' | 'pending_approval' | 'contained' | 'dismissed' | 'resolved';

export interface Agent {
  id: string;
  name: string;
  codename: string;
  role: string;
  model: string;
  status: AgentStatus;
  trustScore: number; // 0 - 100
  trustHistory: number[]; // 7-day sparkline
  activeIncidentsCount: number;
  environment: 'production' | 'staging' | 'sandbox';
  allowedTools: string[];
  assignedCredentials: string[];
  invocationsPerHour: number;
  lastActive: string;
  ownerTeam: string;
  description: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  actionType: 'tool_call' | 'credential_access' | 'database_query' | 'api_request' | 'agent_delegation' | 'file_write' | 'network_egress';
  toolName?: string;
  resourceTarget: string;
  status: 'success' | 'denied' | 'flagged' | 'error';
  latencyMs: number;
  parameters: Record<string, any>;
  anomalyScore: number; // 0.0 - 1.0
  isViolating?: boolean;
}

export interface CausalNode {
  id: string;
  label: string;
  type: 'agent' | 'tool' | 'credential' | 'resource' | 'sub_agent' | 'external_target';
  status: 'healthy' | 'compromised' | 'quarantined' | 'normal';
  details: {
    name: string;
    category: string;
    riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
    description: string;
    metrics?: Record<string, string | number>;
    logs?: LogEntry[];
  };
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface CausalLink {
  source: string | CausalNode;
  target: string | CausalNode;
  relation: string;
  isCompromisedPath: boolean;
  timestamp?: string;
  payloadSnippet?: string;
}

export interface CausalGraphData {
  nodes: CausalNode[];
  links: CausalLink[];
}

export interface PolicyViolation {
  ruleId: string;
  ruleName: string;
  severity: IncidentSeverity;
  ruleDefinition: string;
  violationEvidence: string;
  complianceTags: string[];
  matchedTimestamp: string;
  offendingAction: string;
}

export interface RedTeamHypothesis {
  hypothesis: string;
  challengerArgument: string;
  adversaryConfidenceScore: number;
  counterEvidenceAnalyzed: string[];
  verdict: 'UPHELD' | 'REVISED' | 'REFUTED';
  verdictReasoning: string;
}

export interface BlastRadiusOption {
  id: string;
  title: string;
  scopeType: 'credential_revocation' | 'agent_quarantine' | 'pipeline_shutdown' | 'rate_limit_and_sandbox';
  isRecommended: boolean;
  downtimePercentage: number;
  estimatedRecoveryTime: string;
  affectedAgentsCount: number;
  affectedResources: string[];
  slaImpact: 'Negligible' | 'Minor' | 'Moderate' | 'Severe';
  actionDescription: string;
  containmentCommand: string;
}

export interface Incident {
  id: string;
  title: string;
  primaryAgentId: string;
  primaryAgentName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  detectedAt: string;
  resolvedAt?: string;
  confidenceScore: number; // 0 - 100
  confidenceThreshold: number; // typically 90
  routeDecision: 'auto_executed' | 'routed_to_approval';
  rootCause: string;
  evidenceSummary: string;
  evidenceLogs: LogEntry[];
  causalGraph: CausalGraphData;
  policyViolations: PolicyViolation[];
  redTeamChallenge: {
    challengerAgent: string;
    roundsCompleted: number;
    initialConfidence: number;
    finalConfidence: number;
    overallResolution: 'UPHELD' | 'REVISED' | 'DISMISSED';
    detailedSummary: string;
    hypotheses: RedTeamHypothesis[];
  };
  blastRadiusOptions: BlastRadiusOption[];
  selectedContainmentId?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'evidence_requested';
  approvalNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Precedent {
  id: string;
  incidentCode: string;
  title: string;
  category: 'Prompt Injection' | 'Chained Tool Abuse' | 'Privilege Escalation' | 'Recursive Loop' | 'Data Exfiltration';
  discoveredDate: string;
  patternSignature: {
    signatureHash: string;
    sequence: string[];
    triggerIndicators: string[];
    mitreAtlasRef: string;
  };
  recommendedIntervention: string;
  matchingLiveAgents: {
    agentId: string;
    agentName: string;
    similarityScore: number; // 0 - 100
    earlyWarningFlags: string[];
    riskTier: 'high' | 'medium' | 'low';
  }[];
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  targetAgents: string[]; // agent IDs or '*' for all
  category: 'Access Control' | 'Egress Control' | 'Rate Limits' | 'Resource Isolation' | 'Tool Authorization';
  severity: IncidentSeverity;
  autoContainmentThreshold: number; // e.g. 90
  enforcementMode: 'enforce' | 'audit_only' | 'disabled';
  ruleCondition: string;
  allowedScopes: string[];
  disallowedActions: string[];
  complianceStandard: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemNotification {
  id: string;
  timestamp: string;
  type: 'incident_flagged' | 'auto_contained' | 'approval_needed' | 'policy_updated' | 'precedent_match';
  title: string;
  message: string;
  incidentId?: string;
  read: boolean;
}
