import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle } from 'lucide-react';

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
    <div className="min-h-screen bg-black text-white p-8">
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
          animation: 'scanlines 8s linear infinite'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b-2 border-cyan-500 pb-4">
          <h1 className="text-4xl font-bold text-white mb-2">MISSILE DEFENSE SIMULATION</h1>
          <p className="text-cyan-400 text-sm">Real-time dome defense and interceptor drone animation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-2 border-cyan-500 p-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full border border-cyan-400"
              />
              <div className="mt-4 text-xs text-cyan-400 font-mono">
                <div>Missiles: {missiles.length} | Interceptors: {interceptors.length}</div>
                <div>Dome Status: {domeActive ? 'ACTIVE' : 'INACTIVE'}</div>
              </div>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            {/* Dome Control */}
            <Card className="bg-gray-900 border-2 border-cyan-500 p-4">
              <h3 className="font-mono text-cyan-400 text-sm mb-3">DOME CONTROL</h3>
              <Button
                onClick={handleActivateDome}
                className={`w-full font-mono text-xs ${
                  domeActive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                {domeActive ? 'DEACTIVATE' : 'ACTIVATE'}
              </Button>
            </Card>

            {/* Missile Launch */}
            <Card className="bg-gray-900 border-2 border-magenta-500 p-4">
              <h3 className="font-mono text-magenta-400 text-sm mb-3">THREAT SIMULATION</h3>
              <Button
                onClick={handleLaunchMissile}
                className="w-full bg-magenta-600 hover:bg-magenta-700 text-white font-mono text-xs"
              >
                Launch Missile
              </Button>
            </Card>

            {/* Manual Intercept */}
            <Card className="bg-gray-900 border-2 border-green-500 p-4">
              <h3 className="font-mono text-green-400 text-sm mb-3">MANUAL CONTROL</h3>
              <Button
                onClick={handleInterceptMissile}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-mono text-xs"
              >
                Intercept Missile
              </Button>
            </Card>

            {/* Statistics */}
            <Card className="bg-gray-900 border-2 border-cyan-500 p-4">
              <h3 className="font-mono text-cyan-400 text-sm mb-4">STATISTICS</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Incoming:</span>
                  <span className="text-red-400 font-bold">{stats.incoming}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Intercepted:</span>
                  <span className="text-green-400 font-bold">{stats.intercepted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate:</span>
                  <span className="text-cyan-400 font-bold">{stats.successRate}%</span>
                </div>
              </div>
            </Card>

            {/* Legend */}
            <Card className="bg-gray-900 border border-cyan-500 p-4">
              <h3 className="font-mono text-cyan-400 text-sm mb-3">LEGEND</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-magenta-500 rounded-full"></div>
                  <span>Missile</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Interceptor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-cyan-400"></div>
                  <span>Dome Coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Explosion</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Information Panel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border border-cyan-500 p-4">
            <Zap className="w-5 h-5 text-cyan-400 mb-2" />
            <h3 className="font-mono text-cyan-400 text-sm mb-2">DOME SYSTEM</h3>
            <p className="text-gray-400 text-xs">Protective energy dome with 150-unit radius coverage. Automatically intercepts incoming threats.</p>
          </Card>
          <Card className="bg-gray-900 border border-cyan-500 p-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mb-2" />
            <h3 className="font-mono text-yellow-400 text-sm mb-2">INTERCEPTORS</h3>
            <p className="text-gray-400 text-xs">Autonomous drone interceptors track and neutralize incoming missiles with precision targeting.</p>
          </Card>
          <Card className="bg-gray-900 border border-cyan-500 p-4">
            <Zap className="w-5 h-5 text-green-400 mb-2" />
            <h3 className="font-mono text-green-400 text-sm mb-2">RESPONSE TIME</h3>
            <p className="text-gray-400 text-xs">Real-time threat detection and automated response. Average interception time: &lt;2 seconds.</p>
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
