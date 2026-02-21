import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Shield, Map, Zap, FileText, BookOpen } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

/**
 * Home Page - TARS System Landing Page
 * Retro-futuristic sci-fi interface for terrorist attack response system
 */
export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-cyan-400 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Scanline effect background */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
          animation: 'scanlines 8s linear infinite'
        }} />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 font-mono" style={{
              textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(255, 0, 255, 0.4)'
            }}>
              TARS
            </h1>
            <p className="text-2xl md:text-3xl text-cyan-400 mb-2 font-mono">
              Terrorist Attack Response System
            </p>
            <p className="text-gray-400 text-lg mb-8 font-mono">
              Decentralized Multi-Agent Defense Network
            </p>
            
            {/* Divider */}
            <div className="w-64 h-1 bg-gradient-to-r from-cyan-500 via-magenta-500 to-cyan-500 mx-auto mb-8"></div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl">
            <Card className="bg-gray-900 border-2 border-cyan-500 p-6 text-center">
              <div className="text-cyan-400 font-mono text-sm mb-2">AGENTS ONLINE</div>
              <div className="text-4xl font-bold text-white">4</div>
              <div className="text-xs text-gray-400 mt-2">All systems operational</div>
            </Card>
            <Card className="bg-gray-900 border-2 border-magenta-500 p-6 text-center">
              <div className="text-magenta-400 font-mono text-sm mb-2">FSM STATES</div>
              <div className="text-4xl font-bold text-white">12</div>
              <div className="text-xs text-gray-400 mt-2">Reactive behaviors active</div>
            </Card>
            <Card className="bg-gray-900 border-2 border-green-500 p-6 text-center">
              <div className="text-green-400 font-mono text-sm mb-2">RESPONSE TIME</div>
              <div className="text-4xl font-bold text-white">&lt;1s</div>
              <div className="text-xs text-gray-400 mt-2">Real-time coordination</div>
            </Card>
          </div>

          {/* Authentication */}
          {!isAuthenticated ? (
            <div className="mb-12">
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-lg px-8 py-3 border-2 border-cyan-400"
              >
                INITIALIZE SYSTEM
              </Button>
            </div>
          ) : (
            <div className="mb-12 text-center">
              <p className="text-cyan-400 font-mono mb-4">Welcome, {user?.name}</p>
              <Button
                onClick={() => setLocation('/dashboard')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-lg px-8 py-3 border-2 border-cyan-400"
              >
                ENTER COMMAND CENTER
              </Button>
            </div>
          )}
        </div>

        {/* Features Section */}
        {isAuthenticated && (
          <div className="py-20 px-4 border-t-2 border-cyan-500">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-12 font-mono" style={{
                textShadow: '0 0 10px rgba(0, 255, 255, 0.6)'
              }}>
                SYSTEM MODULES
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Dashboard */}
                <Card className="bg-gray-900 border-2 border-cyan-500 p-6 hover:border-cyan-300 transition-all cursor-pointer"
                  onClick={() => setLocation('/dashboard')}>
                  <Shield className="w-8 h-8 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 font-mono">COMMAND CENTER</h3>
                  <p className="text-gray-400 text-sm mb-4">Real-time system status, agent monitoring, and command controls</p>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs">
                    Access Dashboard
                  </Button>
                </Card>

                {/* City Map */}
                <Card className="bg-gray-900 border-2 border-cyan-500 p-6 hover:border-cyan-300 transition-all cursor-pointer"
                  onClick={() => setLocation('/map')}>
                  <Map className="w-8 h-8 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 font-mono">CITY MAP</h3>
                  <p className="text-gray-400 text-sm mb-4">Interactive visualization of threats, deployments, and defense coverage</p>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs">
                    View Map
                  </Button>
                </Card>

                {/* FSM Visualizer */}
                <Card className="bg-gray-900 border-2 border-cyan-500 p-6 hover:border-cyan-300 transition-all cursor-pointer"
                  onClick={() => setLocation('/fsm')}>
                  <Zap className="w-8 h-8 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 font-mono">FSM VISUALIZER</h3>
                  <p className="text-gray-400 text-sm mb-4">Finite state machine visualization and reactive behavior demonstration</p>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs">
                    View FSM
                  </Button>
                </Card>

                {/* Execution Trace */}
                <Card className="bg-gray-900 border-2 border-cyan-500 p-6 hover:border-cyan-300 transition-all cursor-pointer"
                  onClick={() => setLocation('/trace')}>
                  <FileText className="w-8 h-8 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 font-mono">EXECUTION TRACE</h3>
                  <p className="text-gray-400 text-sm mb-4">Detailed log of agent decisions, state transitions, and system actions</p>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs">
                    View Traces
                  </Button>
                </Card>

                {/* Educational Content */}
                <Card className="bg-gray-900 border-2 border-cyan-500 p-6 hover:border-cyan-300 transition-all cursor-pointer"
                  onClick={() => setLocation('/education')}>
                  <BookOpen className="w-8 h-8 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 font-mono">EDUCATION</h3>
                  <p className="text-gray-400 text-sm mb-4">Learn about FSM concepts, agent patterns, and reactive behaviors</p>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs">
                    View Education
                  </Button>
                </Card>

                {/* Missile Defense Simulation */}
                <Card className="bg-gray-900 border-2 border-cyan-500 p-6 hover:border-cyan-300 transition-all cursor-pointer"
                  onClick={() => setLocation('/defense')}>
                  <Zap className="w-8 h-8 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 font-mono">MISSILE DEFENSE</h3>
                  <p className="text-gray-400 text-sm mb-4">Real-time dome defense and interceptor drone animation</p>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs">
                    View Simulation
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-cyan-500 py-8 px-4 text-center text-gray-500 font-mono text-xs">
          <p>TARS v1.0 | Decentralized Multi-Agent Response System</p>
          <p className="mt-2">© 2026 Emergency Response Technologies | All systems secure</p>
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
