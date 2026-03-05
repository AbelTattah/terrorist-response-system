import React, { useState, useEffect, useRef, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle, AlertCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Interceptor {
  id: string;
  x: number;
  y: number;
  target_id: string;
}

interface Missile {
  id: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  status: 'incoming' | 'intercepted' | 'destroyed' | 'missed';
  status_changed_at: number;
  trail: [number, number][];
}

/**
 * HeartbeatPulse - Isolated sub-component for performance.
 * Only re-renders its small self on packet arrival.
 */
const HeartbeatPulse = memo(({ socket }: { socket: Socket | null }) => {
  const [lastUpdate, setLastUpdate] = useState(0);

  useEffect(() => {
    if (!socket) return;
    const handler = () => setLastUpdate(Date.now());
    socket.on('missile_physics_update', handler);
    return () => { socket.off('missile_physics_update', handler); };
  }, [socket]);

  const active = Date.now() - lastUpdate < 300;
  return (
    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${active ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'bg-red-500/50'}`}
      title="Telemetry Pulse Indicator" />
  );
});

/**
 * TelemetryDisplay - Isolated sub-component for performance.
 * Only re-renders the stats area, preventing whole-page re-renders.
 */
const TelemetryDisplay = memo(({ socket }: { socket: Socket | null }) => {
  const [stats, setStats] = useState({ incoming: 0, intercepted: 0, destroyed: 0, successRate: 0 });

  useEffect(() => {
    if (!socket) return;
    const handler = (data: any) => {
      const { incoming, intercepted, missed } = data.stats;
      setStats({
        incoming,
        intercepted,
        destroyed: missed,
        successRate: Math.round((intercepted / (intercepted + missed || 1)) * 100)
      });
    };
    socket.on('missile_physics_update', handler);
    return () => { socket.off('missile_physics_update', handler); };
  }, [socket]);

  return (
    <div className="space-y-2 font-mono text-[10px] uppercase tracking-tighter">
      <div className="flex justify-between border-b border-white/5 pb-1">
        <span className="text-gray-600">Incoming:</span>
        <span className="text-red-600 font-bold">{stats.incoming}</span>
      </div>
      <div className="flex justify-between border-b border-white/5 pb-1">
        <span className="text-gray-600">Neutralized:</span>
        <span className="text-green-600 font-bold">{stats.intercepted}</span>
      </div>
      <div className="flex justify-between border-b border-white/5 pb-1">
        <span className="text-gray-600">Struck_At:</span>
        <span className="text-orange-600 font-bold">{stats.destroyed}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Clearance:</span>
        <span className="text-cyan-600 font-bold">{stats.successRate}%</span>
      </div>
    </div>
  );
});

/**
 * MissileDefense Simulation - Animated dome defense system
 * Optimized to use Refs for 60fps canvas data and isolated components for UI.
 */
export default function MissileDefense() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const missileDataRef = useRef<Missile[]>([]);
  const interceptorDataRef = useRef<Interceptor[]>([]);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  const [domeActive, setDomeActive] = useState(false);
  const [arena, setArena] = useState({ w: 800, h: 600, dome_cx: 400, dome_cy: 500, dome_r: 130 });
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [objectCounts, setObjectCounts] = useState({ missiles: 0, interceptors: 0 });

  // Socket connection and high-frequency update ref-filling
  useEffect(() => {
    missileDataRef.current = [];
    interceptorDataRef.current = [];

    const socket: Socket = io('http://127.0.0.1:5000', {
      reconnectionAttempts: 5,
      timeout: 10000
    });
    setSocketInstance(socket);

    socket.on('connect', () => {
      console.log('MissileSim: Connected to physics backend');
      setError(null);
    });

    socket.on('missile_physics_update', (data: any) => {
      missileDataRef.current = data.missiles;
      interceptorDataRef.current = data.interceptors;

      // Update counts less frequently or just accept the small re-render cost for labels
      setObjectCounts({
        missiles: data.missiles.length,
        interceptors: data.interceptors.length
      });

      if (data.arena && (data.arena.w !== arena.w || data.arena.dome_cx !== arena.dome_cx)) {
        setArena(data.arena);
      }
      if (data.dome_active !== domeActive) {
        setDomeActive(data.dome_active);
      }
    });

    socket.on('disconnect', () => {
      console.warn('MissileSim: Disconnected');
      setError('PHYSICS_LINK_BROKEN');
    });

    return () => {
      socket.disconnect();
      setSocketInstance(null);
    };
  }, [retryCount]);

  // REST health check
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/simulation/status');
        const data = await response.json();
        setDomeActive(data.dome_active);
      } catch (err: any) {
        setError('DEFENSE_LINK_FAILURE');
      }
    };
    checkStatus();
  }, [retryCount]);

  const animationRef = useRef<number | null>(null);

  // Animation loop (Reads from Refs, renders to Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (): void => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
      for (let i = 0; i < canvas.height; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }

      const scaleX = canvas.width / arena.w;
      const scaleY = canvas.height / arena.h;
      const centerX = arena.dome_cx * scaleX;
      const centerY = arena.dome_cy * scaleY;
      const domeRadius = arena.dome_r * Math.min(scaleX, scaleY);

      if (domeActive) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(centerX, centerY, domeRadius, 0, Math.PI * 2); ctx.stroke();

        const pulse = Math.sin(Date.now() / 500) * 8;
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 + pulse / 100})`;
        ctx.beginPath(); ctx.arc(centerX, centerY, domeRadius + pulse, 0, Math.PI * 2); ctx.stroke();
      }

      // Draw missiles from Ref
      const currentMissiles = missileDataRef.current;
      currentMissiles.forEach((m) => {
        const x = m.x * scaleX;
        const y = m.y * scaleY;

        if (m.status === 'incoming') {
          ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
          ctx.lineWidth = 2;
          if (m.trail?.length > 1) {
            ctx.beginPath();
            ctx.moveTo(m.trail[0][0] * scaleX, m.trail[0][1] * scaleY);
            m.trail.forEach(p => ctx.lineTo(p[0] * scaleX, p[1] * scaleY));
            ctx.lineTo(x, y);
            ctx.stroke();
          }
          const angle = Math.atan2((m.ty - m.y) * scaleY, (m.tx - m.x) * scaleX);
          ctx.fillStyle = '#ff00ff';
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * 8, y + Math.sin(angle) * 8);
          ctx.lineTo(x + Math.cos(angle + 2.5) * 6, y + Math.sin(angle + 2.5) * 6);
          ctx.lineTo(x + Math.cos(angle - 2.5) * 6, y + Math.sin(angle - 2.5) * 6);
          ctx.fill();
        } else {
          const elapsed = (Date.now() / 1000) - m.status_changed_at;
          const progress = Math.max(0, Math.min(1, elapsed / 1.5));
          const rad = (m.status === 'missed' ? 25 : 20) * (1 + progress * 2);
          const op = 1 - progress;
          ctx.fillStyle = m.status === 'missed' ? `rgba(255, 50, 0, ${op * 0.8})` : `rgba(255, 255, 0, ${op * 0.8})`;
          ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
        }
      });

      // Draw interceptors from Ref
      const currentInterceptors = interceptorDataRef.current;
      currentInterceptors.forEach((ic) => {
        const ix = ic.x * scaleX;
        const iy = ic.y * scaleY;
        ctx.fillStyle = '#00ff00';
        ctx.beginPath(); ctx.arc(ix, iy, 3, 0, Math.PI * 2); ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate) as unknown as number;
    };

    animate();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [domeActive, arena]);

  const [launchCount, setLaunchCount] = useState(1);

  const handleLaunchMissile = async () => {
    try {
      setLoading(true);
      await fetch('/api/commands/simulate-missile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: launchCount })
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleActivateDome = async () => {
    const newState = !domeActive;
    try {
      setLoading(true);
      await fetch('/api/commands/activate-dome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newState })
      });
      setDomeActive(newState);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="h-full bg-black text-white p-6 overflow-hidden flex flex-col">
      <div className="relative z-10 flex flex-col h-full gap-6">
        <div className="border-b-2 border-cyan-500 pb-4 flex flex-col gap-1 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white tracking-widest font-mono uppercase">Missile_Defense_Sim</h1>
            <div className="flex items-center gap-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/50 px-3 py-1 rounded animate-pulse">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-[10px] text-red-500 font-mono font-bold uppercase tracking-tighter">LINK_LOST: {error}</span>
                  <Button variant="ghost" size="sm" className="h-5 px-2 text-[8px] bg-red-500/10 text-red-400 font-mono" onClick={() => { setRetryCount(c => c + 1); setError(null); }}>RE-SYNC</Button>
                </div>
              )}
              <HeartbeatPulse socket={socketInstance} />
            </div>
          </div>
          <p className="text-cyan-400 text-xs font-mono opacity-80 uppercase tracking-widest leading-none">Automated Threat Mitigation System // PNL_STABLE: 0x88f2</p>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 flex flex-col h-full min-h-0">
            <Card className="bg-gray-900/50 border border-cyan-500/50 p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 relative border border-cyan-400/30 overflow-hidden bg-black rounded-sm">
                <canvas ref={canvasRef} width={1200} height={900} className="w-full h-full object-contain" />
              </div>
              <div className="mt-4 flex justify-between items-center text-[10px] text-cyan-900 font-mono uppercase">
                <div>Nodes: {objectCounts.missiles} // Interceptors: {objectCounts.interceptors}</div>
                <div>Logic_Buffer: 0xFFA2</div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col h-full gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900">
            <Card className="bg-gray-900/40 border border-cyan-500/30 p-4 shrink-0 transition-all hover:border-cyan-400/50 shadow-[0_0_10px_rgba(0,255,255,0.05)]">
              <div className="flex items-center gap-2 mb-2">
                <Zap className={`w-3 h-3 ${domeActive ? 'text-cyan-400' : 'text-gray-600'}`} />
                <h3 className="font-mono text-cyan-400 text-[10px] tracking-widest uppercase">Atmospheric_Shield</h3>
              </div>
              <div className="text-xl font-bold text-white mb-3 font-mono tracking-widest truncate">{domeActive ? 'ACTIVE' : 'OFFLINE'}</div>
              <Button onClick={handleActivateDome} className={`w-full font-mono text-[10px] h-8 uppercase border ${domeActive ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'}`}>{domeActive ? 'Kill_Power' : 'Energize'}</Button>
            </Card>

            <Card className="bg-gray-900/40 border border-magenta-500/30 p-4 shrink-0 transition-all hover:border-magenta-400/50 shadow-[0_0_10px_rgba(255,0,255,0.05)]">
              <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-3 h-3 text-magenta-400" /><h3 className="font-mono text-magenta-400 text-[10px] tracking-widest uppercase">Inject_Threat</h3></div>
              <div className="flex gap-1 mb-3">{[1, 3, 5, 8].map(n => <button key={n} onClick={() => setLaunchCount(n)} className={`flex-1 font-mono text-[9px] py-1 border transition-all ${launchCount === n ? 'bg-magenta-500/30 border-magenta-400 text-magenta-200' : 'border-magenta-500/20 text-magenta-500/50 hover:border-magenta-400/40'}`}>{n}x</button>)}</div>
              <Button onClick={handleLaunchMissile} className="w-full border border-magenta-500/50 text-magenta-400 font-mono text-[10px] h-8 uppercase hover:bg-magenta-500/10 tracking-widest">Trig_Launch</Button>
            </Card>

            <Card className="bg-gray-900/40 border border-cyan-500/10 p-4 shrink-0">
              <h3 className="font-mono text-cyan-800 text-[10px] tracking-widest mb-4 uppercase">Telemetry_Buffer</h3>
              <TelemetryDisplay socket={socketInstance} />
            </Card>

            <Card className="bg-gray-900/40 border border-cyan-500/10 p-3 mt-auto shadow-inner">
              <h3 className="font-mono text-cyan-800 text-[9px] tracking-widest mb-2 uppercase">Symbol_Cipher</h3>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-1 text-[9px] font-mono tracking-tighter uppercase opacity-60">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-magenta-500 rounded-full"></div><span>Projectile</span></div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div><span>Interceptor</span></div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 border border-cyan-400"></div><span>Dome</span></div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div><span>Kinetic</span></div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0, 255, 255, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}
