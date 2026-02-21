import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Radar, Shield, Zap } from 'lucide-react';
import VoiceControl from '@/components/VoiceControl';
import { getLoginUrl } from '@/const';

/**
 * Main Dashboard - Retro-futuristic TARS system interface
 * Displays system status, agent states, and real-time events
 */
export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [systemState, setSystemState] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Fetch initial system state
    const fetchSystemState = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/simulation/status');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch status');
        }
        const data = await response.json();
        setSystemState(data);
      } catch (error: any) {
        console.error('Error fetching system state:', error);
        setError(error.message || 'SYSTEM_BACKEND_OFFLINE');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSystemState();
    }
  }, [retryCount, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4 font-mono tracking-tighter">TARS SYSTEM</h1>
          <p className="text-cyan-400 mb-8 font-mono text-sm opacity-70">Terrorist Attack Response System</p>
          <Button
            variant="default"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono"
            onClick={() => window.location.href = getLoginUrl()}
          >
            INITIALIZE CONNECTION
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-white p-6 overflow-hidden flex flex-col">
      {/* Scanline effect background */}
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
            <h1 className="text-3xl font-bold text-white tracking-widest font-mono">
              TARS_COMMAND_CENTER
            </h1>
            {error && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/50 px-3 py-1 rounded animate-pulse">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-[10px] text-red-500 font-mono font-bold uppercase tracking-tighter">
                  CRITICAL: {error}
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
          <p className="text-cyan-400 text-xs font-mono opacity-80">
            Decentralized Multi-Agent Response System // SESSION: {user?.name?.toUpperCase() ?? "UNKNOWN"}
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
          {/* System Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Dome Status */}
            <Card className="bg-gray-900/50 border border-cyan-500/50 p-4 transition-all hover:border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.05)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cyan-400 font-mono text-[10px] tracking-widest">DOME_STATUS</h3>
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1 font-mono tracking-tighter">
                {systemState?.dome_active ? 'ACTIVE' : 'INACTIVE'}
              </div>
              <div className="text-[10px] text-cyan-900 font-mono">STRATEGIC DEFENSE SYSTEM</div>
            </Card>

            {/* Active Events */}
            <Card className="bg-gray-900/50 border border-magenta-500/50 p-4 transition-all hover:border-magenta-400 shadow-[0_0_15px_rgba(255,0,255,0.05)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-magenta-400 font-mono text-[10px] tracking-widest">ACTIVE_THREATS</h3>
                <AlertCircle className="w-4 h-4 text-magenta-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1 font-mono tracking-tighter">
                {systemState?.events_count || 0}
              </div>
              <div className="text-[10px] text-magenta-900 font-mono">REAL-TIME INCIDENT COUNT</div>
            </Card>

            {/* Missiles Tracked */}
            <Card className="bg-gray-900/50 border border-cyan-500/50 p-4 transition-all hover:border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.05)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cyan-400 font-mono text-[10px] tracking-widest">W_TRACKING</h3>
                <Radar className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1 font-mono tracking-tighter">
                {systemState?.missiles_count || 0}
              </div>
              <div className="text-[10px] text-cyan-900 font-mono">BALLISTIC TRAJECTORY MONITOR</div>
            </Card>

            {/* Deployments */}
            <Card className="bg-gray-900/50 border border-green-500/50 p-4 transition-all hover:border-green-400 shadow-[0_0_15px_rgba(0,255,0,0.05)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-green-400 font-mono text-[10px] tracking-widest">FORCE_DEPLOY</h3>
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1 font-mono tracking-tighter">
                {systemState?.deployments_count || 0}
              </div>
              <div className="text-[10px] text-green-900 font-mono">ACTIVE TACTICAL UNITS</div>
            </Card>
          </div>

          {/* Main Grid: Agents & Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Status Panel */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <span className="text-cyan-500">_</span>[AGENT_INFRASTRUCTURE]
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "SensorAgent-1", type: "sensor", state: "MONITORING" },
                  { name: "CoordinatorAgent-1", type: "coord", state: "IDLE" },
                  { name: "RescueAgent-1", type: "rescue", state: "IDLE" },
                  { name: "DomeDefenseAgent-1", type: "defense", state: "TRACKING" }
                ].map((agent) => (
                  <Card key={agent.name} className="bg-black/40 border border-cyan-500/20 p-3 hover:border-cyan-500/50 transition-colors">
                    <div className="font-mono text-cyan-400 text-[10px] mb-1">{agent.name}</div>
                    <div className="text-white text-xs font-mono mb-1">{agent.state}</div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] text-cyan-900 font-mono uppercase tracking-tighter">Heartbeat_OK</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Event Log */}
            <div className="space-y-4 flex flex-col h-full overflow-hidden">
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <span className="text-magenta-500">_</span>[CENTRAL_EVENT_STREAM]
              </h2>
              <Card className="bg-black/40 border border-magenta-500/20 p-4 flex-1 min-h-[160px]">
                <div className="font-mono text-[10px] space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-magenta-900 scrollbar-track-transparent">
                  <div className="text-green-500/70 opacity-80 flex gap-2">
                    <span className="shrink-0">[09:30:15]</span>
                    <span className="uppercase tracking-widest">Core initialization successful. All protocols established.</span>
                  </div>
                  <div className="text-cyan-500/70 opacity-80 flex gap-2">
                    <span className="shrink-0">[09:30:20]</span>
                    <span className="uppercase tracking-widest">Multi-agent mesh network connected. Synchronization active.</span>
                  </div>
                  <div className="text-yellow-500/70 opacity-80 flex gap-2">
                    <span className="shrink-0">[09:31:00]</span>
                    <span className="uppercase tracking-widest">Global sensor array monitoring triggered. Awaiting packet data.</span>
                  </div>
                  <div className="text-magenta-500/70 opacity-80 flex gap-2">
                    <span className="shrink-0">[09:31:30]</span>
                    <span className="uppercase tracking-widest">Voice interface secure handshake complete. Standby.</span>
                  </div>
                  <div className="text-gray-500/70 opacity-60 flex gap-2">
                    <span className="shrink-0">[09:31:45]</span>
                    <span className="uppercase tracking-widest italic tracking-tighter line-through decoration-cyan-900/50">Listening for encrypted threat signatures...</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Control Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <span className="text-yellow-500">_</span>[OVERRIDE_CONTROLS]
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button className="bg-cyan-950/20 border border-cyan-500/50 hover:bg-cyan-500/20 text-cyan-400 font-mono text-[10px] h-10 tracking-widest">
                  DOME_ACTIVATE
                </Button>
                <Button className="bg-green-950/20 border border-green-500/50 hover:bg-green-500/20 text-green-400 font-mono text-[10px] h-10 tracking-widest">
                  FORCE_DEPLOY
                </Button>
                <Button className="bg-red-950/20 border border-red-500/50 hover:bg-red-500/20 text-red-400 font-mono text-[10px] h-10 tracking-widest">
                  PRIORITY_ALERT
                </Button>
                <Button className="bg-yellow-950/20 border border-yellow-500/50 hover:bg-yellow-500/20 text-yellow-500 font-mono text-[10px] h-10 tracking-widest">
                  SIM_INJECT
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <span className="text-cyan-500">_</span>[NLP_INTERFACE]
              </h2>
              <Card className="bg-black/40 border border-cyan-500/20 p-4 h-[100px] flex items-center justify-center">
                <VoiceControl />
              </Card>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.1);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
