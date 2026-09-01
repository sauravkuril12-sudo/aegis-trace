import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { CausalGraphData, CausalNode, CausalLink } from '../../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ShieldAlert, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCw, 
  Layers, 
  X,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

interface CausalGraphProps {
  graphData: CausalGraphData;
  onSelectNode?: (node: CausalNode | null) => void;
  autoPlayDiscovery?: boolean;
}

export const CausalGraph: React.FC<CausalGraphProps> = ({ 
  graphData, 
  onSelectNode,
  autoPlayDiscovery = false 
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<CausalNode | null>(null);
  const [highlightCompromisedOnly, setHighlightCompromisedOnly] = useState<boolean>(false);
  
  // Incremental Live Discovery State
  const [currentStep, setCurrentStep] = useState<number>(graphData.nodes.length);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1200); // ms per step

  const totalSteps = graphData.nodes.length;

  // Filtered nodes and links based on incremental discovery step
  const visibleNodes = useMemo(() => {
    return graphData.nodes.slice(0, currentStep);
  }, [graphData.nodes, currentStep]);

  const visibleNodeIds = useMemo(() => {
    return new Set(visibleNodes.map(n => n.id));
  }, [visibleNodes]);

  const visibleLinks = useMemo(() => {
    return graphData.links.filter(
      link => {
        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
        return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
      }
    );
  }, [graphData.links, visibleNodeIds]);

  // Handle Playback Interval
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, playbackSpeed]);

  const handleNodeClick = (node: CausalNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const handleStartReplay = () => {
    setCurrentStep(1);
    setIsPlaying(true);
  };

  const handleStepForward = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRevealAll = () => {
    setIsPlaying(false);
    setCurrentStep(totalSteps);
  };

  // D3 Rendering Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = Math.max(container.clientHeight || 480, 480);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Container group
    const g = svg.append('g').attr('class', 'graph-container');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Arrow markers
    const defs = svg.append('defs');

    defs.append('marker')
      .attr('id', 'arrow-normal')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 26)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');

    defs.append('marker')
      .attr('id', 'arrow-compromised')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#e11d48');

    // Clone data for simulation
    const nodes: CausalNode[] = visibleNodes.map(d => ({ ...d }));
    const links: any[] = visibleLinks.map(d => ({ ...d }));

    // Force simulation
    const simulation = d3.forceSimulation<CausalNode>(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(140).strength(0.85))
      .force('charge', d3.forceManyBody().strength(-420))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(48));

    // Links group
    const linkGroup = g.append('g').attr('class', 'links');

    const link = linkGroup.selectAll('g')
      .data(links)
      .enter()
      .append('g')
      .attr('class', 'link-item');

    const linkLine = link.append('line')
      .attr('stroke', (d: any) => d.isCompromisedPath ? '#e11d48' : '#cbd5e1')
      .attr('stroke-width', (d: any) => d.isCompromisedPath ? 2.5 : 1.5)
      .attr('stroke-dasharray', (d: any) => d.isCompromisedPath ? '4,3' : 'none')
      .attr('marker-end', (d: any) => d.isCompromisedPath ? 'url(#arrow-compromised)' : 'url(#arrow-normal)')
      .attr('opacity', (d: any) => {
        if (highlightCompromisedOnly && !d.isCompromisedPath) return 0.15;
        return 0.9;
      });

    // Link label
    const linkText = link.append('text')
      .attr('class', 'link-label')
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', (d: any) => d.isCompromisedPath ? '#be123c' : '#64748b')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .text((d: any) => d.relation)
      .attr('opacity', (d: any) => {
        if (highlightCompromisedOnly && !d.isCompromisedPath) return 0.1;
        return 0.85;
      });

    // Nodes group
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const node = nodeGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-item cursor-pointer')
      .call(
        d3.drag<any, CausalNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (_event, d) => {
        handleNodeClick(d);
      });

    // Outer pulse ring for compromised nodes
    node.filter((d: CausalNode) => d.status === 'compromised' || d.status === 'quarantined')
      .append('circle')
      .attr('r', 27)
      .attr('fill', (d: CausalNode) => d.status === 'compromised' ? '#fee2e2' : '#fef3c7')
      .attr('stroke', (d: CausalNode) => d.status === 'compromised' ? '#f87171' : '#fcd34d')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')
      .attr('class', 'animate-pulse');

    // Newly uncovered node highlight
    if (visibleNodes.length > 0) {
      const lastNodeId = visibleNodes[visibleNodes.length - 1].id;
      node.filter((d: CausalNode) => d.id === lastNodeId && currentStep < totalSteps)
        .append('circle')
        .attr('r', 34)
        .attr('fill', 'none')
        .attr('stroke', '#0284c7')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,2')
        .attr('class', 'animate-spin');
    }

    // Main Node Circle
    node.append('circle')
      .attr('r', 19)
      .attr('fill', (d: CausalNode) => {
        if (d.type === 'agent') return '#0284c7';
        if (d.type === 'tool') return '#4f46e5';
        if (d.type === 'credential') return '#d97706';
        if (d.type === 'resource') return '#0d9488';
        if (d.type === 'sub_agent') return '#7c3aed';
        return '#e11d48';
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2.5)
      .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))');

    // Node Type Icon Text
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'sans-serif')
      .attr('pointer-events', 'none')
      .text((d: CausalNode) => {
        if (d.type === 'agent') return 'AG';
        if (d.type === 'tool') return 'TL';
        if (d.type === 'credential') return 'CR';
        if (d.type === 'resource') return 'RS';
        if (d.type === 'sub_agent') return 'SUB';
        return 'EXT';
      });

    // Node Label
    node.append('text')
      .attr('dy', 32)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#0f172a')
      .attr('class', 'select-none')
      .text((d: CausalNode) => d.label);

    // Node Category Tag
    node.append('text')
      .attr('dy', 44)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#64748b')
      .attr('class', 'select-none')
      .text((d: CausalNode) => d.details.category);

    // Tick update
    simulation.on('tick', () => {
      linkLine
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkText
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node.attr('transform', (d: CausalNode) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [visibleNodes, visibleLinks, highlightCompromisedOnly, currentStep, totalSteps]);

  const handleZoom = (factor: number) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      factor
    );
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(400).call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
  };

  const latestDiscoveredNode = visibleNodes[visibleNodes.length - 1];

  return (
    <div className="relative w-full h-[540px] bg-slate-50/70 rounded-xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Graph Toolbar & Playback Controls */}
      <div className="bg-white/95 backdrop-blur-xs px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Causal Breach Graph
            </span>
          </div>

          {/* Incremental Discovery Progress Indicator */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-xs font-mono">
            <span className="text-slate-500">Uncovered:</span>
            <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              {currentStep} of {totalSteps} Nodes
            </span>
            <span className="text-slate-400">({visibleLinks.length} Links)</span>
          </div>
        </div>

        {/* Live Replay & Interactive Step Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Step Timeline Player */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={isPlaying ? () => setIsPlaying(false) : () => setIsPlaying(true)}
              className="p-1.5 hover:bg-white rounded text-slate-700 flex items-center gap-1 font-semibold"
              title={isPlaying ? 'Pause live reconstruction' : 'Play live reconstruction'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-600 fill-amber-600" /> : <Play className="w-3.5 h-3.5 text-sky-600 fill-sky-600" />}
              <span className="text-[11px]">{isPlaying ? 'Pause' : 'Live Replay'}</span>
            </button>

            <button
              onClick={handleStepBackward}
              disabled={currentStep <= 1}
              className="p-1.5 hover:bg-white rounded text-slate-600 disabled:opacity-30"
              title="Step Backward"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            <button
              onClick={handleStepForward}
              disabled={currentStep >= totalSteps}
              className="p-1.5 hover:bg-white rounded text-slate-600 disabled:opacity-30"
              title="Step Forward"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleRevealAll}
              className="px-2 py-1 hover:bg-white rounded text-[11px] font-semibold text-slate-700"
              title="Show all discovered nodes immediately"
            >
              Reveal All
            </button>
          </div>

          {/* Compromised filter */}
          <button
            onClick={() => setHighlightCompromisedOnly(!highlightCompromisedOnly)}
            className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              highlightCompromisedOnly
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Compromised Path</span>
          </button>

          {/* Zoom buttons */}
          <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => handleZoom(1.25)}
              className="p-1.5 hover:bg-slate-100 text-slate-600 border-r border-slate-200"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(0.8)}
              className="p-1.5 hover:bg-slate-100 text-slate-600 border-r border-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-slate-100 text-slate-600"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Event Replay Banner */}
      {currentStep < totalSteps && latestDiscoveredNode && (
        <div className="bg-sky-50/90 border-b border-sky-200 px-4 py-1.5 flex items-center justify-between text-xs text-sky-900 z-10 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span className="font-semibold">Reconstructing causal evidence:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-sky-200 font-bold">
              Entity #{currentStep}: {latestDiscoveredNode.details.name} ({latestDiscoveredNode.type})
            </span>
          </div>
          <span className="text-[11px] text-sky-700 font-mono">
            {latestDiscoveredNode.details.category} • Status: {latestDiscoveredNode.status}
          </span>
        </div>
      )}

      {/* SVG Canvas */}
      <div ref={containerRef} className="relative flex-1 w-full h-full bg-[#fbfcfd]">
        {/* Subtle grid pattern background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <defs>
            <pattern id="graph-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-grid)" />
        </svg>

        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 text-[11px] shadow-xs flex flex-wrap items-center gap-3">
          <div className="font-semibold text-slate-700">Legend:</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
            <span className="text-slate-600">Agent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4f46e5]" />
            <span className="text-slate-600">Tool</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
            <span className="text-slate-600">Credential</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]" />
            <span className="text-slate-600">Resource</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" />
            <span className="text-slate-600">Target / Exploit</span>
          </div>
        </div>

        {/* Node Inspection Drawer */}
        {selectedNode && (
          <div className="absolute top-3 right-3 w-84 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-20 animate-in fade-in slide-in-from-right-4 duration-150">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
              <div>
                <span className="inline-block text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 mb-1">
                  {selectedNode.type} node
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {selectedNode.details.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Category & Classification
                </div>
                <div className="text-slate-800 font-medium">{selectedNode.details.category}</div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Node Status & Risk Level
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedNode.status === 'compromised'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedNode.status === 'quarantined'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedNode.status}
                  </span>
                  <span className="text-slate-600 font-mono">Risk: {selectedNode.details.riskLevel}</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Forensic Trace Finding
                </div>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-md border border-slate-200/60">
                  {selectedNode.details.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Node ID: {selectedNode.id}</span>
                <span className="text-sky-600 font-semibold cursor-pointer hover:underline">
                  Verified in Graph
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
