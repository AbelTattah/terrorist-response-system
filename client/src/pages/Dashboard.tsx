import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Radar, Shield, Zap } from 'lucide-react';
import VoiceControl from '@/components/VoiceControl';

/**
 * Main Dashboard - Retro-futuristic TARS system interface
 * Displays system status, agent states, and real-time events
 */
export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [systemState, setSystemState] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial system state
    const fetchSystemState = async () => {
      try {
        const response = await fetch('/api/simulation/status');
        const data = await response.json();
        setSystemState(data);
      } catch (error) {
        console.error('Error fetching system state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemState();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">TARS SYSTEM</h1>
          <p className="text-cyan-400 mb-8">Terrorist Attack Response System</p>
          <Button variant="default">Login to Access</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Scanline effect background */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
          animation: 'scanlines 8s linear infinite'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b-2 border-cyan-500 pb-6">
          <h1 className="text-5xl font-bold text-white mb-2">
            TARS COMMAND CENTER
          </h1>
          <p className="text-cyan-400 text-lg">
            Decentralized Multi-Agent Response System
          </p>
        </div>

        {/* System Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Dome Status */}
          <Card className="bg-gray-900 border-2 border-cyan-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyan-400 font-mono text-sm">DOME STATUS</h3>
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {systemState?.dome_active ? 'ACTIVE' : 'INACTIVE'}
            </div>
            <div className="text-xs text-gray-400">Defense System</div>
          </Card>

          {/* Active Events */}
          <Card className="bg-gray-900 border-2 border-magenta-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-magenta-400 font-mono text-sm">EVENTS</h3>
              <AlertCircle className="w-6 h-6 text-magenta-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {systemState?.events_count || 0}
            </div>
            <div className="text-xs text-gray-400">Active Incidents</div>
          </Card>

          {/* Missiles Tracked */}
          <Card className="bg-gray-900 border-2 border-cyan-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyan-400 font-mono text-sm">MISSILES</h3>
              <Radar className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {systemState?.missiles_count || 0}
            </div>
            <div className="text-xs text-gray-400">Tracked Targets</div>
          </Card>

          {/* Deployments */}
          <Card className="bg-gray-900 border-2 border-green-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-400 font-mono text-sm">TROOPS</h3>
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {systemState?.deployments_count || 0}
            </div>
            <div className="text-xs text-gray-400">Units Deployed</div>
          </Card>
        </div>

        {/* Agent Status Panel */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 font-mono">
            [AGENT_STATUS_PANEL]
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent cards would go here */}
            <Card className="bg-gray-900 border border-cyan-500 p-4">
              <div className="font-mono text-cyan-400 text-sm mb-2">SensorAgent-1</div>
              <div className="text-white mb-2">State: MONITORING</div>
              <div className="text-xs text-gray-400">Status: Active</div>
            </Card>
            <Card className="bg-gray-900 border border-cyan-500 p-4">
              <div className="font-mono text-cyan-400 text-sm mb-2">CoordinatorAgent-1</div>
              <div className="text-white mb-2">State: IDLE</div>
              <div className="text-xs text-gray-400">Status: Active</div>
            </Card>
            <Card className="bg-gray-900 border border-cyan-500 p-4">
              <div className="font-mono text-cyan-400 text-sm mb-2">RescueAgent-1</div>
              <div className="text-white mb-2">State: IDLE</div>
              <div className="text-xs text-gray-400">Status: Active</div>
            </Card>
            <Card className="bg-gray-900 border border-cyan-500 p-4">
              <div className="font-mono text-cyan-400 text-sm mb-2">DomeDefenseAgent-1</div>
              <div className="text-white mb-2">State: TRACKING</div>
              <div className="text-xs text-gray-400">Status: Active</div>
            </Card>
          </div>
        </div>

        {/* Control Panel */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 font-mono">
            [COMMAND_CONTROLS]
          </h2>
          <div className="flex gap-4 flex-wrap mb-6">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono">
              Activate Dome
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-mono">
              Deploy Troops
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white font-mono">
              Emergency Alert
            </Button>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white font-mono">
              Simulate Event
            </Button>
          </div>
          <Card className="bg-gray-900 border border-cyan-500 p-4">
            <h3 className="font-mono text-cyan-400 text-sm mb-4">VOICE INTERFACE</h3>
            <VoiceControl />
          </Card>
        </div>

        {/* Recent Events Log */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 font-mono">
            [EVENT_LOG]
          </h2>
          <Card className="bg-gray-900 border border-cyan-500 p-4">
            <div className="font-mono text-xs space-y-2 max-h-64 overflow-y-auto">
              <div className="text-green-400">[2026-02-21 09:30:15] System initialized</div>
              <div className="text-cyan-400">[2026-02-21 09:30:20] All agents online</div>
              <div className="text-yellow-400">[2026-02-21 09:31:00] Sensor monitoring active</div>
              <div className="text-cyan-400">[2026-02-21 09:31:30] Voice interface activated</div>
              <div className="text-gray-400">[2026-02-21 09:31:45] Awaiting events...</div>
            </div>
          </Card>
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
      `}</style>
    </div>
  );
}
