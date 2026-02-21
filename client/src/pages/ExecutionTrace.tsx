import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter, Download } from 'lucide-react';

/**
 * Execution Trace Viewer - Shows detailed log of agent decisions and actions
 * Demonstrates system behavior and decision-making process
 */
export default function ExecutionTrace() {
  const [traces, setTraces] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null);

  // Sample trace data
  useEffect(() => {
    const sampleTraces = [
      {
        id: '1',
        timestamp: '2026-02-21T09:30:15Z',
        agent: 'SensorAgent-1',
        event_type: 'event_detected',
        from_state: 'MONITORING',
        to_state: 'ALERT_TRIGGERED',
        message: 'Terrorist attack detected in downtown district',
        details: {
          source: 'NewsAPI',
          severity: 'critical',
          location: { x: 450, y: 320 },
          confidence: 0.95
        }
      },
      {
        id: '2',
        timestamp: '2026-02-21T09:30:16Z',
        agent: 'CoordinatorAgent-1',
        event_type: 'state_change',
        from_state: 'IDLE',
        to_state: 'PROCESSING',
        message: 'Processing event: terrorist attack',
        details: {
          event_id: '1',
          analysis_time: 1200,
          threat_level: 'critical'
        }
      },
      {
        id: '3',
        timestamp: '2026-02-21T09:30:17Z',
        agent: 'CoordinatorAgent-1',
        event_type: 'decision',
        from_state: 'PROCESSING',
        to_state: 'ASSIGNING',
        message: 'Assigning tasks: deploy troops and activate dome',
        details: {
          tasks: ['deploy_troops', 'activate_dome'],
          priority: 'high'
        }
      },
      {
        id: '4',
        timestamp: '2026-02-21T09:30:18Z',
        agent: 'RescueAgent-1',
        event_type: 'action',
        from_state: 'IDLE',
        to_state: 'DEPLOYING',
        message: 'Deploying large unit to downtown district',
        details: {
          unit_size: 'large',
          location: { x: 450, y: 320 },
          deployment_time: 300
        }
      },
      {
        id: '5',
        timestamp: '2026-02-21T09:30:19Z',
        agent: 'DomeDefenseAgent-1',
        event_type: 'action',
        from_state: 'IDLE',
        to_state: 'TRACKING',
        message: 'Dome defense system activated',
        details: {
          coverage_radius: 200,
          interceptor_count: 12,
          status: 'online'
        }
      },
      {
        id: '6',
        timestamp: '2026-02-21T09:30:22Z',
        agent: 'DomeDefenseAgent-1',
        event_type: 'event',
        from_state: 'TRACKING',
        to_state: 'INTERCEPTING',
        message: 'Missile detected and tracked',
        details: {
          missile_id: 'M001',
          velocity: 850,
          eta: 45,
          target: { x: 500, y: 500 }
        }
      },
      {
        id: '7',
        timestamp: '2026-02-21T09:30:23Z',
        agent: 'DomeDefenseAgent-1',
        event_type: 'action',
        from_state: 'INTERCEPTING',
        to_state: 'TRACKING',
        message: 'Missile intercepted successfully',
        details: {
          missile_id: 'M001',
          interceptor_id: 'D003',
          interception_point: { x: 480, y: 510 },
          success_rate: 0.98
        }
      }
    ];

    setTraces(sampleTraces);
  }, []);

  const filteredTraces = traces.filter(trace => {
    if (filter === 'all') return true;
    return trace.agent === filter;
  });

  const agents = Array.from(new Set(traces.map(t => t.agent)));

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
    <div className="min-h-screen bg-black text-white p-8">
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
          animation: 'scanlines 8s linear infinite'
        }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b-2 border-cyan-500 pb-4">
          <h1 className="text-4xl font-bold text-white mb-2">EXECUTION TRACE</h1>
          <p className="text-cyan-400 text-sm">Detailed log of agent decisions, state transitions, and system actions</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-mono text-sm">Filter:</span>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-900 border border-cyan-400 text-white px-3 py-1 rounded font-mono text-sm"
          >
            <option value="all">All Agents</option>
            {agents && agents.map((agent: string) => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
          <Button className="ml-auto bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Trace Timeline */}
        <Card className="bg-gray-900 border-2 border-cyan-500 p-6">
          <div className="space-y-4">
            {filteredTraces && filteredTraces.map((trace: any, index: number) => (
              <div key={trace.id} className="relative">
                {/* Timeline connector */}
                {index < filteredTraces.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-cyan-400 to-transparent"></div>
                )}

                {/* Trace entry */}
                <div
                  className={`p-4 border rounded cursor-pointer transition-all ${getEventTypeBg(trace.event_type)} border-cyan-400 hover:border-cyan-300`}
                  onClick={() => setExpandedTrace(expandedTrace === trace.id ? null : trace.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-gray-400">
                            {new Date(trace.timestamp as string).toLocaleTimeString()}
                          </span>
                          <span className="font-mono text-xs font-bold text-cyan-400">
                            {trace.agent}
                          </span>
                          <span className={`font-mono text-xs font-bold ${getEventTypeColor(trace.event_type)}`}>
                            {trace.event_type.toUpperCase()}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-cyan-400 transition-transform ${
                            expandedTrace === trace.id ? 'rotate-180' : ''
                          }`}
                        />
                      </div>

                      <p className="text-white text-sm mb-2">{trace.message}</p>

                      {/* State transition */}
                      {trace.from_state && trace.to_state && (
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-2">
                          <span className="text-yellow-400">{trace.from_state}</span>
                          <span>→</span>
                          <span className="text-green-400">{trace.to_state}</span>
                        </div>
                      )}

                      {/* Expanded details */}
                      {expandedTrace === trace.id && trace.details && (
                        <div className="mt-4 p-3 bg-black bg-opacity-50 rounded border border-cyan-400 border-opacity-50">
                          <div className="font-mono text-xs text-gray-400 space-y-1">
                            {Object.entries(trace.details as Record<string, any>).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-cyan-400">{key}:</span>
                                <span className="text-white">
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

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border border-cyan-500 p-4">
            <div className="text-cyan-400 font-mono text-xs mb-2">Total Events</div>
            <div className="text-2xl font-bold text-white">{traces.length}</div>
          </Card>
          <Card className="bg-gray-900 border border-cyan-500 p-4">
            <div className="text-cyan-400 font-mono text-xs mb-2">State Changes</div>
            <div className="text-2xl font-bold text-white">
              {traces && traces.filter((t: any) => t.event_type === 'state_change').length}
            </div>
          </Card>
          <Card className="bg-gray-900 border border-cyan-500 p-4">
            <div className="text-cyan-400 font-mono text-xs mb-2">Actions Taken</div>
            <div className="text-2xl font-bold text-white">
              {traces && traces.filter((t: any) => t.event_type === 'action').length}
            </div>
          </Card>
          <Card className="bg-gray-900 border border-cyan-500 p-4">
            <div className="text-cyan-400 font-mono text-xs mb-2">Decisions Made</div>
            <div className="text-2xl font-bold text-white">
              {traces && traces.filter((t: any) => t.event_type === 'decision').length}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }
      `}</style>
    </div>
  );
}
