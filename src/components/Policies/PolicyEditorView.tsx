import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PolicyRule, IncidentSeverity } from '../../types';
import { SeverityBadge } from '../Common/StatusBadge';
import { 
  Sliders, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Sparkles,
  Save,
  Layers,
  CheckCircle2,
  Scale
} from 'lucide-react';

export const PolicyEditorView: React.FC = () => {
  const { policies, agents, addPolicy, updatePolicy, deletePolicy, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    targetAgents: string[];
    category: PolicyRule['category'];
    severity: IncidentSeverity;
    autoContainmentThreshold: number;
    enforcementMode: PolicyRule['enforcementMode'];
    ruleCondition: string;
    allowedScopes: string;
    disallowedActions: string;
    complianceStandard: string;
  }>({
    name: '',
    description: '',
    targetAgents: ['*'],
    category: 'Access Control',
    severity: 'high',
    autoContainmentThreshold: 90,
    enforcementMode: 'enforce',
    ruleCondition: '',
    allowedScopes: '',
    disallowedActions: '',
    complianceStandard: 'SOC2-CC6.1'
  });

  const categories = ['All', 'Access Control', 'Egress Control', 'Tool Authorization', 'Rate Limits', 'Resource Isolation'];

  const filteredPolicies = policies.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingPolicyId(null);
    setFormData({
      name: '',
      description: '',
      targetAgents: ['*'],
      category: 'Access Control',
      severity: 'high',
      autoContainmentThreshold: 90,
      enforcementMode: 'enforce',
      ruleCondition: 'agent.role == "support" && resource.is_pii == true',
      allowedScopes: 's3:GetObject on /support-attachments/*',
      disallowedActions: 's3:ListBucket on pii-vault, s3:DeleteBucket',
      complianceStandard: 'SOC2-CC6.1 / OWASP-LLM-02'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: PolicyRule) => {
    setEditingPolicyId(p.id);
    setFormData({
      name: p.name,
      description: p.description,
      targetAgents: p.targetAgents,
      category: p.category,
      severity: p.severity,
      autoContainmentThreshold: p.autoContainmentThreshold,
      enforcementMode: p.enforcementMode,
      ruleCondition: p.ruleCondition,
      allowedScopes: p.allowedScopes.join(', '),
      disallowedActions: p.disallowedActions.join(', '),
      complianceStandard: p.complianceStandard
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast({ type: 'error', title: 'Name Required', message: 'Please provide a policy rule name.' });
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      targetAgents: formData.targetAgents,
      category: formData.category,
      severity: formData.severity,
      autoContainmentThreshold: Number(formData.autoContainmentThreshold),
      enforcementMode: formData.enforcementMode,
      ruleCondition: formData.ruleCondition,
      allowedScopes: formData.allowedScopes.split(',').map(s => s.trim()).filter(Boolean),
      disallowedActions: formData.disallowedActions.split(',').map(s => s.trim()).filter(Boolean),
      complianceStandard: formData.complianceStandard
    };

    if (editingPolicyId) {
      updatePolicy(editingPolicyId, payload);
    } else {
      addPolicy(payload);
    }

    setIsModalOpen(false);
  };

  const handleToggleMode = (policy: PolicyRule) => {
    const nextMode: PolicyRule['enforcementMode'] = 
      policy.enforcementMode === 'enforce' ? 'audit_only' : policy.enforcementMode === 'audit_only' ? 'disabled' : 'enforce';
    updatePolicy(policy.id, { enforcementMode: nextMode });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Agent Guardrail Policy Editor
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Define declarative runtime tool boundaries, autonomous containment confidence thresholds, and compliance constraints.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          <span>Add New Policy Rule</span>
        </button>
      </div>

      {/* Filter & Search Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search policies, compliance tags..."
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

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPolicies.map((policy) => (
          <div
            key={policy.id}
            className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
              policy.enforcementMode === 'disabled'
                ? 'opacity-60 bg-slate-50/70 border-slate-200'
                : policy.enforcementMode === 'audit_only'
                ? 'border-amber-200'
                : 'border-slate-200 hover:border-sky-300'
            }`}
          >
            <div>
              {/* Top Meta */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {policy.id}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {policy.category}
                  </span>
                </div>

                <SeverityBadge severity={policy.severity} />
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                {policy.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">
                {policy.description}
              </p>

              {/* Rule condition preview */}
              <div className="space-y-1 mb-3">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Rule Logic
                </div>
                <div className="font-mono text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 truncate" title={policy.ruleCondition}>
                  {policy.ruleCondition}
                </div>
              </div>

              {/* Target agents badge */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                <span className="font-medium text-[11px]">Applied to:</span>
                {policy.targetAgents.includes('*') ? (
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    All Agents (*)
                  </span>
                ) : (
                  policy.targetAgents.map(agId => (
                    <span key={agId} className="font-mono text-[10px] bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200 truncate max-w-xs">
                      {agId}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleMode(policy)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold font-mono uppercase tracking-wider border transition-colors ${
                    policy.enforcementMode === 'enforce'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : policy.enforcementMode === 'audit_only'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                  title="Click to toggle Enforcement mode"
                >
                  Mode: {policy.enforcementMode}
                </button>

                <span className="text-[11px] font-mono text-slate-500">
                  Threshold: <strong>≥{policy.autoContainmentThreshold}%</strong>
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(policy)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                  title="Edit Rule"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deletePolicy(policy.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                  title="Delete Rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Policy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                  {editingPolicyId ? `Editing Policy: ${editingPolicyId}` : 'New Policy Rule'}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {editingPolicyId ? 'Update Guardrail Configuration' : 'Create Autonomous Agent Policy'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Policy Rule Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Prohibit Unverified Postgres DDL Alterations"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Justification
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the risk and why this policy restricts the agent..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Access Control">Access Control</option>
                    <option value="Egress Control">Egress Control</option>
                    <option value="Tool Authorization">Tool Authorization</option>
                    <option value="Rate Limits">Rate Limits</option>
                    <option value="Resource Isolation">Resource Isolation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Severity
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Enforcement Mode
                  </label>
                  <select
                    value={formData.enforcementMode}
                    onChange={(e) => setFormData({ ...formData, enforcementMode: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="enforce">Enforce (Auto-Contain)</option>
                    <option value="audit_only">Audit Only (Alert)</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider">
                    Autonomous Containment Confidence Threshold
                  </label>
                  <span className="font-mono font-bold text-sky-700 text-sm">
                    {formData.autoContainmentThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={99}
                  value={formData.autoContainmentThreshold}
                  onChange={(e) => setFormData({ ...formData, autoContainmentThreshold: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Decisions above this confidence score apply the minimum necessary fix autonomously. Below this threshold, incidents route to the human approval queue.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Agents (Comma separated IDs or * for all)
                </label>
                <input
                  type="text"
                  value={formData.targetAgents.join(', ')}
                  onChange={(e) => setFormData({ ...formData, targetAgents: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="e.g. agent-reconcile-01, agent-support-02 or *"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Declarative Rule Expression
                </label>
                <input
                  type="text"
                  value={formData.ruleCondition}
                  onChange={(e) => setFormData({ ...formData, ruleCondition: e.target.value })}
                  placeholder="e.g. action.is_write == true && resource.is_production == true"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Allowed Scopes (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.allowedScopes}
                    onChange={(e) => setFormData({ ...formData, allowedScopes: e.target.value })}
                    placeholder="e.g. SELECT on transactions, read_only"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Disallowed Actions (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.disallowedActions}
                    onChange={(e) => setFormData({ ...formData, disallowedActions: e.target.value })}
                    placeholder="e.g. UPDATE, DELETE, raw_secret_dump"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Compliance Reference Tags
                </label>
                <input
                  type="text"
                  value={formData.complianceStandard}
                  onChange={(e) => setFormData({ ...formData, complianceStandard: e.target.value })}
                  placeholder="e.g. SOC2-CC6.1 / ISO27001-A.9 / OWASP-LLM-02"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5 text-sky-400" />
                  <span>{editingPolicyId ? 'Save Changes' : 'Create Policy'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
