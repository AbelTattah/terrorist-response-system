import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle, AlertCircle } from 'lucide-react';

interface Missile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  status: 'incoming' | 'intercepted' | 'destroyed';
}

interface Interceptor {
  id: string;
  x: number;
  y: number;
  targetMissileId: string;
  progress: number;
}

/**
 * Missile Defense Simulation - Animated dome defense system
 * Shows real-time missile tracking and interception
 */
export default function MissileDefense() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [missiles, setMissiles] = useState<Missile[]>([]);
  const [interceptors, setInterceptors] = useState<Interceptor[]>([]);
  const [domeActive, setDomeActive] = useState(false);
  const [stats, setStats] = useState({
    incoming: 0,
    intercepted: 0,
    destroyed: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Check backend status
  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/simulation/status');
        if (!response.ok) throw new Error('BACKEND_OFFLINE');

        const data = await response.json();
        setDomeActive(data.dome_active);
      } catch (err: any) {
        console.error('Error fetching defense status:', err);
        setError('DEFENSE_LINK_FAILURE');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [retryCount]);

  const animationRef = useRef<number | null>(null);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (): void => {
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const domeRadius = 150;

      // Draw dome
      if (domeActive) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, domeRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Dome segments
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 / 12) * i;
          const x = centerX + Math.cos(angle) * domeRadius;
          const y = centerY + Math.sin(angle) * domeRadius;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // Pulsing dome effect
        const pulse = Math.sin(Date.now() / 500) * 10;
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 + pulse / 100})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, domeRadius + pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw missiles
      missiles.forEach((missile) => {
        const x = missile.x + (missile.targetX - missile.x) * missile.progress;
        const y = missile.y + (missile.targetY - missile.y) * missile.progress;

        if (missile.status === 'incoming') {
          // Missile body
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

          // Direction indicator
          const angle = Math.atan2(missile.targetY - missile.y, missile.targetX - missile.x);
          ctx.strokeStyle = '#ff00ff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * 20, y + Math.sin(angle) * 20);
          ctx.stroke();
        } else if (missile.status === 'intercepted') {
          // Explosion effect
          ctx.fillStyle = `rgba(255, 255, 0, ${0.5 - missile.progress * 0.5})`;
          ctx.beginPath();
          ctx.arc(x, y, 20 + missile.progress * 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 165, 0, ${0.5 - missile.progress * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 30 + missile.progress * 15, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Draw interceptors
      interceptors.forEach((interceptor) => {
        // Interceptor body
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(interceptor.x, interceptor.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Interceptor trail
        ctx.strokeStyle = '#00ff0080';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(interceptor.x, interceptor.y, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Target line
        const targetMissile = missiles.find(m => m.id === interceptor.targetMissileId);
        if (targetMissile) {
          const targetX = targetMissile.x + (targetMissile.targetX - targetMissile.x) * targetMissile.progress;
          const targetY = targetMissile.y + (targetMissile.targetY - targetMissile.y) * targetMissile.progress;

          ctx.strokeStyle = '#00ff0080';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(interceptor.x, interceptor.y);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw center point
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate) as unknown as number;
    };

    animate();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [missiles, interceptors, domeActive]);

  // Update missile and interceptor positions
  useEffect(() => {
    const interval = setInterval(() => {
      setMissiles(prev => {
        const updated = prev.map(m => ({
          ...m,
          progress: m.progress + 0.02
        })).filter(m => {
          if (m.progress >= 1) {
            if (m.status === 'incoming' && domeActive) {
              // Check if within dome
              const centerX = 400;
              const centerY = 300;
              const distance = Math.sqrt(
                Math.pow(m.targetX - centerX, 2) + Math.pow(m.targetY - centerY, 2)
              );
              if (distance < 150) {
                return false; // Intercepted
              }
            }
            return m.progress < 1.5; // Remove after explosion
          }
          return true;
        });

        return updated;
      });

      setInterceptors(prev => {
        return prev.map(i => ({
          ...i,
          progress: i.progress + 0.03
        })).filter(i => i.progress < 1);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [domeActive]);

  const handleLaunchMissile = () => {
    const newMissile: Missile = {
      id: Math.random().toString(36),
      x: Math.random() * 400,
      y: 0,
      targetX: 200 + Math.random() * 400,
      targetY: 600,
      progress: 0,
      status: 'incoming'
    };
    setMissiles(prev => [...prev, newMissile]);

    // Update stats
    setStats(prev => ({
      ...prev,
      incoming: prev.incoming + 1
    }));
  };

  const handleActivateDome = () => {
    setDomeActive(!domeActive);
    if (!domeActive) {
      // Launch interceptors for existing missiles
      missiles.forEach(missile => {
        if (missile.status === 'incoming') {
          const newInterceptor: Interceptor = {
            id: Math.random().toString(36),
            x: 400,
            y: 300,
            targetMissileId: missile.id,
            progress: 0
          };
          setInterceptors(prev => [...prev, newInterceptor]);
        }
      });
    }
  };

  const handleInterceptMissile = () => {
    const incomingMissile = missiles.find(m => m.status === 'incoming');
    if (incomingMissile) {
      setMissiles(prev => prev.map(m =>
        m.id === incomingMissile.id ? { ...m, status: 'intercepted' } : m
      ));
      setStats(prev => ({
        ...prev,
        intercepted: prev.intercepted + 1,
        successRate: Math.round((prev.intercepted + 1) / (prev.incoming) * 100)
      }));
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
            <h1 className="text-3xl font-bold text-white tracking-widest font-mono uppercase">Missile_Defense_Sim</h1>
            {error && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/50 px-3 py-1 rounded animate-pulse">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-[10px] text-red-500 font-mono font-bold uppercase tracking-tighter">
                  DEFENSE_SYNC_LOST: {error}
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
          <p className="text-cyan-400 text-xs font-mono opacity-80 uppercase">Automated threat interception and kinetic countermeasure simulation // STATUS: {error ? 'SYNCHRONIZATION_REQUIRED' : 'LOCKED'}</p>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Simulation Viewport */}
          <div className="lg:col-span-3 flex flex-col h-full min-h-0">
            <Card className="bg-gray-900/50 border border-cyan-500/50 p-4 flex-1 flex flex-col min-h-0 overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.05)]">
              <div className="flex-1 relative border border-cyan-400/30 overflow-hidden bg-black rounded-sm">
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={900}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-4 flex justify-between items-center text-[10px] text-cyan-900 font-mono tracking-tighter shrink-0 uppercase">
                <div>Trajectory_Nodes: {missiles.length} // Interceptors: {interceptors.length}</div>
                <div className="flex gap-4">
                  <span>Logic_Buffer: 0xFFA2</span>
                  <span>Dome_Coverage: 150u</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Controls - Scrolled internally */}
          <div className="flex flex-col h-full min-h-0 gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
            {/* Dome Control */}
            <Card className="bg-gray-900/40 border border-cyan-500/30 p-4 shrink-0 transition-all hover:border-cyan-400/50">
              <div className="flex items-center gap-2 mb-2">
                <Zap className={`w-3 h-3 ${domeActive ? 'text-cyan-400' : 'text-gray-600'}`} />
                <h3 className="font-mono text-cyan-400 text-[10px] tracking-widest uppercase">Atmospheric_Shield</h3>
              </div>
              <div className="text-xl font-bold text-white mb-3 font-mono tracking-widest">
                {domeActive ? 'ACTIVE' : 'OFFLINE'}
              </div>
              <Button
                onClick={handleActivateDome}
                className={`w-full font-mono text-[10px] h-8 tracking-widest uppercase border ${domeActive
                  ? 'bg-red-950/20 border-red-500/50 hover:bg-red-500/30 text-red-400'
                  : 'bg-cyan-950/20 border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-400'
                  }`}
              >
                {domeActive ? 'Kill_Power' : 'Energize'}
              </Button>
            </Card>

            {/* Simulated Threat */}
            <Card className="bg-gray-900/40 border border-magenta-500/30 p-4 shrink-0 transition-all hover:border-magenta-400/50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-3 h-3 text-magenta-400" />
                <h3 className="font-mono text-magenta-400 text-[10px] tracking-widest uppercase">Inject_Threat</h3>
              </div>
              <Button
                onClick={handleLaunchMissile}
                className="w-full bg-magenta-950/20 border border-magenta-500/50 hover:bg-magenta-500/30 text-magenta-400 font-mono text-[10px] h-8 tracking-widest uppercase"
              >
                Trig_Launch
              </Button>
            </Card>

            {/* Manual Logic Override */}
            <Card className="bg-gray-900/40 border border-green-500/30 p-4 shrink-0 transition-all hover:border-green-400/50">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-3 h-3 text-green-400" />
                <h3 className="font-mono text-green-400 text-[10px] tracking-widest uppercase">Logic_Override</h3>
              </div>
              <Button
                onClick={handleInterceptMissile}
                className="w-full bg-green-950/20 border border-green-500/50 hover:bg-green-500/30 text-green-400 font-mono text-[10px] h-8 tracking-widest uppercase"
              >
                Force_Intercept
              </Button>
            </Card>

            {/* Real-time Telemetry */}
            <Card className="bg-gray-900/40 border border-cyan-500/10 p-4 shrink-0">
              <h3 className="font-mono text-cyan-800 text-[10px] tracking-widest mb-4 uppercase">Telemetry_Buffer</h3>
              <div className="space-y-2 font-mono text-[10px] uppercase tracking-tighter">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-600">Incoming:</span>
                  <span className="text-red-600 font-bold">{stats.incoming}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-600">Neutralized:</span>
                  <span className="text-green-600 font-bold">{stats.intercepted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clearance:</span>
                  <span className="text-cyan-600 font-bold">{stats.successRate}%</span>
                </div>
              </div>
            </Card>

            {/* Tactical Legend - Compact */}
            <Card className="bg-gray-900/40 border border-cyan-500/10 p-3 mt-auto shadow-inner">
              <h3 className="font-mono text-cyan-800 text-[9px] tracking-widest mb-2 uppercase">Symbol_Cipher</h3>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-1 text-[9px] font-mono tracking-tighter uppercase">
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="w-1.5 h-1.5 bg-magenta-500 rounded-full shadow-[0_0_5px_rgba(255,0,255,0.5)]"></div>
                  <span>Projectile</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                  <span>Interceptor</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="w-1.5 h-1.5 border border-cyan-400"></div>
                  <span>Dome</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
                  <span>Kinetic</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Global System Info - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
          {[
            { icon: Zap, color: "text-cyan-400", title: "Atmospheric_Shell", desc: "Energy-derived kinetic barrier with spatial synchronization logic." },
            { icon: AlertTriangle, color: "text-yellow-400", title: "Deep_Space_Tracking", desc: "Autonomous drone nodes leveraging predictive heuristic intercept models." },
            { icon: Zap, color: "text-green-400", title: "Interception_Delta", desc: "Real-time threat arbitration with sub-second response latency profiles." }
          ].map((item, i) => (
            <Card key={i} className="bg-gray-900/20 border border-cyan-500/10 p-3 transition-all hover:border-cyan-500/30">
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                <div className="min-w-0">
                  <h3 className="font-mono text-cyan-800 text-[9px] tracking-widest uppercase truncate">{item.title}</h3>
                  <p className="text-gray-600 text-[8px] tracking-tighter uppercase leading-tight line-clamp-2">{item.desc}</p>
                </div>
              </div>
            </Card>
          ))}
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
