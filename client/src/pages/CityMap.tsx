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
          <h1 className="text-4xl font-bold text-white mb-2">CITY MAP</h1>
          <p className="text-cyan-400 text-sm">Real-time threat visualization and response coordination</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Canvas */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-2 border-cyan-500 p-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full border border-cyan-400"
              />
              <div className="mt-4 text-xs text-cyan-400 font-mono">
                <div>Grid: 1000x1000 units</div>
                <div>Dome Radius: 200 units</div>
                <div>Events: {events.length} | Deployments: {deployments.length} | Missiles: {missiles.length}</div>
              </div>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            {/* Dome Status */}
            <Card className="bg-gray-900 border-2 border-cyan-500 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h3 className="font-mono text-cyan-400 text-sm">DOME STATUS</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-3">
                {domeActive ? 'ACTIVE' : 'INACTIVE'}
              </div>
              <Button
                onClick={() => setDomeActive(!domeActive)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs"
              >
                {domeActive ? 'Deactivate' : 'Activate'}
              </Button>
            </Card>

            {/* Event Controls */}
            <Card className="bg-gray-900 border-2 border-magenta-500 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-magenta-400" />
                <h3 className="font-mono text-magenta-400 text-sm">EVENTS</h3>
              </div>
              <div className="text-sm text-white mb-3">
                {selectedEvent ? (
                  <div className="text-xs">
                    <div>Type: {selectedEvent.type}</div>
                    <div>Severity: {selectedEvent.severity}</div>
                    <div>Loc: ({selectedEvent.location.x.toFixed(0)}, {selectedEvent.location.y.toFixed(0)})</div>
                  </div>
                ) : (
                  <div className="text-gray-400">No event selected</div>
                )}
              </div>
              <Button
                onClick={handleSimulateEvent}
                className="w-full bg-magenta-600 hover:bg-magenta-700 text-white font-mono text-xs"
              >
                Simulate Event
              </Button>
            </Card>

            {/* Deployment Controls */}
            <Card className="bg-gray-900 border-2 border-green-500 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-green-400" />
                <h3 className="font-mono text-green-400 text-sm">DEPLOY</h3>
              </div>
              <Button
                onClick={handleDeployTroops}
                disabled={!selectedEvent}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-mono text-xs disabled:opacity-50"
              >
                Deploy Troops
              </Button>
            </Card>

            {/* Missile Controls */}
            <Card className="bg-gray-900 border-2 border-red-500 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Crosshair className="w-5 h-5 text-red-400" />
                <h3 className="font-mono text-red-400 text-sm">MISSILES</h3>
              </div>
              <Button
                onClick={handleSimulateMissile}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-mono text-xs"
              >
                Simulate Missile
              </Button>
            </Card>

            {/* Legend */}
            <Card className="bg-gray-900 border border-cyan-500 p-4">
              <h3 className="font-mono text-cyan-400 text-sm mb-3">LEGEND</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Critical Event</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500"></div>
                  <span>Deployment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-magenta-500 rounded-full"></div>
                  <span>Missile</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-cyan-400"></div>
                  <span>Dome Coverage</span>
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
      `}</style>
    </div>
  );
}
