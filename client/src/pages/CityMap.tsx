import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Crosshair, Shield, Zap } from 'lucide-react';

/**
 * City Map - Interactive visualization of terrorist attack response
 * Shows events, troop deployments, dome coverage, and missile tracking
 */
export default function CityMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [missiles, setMissiles] = useState<any[]>([]);
  const [domeActive, setDomeActive] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statusRes, eventsRes] = await Promise.all([
          fetch('/api/simulation/status'),
          fetch('/api/events')
        ]);

        if (!statusRes.ok || !eventsRes.ok) {
          throw new Error('SYSTEM_OFFLINE');
        }

        const statusData = await statusRes.json();
        const eventsData = await eventsRes.json();

        setDomeActive(statusData.dome_active);
        setEvents(eventsData.events || []);
      } catch (err: any) {
        console.error('Error fetching map data:', err);
        setError('SYSTEM_BACKEND_OFFLINE');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [retryCount]);

  // Simulate canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw dome if active
    if (domeActive) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 200, 0, Math.PI * 2);
      ctx.stroke();

      // Dome segments
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const x = canvas.width / 2 + Math.cos(angle) * 200;
        const y = canvas.height / 2 + Math.sin(angle) * 200;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    // Draw events
    events.forEach((event) => {
      const x = (event.location.x % 1000) * (canvas.width / 1000);
      const y = (event.location.y % 1000) * (canvas.height / 1000);

      // Event marker
      const color = event.severity === 'critical' ? '#ff0000' :
        event.severity === 'high' ? '#ff6600' : '#ffff00';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Event glow
      ctx.strokeStyle = color + '80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw deployments
    deployments.forEach((deployment) => {
      const x = (deployment.location.x % 1000) * (canvas.width / 1000);
      const y = (deployment.location.y % 1000) * (canvas.height / 1000);

      // Deployment marker
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(x - 6, y - 6, 12, 12);

      // Deployment glow
      ctx.strokeStyle = '#00ff0080';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 12, y - 12, 24, 24);
    });

    // Draw missiles
    missiles.forEach((missile) => {
      const x = (missile.location.x % 1000) * (canvas.width / 1000);
      const y = (missile.location.y % 1000) * (canvas.height / 1000);

      if (missile.status === 'incoming') {
        // Missile marker
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Missile trail
        ctx.strokeStyle = '#ff00ff80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.stroke();
      } else if (missile.status === 'intercepted') {
        // Explosion effect
        ctx.fillStyle = '#ffff0080';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    });

  }, [events, deployments, missiles, domeActive]);

  const handleSimulateEvent = () => {
    const newEvent = {
      id: Math.random().toString(36),
      type: 'attack',
      location: {
        x: Math.random() * 1000,
        y: Math.random() * 1000
      },
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
      description: 'Simulated attack event'
    };
    setEvents([...events, newEvent]);
    setSelectedEvent(newEvent);
  };

  const handleDeployTroops = () => {
    if (!selectedEvent) return;
    const deployment = {
      id: Math.random().toString(36),
      location: selectedEvent.location,
      unit_size: 'standard',
      status: 'deploying'
    };
    setDeployments([...deployments, deployment]);
  };

  const handleSimulateMissile = () => {
    const missile = {
      id: Math.random().toString(36),
      location: {
        x: Math.random() * 1000,
        y: Math.random() * 1000
      },
      target: {
        x: 500,
        y: 500
      },
      status: 'incoming'
    };
    setMissiles([...missiles, missile]);

    // Auto-intercept after 2 seconds
    setTimeout(() => {
      setMissiles(prev => prev.map(m =>
        m.id === missile.id ? { ...m, status: 'intercepted' } : m
      ));
    }, 2000);
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
            <h1 className="text-3xl font-bold text-white tracking-widest font-mono">CITY_TACTICAL_MAP</h1>
            {error && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/50 px-3 py-1 rounded animate-pulse">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-[10px] text-red-500 font-mono font-bold uppercase tracking-tighter">
                  GRID_SYNC_ERROR: {error}
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
          <p className="text-cyan-400 text-xs font-mono opacity-80">Real-time threat visualization and response coordination // GRID_SYNC: {error ? 'LOST' : 'ACTIVE'}</p>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Canvas - Flexing to fill space */}
          <div className="lg:col-span-3 flex flex-col h-full min-h-0">
            <Card className="bg-gray-900/50 border border-cyan-500/50 p-4 flex-1 flex flex-col min-h-0 overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.05)]">
              <div className="flex-1 relative border border-cyan-400/30 overflow-hidden bg-black">
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={900}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-4 flex justify-between items-center text-[10px] text-cyan-900 font-mono tracking-tighter shrink-0 uppercase">
                <div>Grid_System: 1000x1000u // Dome_R: 200u</div>
                <div className="flex gap-4">
                  <span>Targets: {events.length}</span>
                  <span>Units: {deployments.length}</span>
                  <span>Projectiles: {missiles.length}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Control Panel - Scrolled internally if needed */}
          <div className="flex flex-col h-full min-h-0 gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
            {/* Dome Status */}
            <Card className="bg-gray-900/40 border border-cyan-500/30 p-4 shrink-0 transition-all hover:border-cyan-400/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-3 h-3 text-cyan-400" />
                <h3 className="font-mono text-cyan-400 text-[10px] tracking-widest uppercase">Shield_Status</h3>
              </div>
              <div className="text-xl font-bold text-white mb-3 font-mono">
                {domeActive ? 'ACTIVE' : 'OFFLINE'}
              </div>
              <Button
                onClick={() => setDomeActive(!domeActive)}
                className="w-full bg-cyan-950/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-400 font-mono text-[10px] h-8 tracking-widest uppercase"
              >
                {domeActive ? 'Deactivate' : 'Activate'}
              </Button>
            </Card>

            {/* Event Controls */}
            <Card className="bg-gray-900/40 border border-magenta-500/30 p-4 shrink-0 transition-all hover:border-magenta-400/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-3 h-3 text-magenta-400" />
                <h3 className="font-mono text-magenta-400 text-[10px] tracking-widest uppercase">Threat_Vector</h3>
              </div>
              <div className="text-[10px] text-white mb-3 font-mono bg-black/40 p-2 border border-magenta-500/10 min-h-[40px]">
                {selectedEvent ? (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between"><span>TYPE:</span> <span className="text-magenta-400">{selectedEvent.type.toUpperCase()}</span></div>
                    <div className="flex justify-between"><span>LVL:</span> <span className="text-magenta-400">{selectedEvent.severity.toUpperCase()}</span></div>
                    <div className="flex justify-between"><span>COORD:</span> <span className="text-magenta-400">[{selectedEvent.location.x.toFixed(0)}, {selectedEvent.location.y.toFixed(0)}]</span></div>
                  </div>
                ) : (
                  <div className="text-gray-600 italic uppercase tracking-tighter text-[9px] h-full flex items-center justify-center">No active selection</div>
                )}
              </div>
              <Button
                onClick={handleSimulateEvent}
                className="w-full bg-magenta-950/20 border border-magenta-500/50 hover:bg-magenta-500/30 text-magenta-400 font-mono text-[10px] h-8 tracking-widest uppercase"
              >
                Infect_Threat
              </Button>
            </Card>

            {/* Action Panel */}
            <Card className="bg-gray-900/40 border border-cyan-500/30 p-4 shrink-0 transition-all hover:border-cyan-400/50">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-3 h-3 text-green-400" />
                <h3 className="font-mono text-cyan-400 text-[10px] tracking-widest uppercase">Deployment</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={handleDeployTroops}
                  disabled={!selectedEvent}
                  className="w-full bg-green-950/20 border border-green-500/50 hover:bg-green-500/30 text-green-400 font-mono text-[10px] h-8 tracking-widest uppercase disabled:opacity-20"
                >
                  Deploy_Unit
                </Button>
                <Button
                  onClick={handleSimulateMissile}
                  className="w-full bg-red-950/20 border border-red-500/50 hover:bg-red-500/30 text-red-400 font-mono text-[10px] h-8 tracking-widest uppercase"
                >
                  Trig_Missile
                </Button>
              </div>
            </Card>

            {/* Legend - Compact */}
            <Card className="bg-gray-900/40 border border-cyan-500/10 p-3 mt-auto shadow-inner">
              <h3 className="font-mono text-cyan-800 text-[9px] tracking-widest mb-2 uppercase">Protocol_Legend</h3>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-1 text-[9px] font-mono tracking-tighter uppercase">
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
                  <span>Threat</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="w-1.5 h-1.5 bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                  <span>Unit</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="w-1.5 h-1.5 bg-magenta-500 rounded-full shadow-[0_0_5px_rgba(255,0,255,0.5)]"></div>
                  <span>Missile</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="w-1.5 h-1.5 border border-cyan-400"></div>
                  <span>Dome</span>
                </div>
              </div>
            </Card>
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
