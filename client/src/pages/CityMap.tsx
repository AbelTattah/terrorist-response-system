import React, { useState, useEffect, useRef, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield, Zap, Target, Activity } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

// Constants for mapping physics to canvas
const PHYS_W = 800; // Physics coordinate width
const PHYS_H = 600; // Physics coordinate height

/**
 * High-performance Tactical Map
 * Uses Ref-based rendering and 60fps animation loop to ensure fluidity
 */
export default function CityMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for high-frequency data (prevents React re-renders)
  const telemetryRef = useRef<any>({
    missiles: [],
    interceptors: [],
    deployments: [],
    arena: { w: PHYS_W, h: PHYS_H, dome_cx: 400, dome_cy: 500, dome_r: 130 },
    dome_active: true
  });

  // Static state for UI elements (severity, names, etc)
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // 1. Initial Data Fetch & Socket Setup
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('BACKEND_OFFLINE');
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        setError('SYNC_LOST');
      }
    };

    fetchData();

    // Connect socket for real-time telemetry
    socketRef.current = io(window.location.origin, {
      transports: ['websocket'],
      reconnectionAttempts: 5
    });

    socketRef.current.on('missile_physics_update', (data) => {
      telemetryRef.current = data;
    });

    socketRef.current.on('event_created', (event) => {
      setEvents(prev => [...prev, event]);
    });

    socketRef.current.on('connect_error', () => {
      setError('CONNECTION_ERROR');
    });

    socketRef.current.on('connect', () => {
      setError(null);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // 2. Animation Loop (60FPS)
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const { missiles, interceptors, deployments, arena, dome_active } = telemetryRef.current;
      const time = Date.now();

      // Clear & Background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scale calculations
      const scaleX = canvas.width / arena.w;
      const scaleY = canvas.height / arena.h;

      // Draw Grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Draw Dome
      if (dome_active) {
        const cx = arena.dome_cx * scaleX;
        const cy = arena.dome_cy * scaleY;
        const r = arena.dome_r * scaleX;

        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Scan pulse in dome
        const pulse = (time % 2000) / 2000;
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 * (1 - pulse)})`;
        ctx.beginPath();
        ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Events (Static locations from state, but animated visuals)
      events.forEach(event => {
        const x = event.location.x * scaleX;
        const y = event.location.y * scaleY;
        const isSelected = selectedEvent?.id === event.id;

        // Rhythmic Threat Pulse
        const pulseSize = 8 + Math.sin(time / 200) * 3;
        const severityColor = event.severity === 'critical' ? '#ff0000' :
          event.severity === 'high' ? '#ff6600' : '#ffff00';

        ctx.shadowBlur = isSelected ? 20 : 10;
        ctx.shadowColor = severityColor;
        ctx.fillStyle = severityColor;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Outer glow
        ctx.strokeStyle = `${severityColor}40`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize + 4, 0, Math.PI * 2);
        ctx.stroke();

        if (isSelected) {
          ctx.setLineDash([2, 4]);
          ctx.strokeStyle = '#00ffff';
          ctx.beginPath();
          ctx.arc(x, y, 25, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw Troop Deployments (Fluid Movement from Physics)
      deployments.forEach((d: any) => {
        const x = d.x * scaleX;
        const y = d.y * scaleY;
        const arrived = d.status === 'arrived';

        // Unit Square
        ctx.fillStyle = arrived ? '#00ff00' : '#00ffff';
        ctx.fillRect(x - 5, y - 5, 10, 10);

        // Pulse if arrived
        if (arrived) {
          const p = (time % 1000) / 1000;
          ctx.strokeStyle = `rgba(0, 255, 0, ${1 - p})`;
          ctx.strokeRect(x - 5 - p * 10, y - 5 - p * 10, 10 + p * 20, 10 + p * 20);
        } else {
          // Movement trail
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.moveTo(arena.dome_cx * scaleX, arena.dome_cy * scaleY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText(d.unit_size.toUpperCase(), x + 8, y + 4);
      });

      // Draw Missiles (Reuse fluid logic)
      missiles.forEach((m: any) => {
        const x = m.x * scaleX;
        const y = m.y * scaleY;

        if (m.status === 'incoming') {
          // Trail
          if (m.trail && m.trail.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 0, 255, 0.4)';
            ctx.lineWidth = 2;
            m.trail.forEach((p: any, i: number) => {
              if (i === 0) ctx.moveTo(p[0] * scaleX, p[1] * scaleY);
              else ctx.lineTo(p[0] * scaleX, p[1] * scaleY);
            });
            ctx.stroke();
          }

          // Missile Head
          ctx.fillStyle = '#ff00ff';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (m.status === 'intercepted') {
          const dt = (time / 1000) - m.status_changed_at;
          if (dt < 1.0) {
            const p = dt / 1.0;
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - p})`;
            ctx.beginPath();
            ctx.arc(x, y, p * 40, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [events, selectedEvent]);

  // Handlers
  const handleSimulateEvent = async () => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'attack',
        location: { x: Math.random() * 700 + 50, y: Math.random() * 400 + 50 },
        severity: ['low', 'high', 'critical'][Math.floor(Math.random() * 3)],
        description: 'Simulated tactical threat'
      })
    });
    const data = await res.json();
    setSelectedEvent(data);
  };

  const handleDeployTroops = async () => {
    if (!selectedEvent) return;
    await fetch('/api/commands/deploy-troops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: selectedEvent.location,
        unit_size: selectedEvent.severity === 'critical' ? 'heavy' : 'standard'
      })
    });
  };

  const handleSimulateMissile = async () => {
    await fetch('/api/commands/simulate-missile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 1 })
    });
  };

  return (
    <div className="h-full bg-black text-white p-6 overflow-hidden flex flex-col font-mono" ref={containerRef}>
      {/* Tactical Overlays */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,1)_2px,rgba(0,255,255,1)_4px)]" />
      </div>

      <header className="border-b border-cyan-500/30 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-cyan-400">CITY_TACTICAL_GRID_v4.0</h1>
          <p className="text-[10px] text-cyan-800 uppercase tracking-widest mt-1">
            Real-time multi-agent response coordination // 60FPS_SYNC: OK
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-500 animate-pulse text-xs bg-red-500/10 px-3 py-1 border border-red-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>LINK_FAILURE: {error}</span>
          </div>
        )}
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left: Map Area */}
        <Card className="col-span-12 lg:col-span-9 bg-gray-900/20 border-cyan-500/30 relative flex flex-col p-2 overflow-hidden">
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
            <span className="text-[8px] text-cyan-500">LIVE_TRACKING</span>
          </div>

          <div className="flex-1 bg-black border border-cyan-500/10 relative">
            <canvas
              ref={canvasRef}
              width={1600}
              height={1200}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="p-2 flex justify-between text-[8px] text-cyan-900 uppercase">
            <span>Coordinates: PHYS_800x600</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><Target className="w-2 h-2" /> Threads: {events.length}</span>
              <span className="flex items-center gap-1"><Activity className="w-2 h-2" /> Units: {telemetryRef.current.deployments.length}</span>
            </div>
          </div>
        </Card>

        {/* Right: Controls & Data */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <Card className="bg-gray-900/40 border-cyan-500/20 p-4">
            <h3 className="text-[10px] text-cyan-500 font-bold mb-4 flex items-center gap-2">
              <Zap className="w-3 h-3" /> SIMULATION_CONTROLS
            </h3>
            <div className="space-y-2">
              <Button
                onClick={handleSimulateEvent}
                className="w-full h-8 text-[10px] bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400"
              >
                INFECT_THREAT
              </Button>
              <Button
                onClick={handleDeployTroops}
                disabled={!selectedEvent}
                className="w-full h-8 text-[10px] bg-green-950/40 border border-green-500/30 hover:bg-green-500/20 text-green-400 disabled:opacity-20"
              >
                DEPLOY_UNIT
              </Button>
              <Button
                onClick={handleSimulateMissile}
                className="w-full h-8 text-[10px] bg-magenta-950/40 border border-magenta-500/30 hover:bg-magenta-500/20 text-magenta-400"
              >
                TRIG_MISSILE
              </Button>
            </div>
          </Card>

          <Card className="flex-1 bg-gray-900/40 border-cyan-500/20 p-4 flex flex-col min-h-0">
            <h3 className="text-[10px] text-cyan-500 font-bold mb-4">ACTIVE_THREATS</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
              {events.length === 0 ? (
                <div className="text-[9px] text-gray-700 italic text-center py-8">NO_ACTIVE_THREATS</div>
              ) : (
                events.map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`p-2 border cursor-pointer transition-all ${selectedEvent?.id === event.id ? 'bg-cyan-500/10 border-cyan-500' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[10px] font-bold ${event.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}>
                        {event.severity.toUpperCase()}
                      </span>
                      <span className="text-[8px] text-gray-600">ID: {event.id.slice(0, 8)}</span>
                    </div>
                    <div className="text-[9px] text-gray-400">Position: [{event.location.x.toFixed(0)}, {event.location.y.toFixed(0)}]</div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="bg-gray-900/40 border-cyan-500/10 p-3">
            <div className="grid grid-cols-2 gap-2 text-[8px] text-cyan-900">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> THREAT
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500" /> UNIT
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-magenta-500" /> PROJECTILE
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full border border-cyan-500" /> DOME
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
