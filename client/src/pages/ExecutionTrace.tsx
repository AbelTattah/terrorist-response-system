import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter, Download, AlertCircle } from 'lucide-react';

/**
 * Execution Trace Viewer - Shows detailed log of agent decisions and actions
 * Demonstrates system behavior and decision-making process
 */
export default function ExecutionTrace() {
  const [traces, setTraces] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch traces from live backend
  useEffect(() => {
    const fetchTraces = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/traces');
        if (!response.ok) throw new Error('BACKEND_OFFLINE');

        const data = await response.json();
        setTraces(data.traces || []);
      } catch (err: any) {
        console.error('Error fetching traces:', err);
        setError('TRACE_LINK_FAILURE');
      } finally {
        setLoading(false);
      }
    };

    fetchTraces();
  }, [retryCount]);

  const filteredTraces = traces.filter(trace => {
    if (filter === 'all') return true;
    return trace.agent === filter;
  });

  const agents = Array.from(new Set(traces.map(t => t.agent).filter(Boolean)));

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'event_detected': return 'text-red-400';
      case 'state_change': return 'text-cyan-400';
      case 'decision': return 'text-yellow-400';
      case 'action': return 'text-green-400';
      case 'event': return 'text-magenta-400';
      default: return 'text-gray-400';
    }
  };

  const getEventTypeBg = (type: string) => {
    switch (type) {
      case 'event_detected': return 'bg-red-900 bg-opacity-20';
      case 'state_change': return 'bg-cyan-900 bg-opacity-20';
      case 'decision': return 'bg-yellow-900 bg-opacity-20';
      case 'action': return 'bg-green-900 bg-opacity-20';
      case 'event': return 'bg-magenta-900 bg-opacity-20';
      default: return 'bg-gray-900 bg-opacity-20';
    }
  };

  return (
    <div className="h-full bg-black text-white p-6 overflow-hidden flex flex-col">
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
          animation: 'scanlines 8s linear infinite'
        }} />
      </div>

      <div className="relative z-10 flex flex-col h-full gap-6">
        {/* Header - Compact */}
        <div className="border-b-2 border-cyan-500 pb-4 flex flex-col gap-1 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white tracking-widest font-mono uppercase">System_Execution_Trace</h1>
            {error && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/50 px-3 py-1 rounded animate-pulse">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-[10px] text-red-500 font-mono font-bold uppercase tracking-tighter">
                  TRACE_SYNC_LOST: {error}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-[8px] bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono border border-red-500/20"
                  onClick={() => setRetryCount(prev => prev + 1)}
                >
                  RE-SYNC
                </Button>
              </div>
            )}
          </div>
          <p className="text-cyan-400 text-xs font-mono opacity-80 uppercase">Heuristic analysis of agent decision cycles // LOG_LEVEL: VERBOSE</p>
        </div>

        {/* Controls - Compact */}
        <div className="flex gap-4 items-center flex-shrink-0">
          <div className="flex items-center gap-2 bg-gray-950/40 border border-cyan-500/20 px-3 py-1.5 rounded">
            <Filter className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-800 font-mono text-[10px] uppercase tracking-tighter">Filter_Node:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-mono text-[10px] uppercase cursor-pointer"
            >
              <option value="all">ALL_AGENTS</option>
              {agents && agents.map((agent: string) => (
                <option key={agent} value={agent} className="bg-gray-900">{(agent ?? '').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <Button className="ml-auto bg-cyan-950/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-400 font-mono text-[10px] h-8 tracking-widest uppercase">
            <Download className="w-3 h-3 mr-2" />
            Export_Buffer
          </Button>
        </div>

        {/* Main Content Area - Scrollable internal */}
        <div className="flex-1 min-h-0 flex flex-col gap-6 overflow-hidden">
          {/* Trace Timeline */}
          <Card className="bg-gray-900/50 border border-cyan-500/50 p-6 flex-1 overflow-hidden flex flex-col min-h-0 shadow-[0_0_15px_rgba(0,255,255,0.05)]">
            <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent space-y-4">
              {filteredTraces && filteredTraces.map((trace: any, index: number) => (
                <div key={trace.id} className="relative">
                  {/* Timeline connector */}
                  {index < filteredTraces.length - 1 && (
                    <div className="absolute left-[22px] top-12 w-px h-8 bg-cyan-900/30"></div>
                  )}

                  {/* Trace entry */}
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${getEventTypeBg(trace.event_type)} ${expandedTrace === trace.id ? 'border-cyan-400 bg-cyan-400/5' : 'border-cyan-500/10 hover:border-cyan-400/50'}`}
                    onClick={() => setExpandedTrace(expandedTrace === trace.id ? null : trace.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Timeline indicator */}
                      <div className="flex-shrink-0 mt-1.5 flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${expandedTrace === trace.id ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-900'}`}></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
                            <span className="font-mono text-[10px] text-gray-500 tracking-tighter">
                              {new Date(trace.timestamp as string).toLocaleTimeString([], { hour12: false })}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-cyan-400 tracking-widest uppercase">
                              {trace.agent}
                            </span>
                            <div className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest bg-black/40 border border-current opacity-70 ${getEventTypeColor(trace.event_type)}`}>
                              {(trace.event_type ?? 'unknown').toUpperCase()}
                            </div>
                          </div>
                          <ChevronDown
                            className={`w-3 h-3 text-cyan-600 transition-transform duration-300 ${expandedTrace === trace.id ? 'rotate-180' : ''
                              }`}
                          />
                        </div>

                        <p className="text-white text-xs font-mono mb-2 uppercase tracking-tighter leading-relaxed">
                          <span className="text-cyan-950 mr-2 opacity-50">&gt;</span>
                          {trace.message}
                        </p>

                        {/* State transition */}
                        {trace.from_state && trace.to_state && (
                          <div className="flex items-center gap-2 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                            <span className="text-yellow-600/80">{trace.from_state}</span>
                            <span className="opacity-30">→</span>
                            <span className="text-green-600/80">{trace.to_state}</span>
                          </div>
                        )}

                        {/* Expanded details */}
                        {expandedTrace === trace.id && trace.details && (
                          <div className="mt-4 p-4 bg-black/60 rounded border border-cyan-500/20 font-mono text-[9px] uppercase tracking-tighter animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                              {Object.entries(trace.details as Record<string, any>).map(([key, value]) => (
                                <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                                  <span className="text-cyan-800">{key}:</span>
                                  <span className="text-cyan-100/90 text-right truncate pl-4">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Statistics - Compact Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
            {[
              { label: "Total_Heap", value: traces.length, color: "text-cyan-400" },
              { label: "State_Cycles", value: traces.filter((t: any) => t.event_type === 'state_change').length, color: "text-yellow-400" },
              { label: "Asset_Actions", value: traces.filter((t: any) => t.event_type === 'action').length, color: "text-green-400" },
              { label: "Logic_Decisions", value: traces.filter((t: any) => t.event_type === 'decision').length, color: "text-magenta-400" }
            ].map((stat) => (
              <Card key={stat.label} className="bg-gray-900/40 border border-cyan-500/10 p-3 flex flex-col items-center justify-center transition-all hover:bg-cyan-500/5">
                <div className="text-cyan-900 font-mono text-[9px] mb-1 uppercase tracking-widest">{stat.label}</div>
                <div className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.05);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
