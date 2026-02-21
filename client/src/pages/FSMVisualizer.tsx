import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Circle, AlertCircle } from 'lucide-react';

/**
 * FSM Visualizer - Shows finite state machine transitions for each agent
 * Demonstrates reactive behavior and state-driven decision making
 */
export default function FSMVisualizer() {
  const [selectedAgent, setSelectedAgent] = useState('sensor');
  const [currentStates, setCurrentStates] = useState({
    sensor: 'IDLE',
    coordinator: 'IDLE',
    rescue: 'IDLE',
    dome: 'IDLE'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch agent periods and update states
  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/agents');
        if (!response.ok) throw new Error('BACKEND_OFFLINE');

        const data = await response.json();
        const agents = data.agents || [];

        // Map agent types to states (assuming 1 agent per type for visualizer)
        const newStates: any = { ...currentStates };
        agents.forEach((agent: any) => {
          if (agent.type === 'sensor') newStates.sensor = agent.state;
          if (agent.type === 'coordinator') newStates.coordinator = agent.state;
          if (agent.type === 'rescue') newStates.rescue = agent.state;
          if (agent.type === 'dome') newStates.dome = agent.state;
        });

        setCurrentStates(newStates);
      } catch (err: any) {
        console.error('Error fetching agents:', err);
        setError('AGENT_LINK_FAILURE');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [retryCount]);

  // FSM definitions for each agent
  const fsmDefinitions = {
    sensor: {
      name: 'SensorAgent',
      description: 'Detects disaster events from news APIs and user reports',
      states: ['IDLE', 'MONITORING', 'ALERT_TRIGGERED'],
      transitions: [
        { from: 'IDLE', to: 'MONITORING', trigger: 'Start Monitoring' },
        { from: 'MONITORING', to: 'ALERT_TRIGGERED', trigger: 'Event Detected' },
        { from: 'ALERT_TRIGGERED', to: 'MONITORING', trigger: 'Alert Sent' }
      ]
    },
    coordinator: {
      name: 'CoordinatorAgent',
      description: 'Processes events and assigns tasks to other agents',
      states: ['IDLE', 'PROCESSING', 'ASSIGNING'],
      transitions: [
        { from: 'IDLE', to: 'PROCESSING', trigger: 'Event Received' },
        { from: 'PROCESSING', to: 'ASSIGNING', trigger: 'Analysis Complete' },
        { from: 'ASSIGNING', to: 'IDLE', trigger: 'Tasks Assigned' }
      ]
    },
    rescue: {
      name: 'RescueAgent',
      description: 'Deploys troops to disaster locations',
      states: ['IDLE', 'DEPLOYING', 'ENGAGED'],
      transitions: [
        { from: 'IDLE', to: 'DEPLOYING', trigger: 'Deploy Command' },
        { from: 'DEPLOYING', to: 'ENGAGED', trigger: 'Troops Arrived' },
        { from: 'ENGAGED', to: 'IDLE', trigger: 'Mission Complete' }
      ]
    },
    dome: {
      name: 'DomeDefenseAgent',
      description: 'Intercepts incoming missiles with drone interceptors',
      states: ['IDLE', 'TRACKING', 'INTERCEPTING'],
      transitions: [
        { from: 'IDLE', to: 'TRACKING', trigger: 'Activate Defense' },
        { from: 'TRACKING', to: 'INTERCEPTING', trigger: 'Missile Detected' },
        { from: 'INTERCEPTING', to: 'TRACKING', trigger: 'Interception Complete' }
      ]
    }
  };

  const fsm = fsmDefinitions[selectedAgent as keyof typeof fsmDefinitions];

  const handleStateTransition = (toState: string) => {
    setCurrentStates({
      ...currentStates,
      [selectedAgent]: toState
    });
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
            <h1 className="text-3xl font-bold text-white tracking-widest font-mono">FSM_BEHAVIOR_VISUALIZER</h1>
            {error && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/50 px-3 py-1 rounded animate-pulse">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-[10px] text-red-500 font-mono font-bold uppercase tracking-tighter">
                  AGENT_SYNC_LOST: {error}
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
          <p className="text-cyan-400 text-xs font-mono opacity-80">Protocol-driven state transitions and reactive logic verification // SYNC_STATUS: {error ? 'FAIL' : 'LOCKED'}</p>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agent Selector */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Card className="bg-gray-900/40 border border-cyan-500/30 p-4 shrink-0">
              <h3 className="font-mono text-cyan-400 text-[10px] tracking-widest uppercase mb-4 opacity-70">Infrastructure_Nodes</h3>
              <div className="space-y-2">
                {Object.entries(fsmDefinitions).map(([key, agent]) => (
                  <Button
                    key={key}
                    onClick={() => setSelectedAgent(key)}
                    className={`w-full justify-start text-[10px] font-mono h-9 tracking-tighter ${selectedAgent === key
                      ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.1)]'
                      : 'bg-black/40 text-gray-500 border border-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-300'
                      }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${selectedAgent === key ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-900 opacity-50'}`} />
                    {agent.name.toUpperCase()}
                  </Button>
                ))}
              </div>
            </Card>

            {/* FSM Concepts - Compact */}
            <div className="hidden lg:flex flex-col gap-4 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
              <Card className="bg-gray-900/20 border border-cyan-500/10 p-4">
                <h3 className="font-mono text-cyan-800 text-[10px] tracking-widest mb-2 uppercase">Nodes</h3>
                <p className="text-gray-600 text-[9px] leading-relaxed uppercase tracking-tighter">Discrete conditions representing behavior modes. Each state defines what the agent can do.</p>
              </Card>
              <Card className="bg-gray-900/20 border border-cyan-500/10 p-4">
                <h3 className="font-mono text-cyan-800 text-[10px] tracking-widest mb-2 uppercase">Links</h3>
                <p className="text-gray-600 text-[9px] leading-relaxed uppercase tracking-tighter">Movements between states triggered by protocols. Linkages ensure defined patterns.</p>
              </Card>
              <Card className="bg-gray-900/20 border border-cyan-500/10 p-4">
                <h3 className="font-mono text-cyan-800 text-[10px] tracking-widest mb-2 uppercase">Triggers</h3>
                <p className="text-gray-600 text-[9px] leading-relaxed uppercase tracking-tighter">Environmental stimuli that trigger transitions. Triggers enable reactive logic.</p>
              </Card>
            </div>
          </div>

          {/* FSM Diagram & Controls */}
          <div className="lg:col-span-3 flex flex-col h-full min-h-0 overflow-hidden">
            <Card className="bg-gray-900/50 border border-cyan-500/50 p-6 flex-1 flex flex-col min-h-0 overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.05)]">
              <div className="mb-6 flex-shrink-0 flex justify-between items-start">
                <div className="max-w-md">
                  <h2 className="text-xl font-bold text-white mb-1 font-mono tracking-widest">{fsm.name.toUpperCase()}</h2>
                  <p className="text-cyan-800 text-[10px] font-mono uppercase tracking-tighter">{fsm.description}</p>
                </div>
                <div className="bg-cyan-500/5 border border-cyan-500/20 px-3 py-1.5 rounded flex items-center gap-2">
                  <span className="text-[9px] font-mono text-cyan-800 uppercase">Current_State:</span>
                  <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest">{currentStates[selectedAgent as keyof typeof currentStates]}</span>
                </div>
              </div>

              {/* State Diagram - Scrollable if needed, but aimed at fit */}
              <div className="flex-1 min-h-0 overflow-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                <div className="min-h-full flex flex-col gap-8">
                  {/* Visual Nodes */}
                  <div className="bg-black/60 border border-cyan-500/20 p-8 rounded-lg flex items-center justify-around relative overflow-hidden">
                    {/* Background grid for aesthetics */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                      backgroundImage: 'linear-gradient(rgba(0,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.2) 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }} />

                    {fsm.states.map((state, index) => (
                      <div key={state} className="flex items-center z-10">
                        <div
                          className={`flex items-center justify-center w-20 h-20 rounded-lg border cursor-pointer transition-all duration-500 group relative ${currentStates[selectedAgent as keyof typeof currentStates] === state
                            ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(0,255,255,0.2)]'
                            : 'border-cyan-900/30 bg-black/40 opacity-40 hover:opacity-100 hover:border-cyan-500/50'
                            }`}
                          onClick={() => handleStateTransition(state)}
                        >
                          {currentStates[selectedAgent as keyof typeof currentStates] === state && (
                            <div className="absolute -inset-1 border border-cyan-400/30 animate-pulse rounded-lg" />
                          )}
                          <div className="text-center font-mono">
                            <div className={`text-[9px] mb-1 ${currentStates[selectedAgent as keyof typeof currentStates] === state ? 'text-cyan-400' : 'text-cyan-900 group-hover:text-cyan-600'}`}>0x0{index}</div>
                            <span className="text-[10px] font-bold tracking-tighter">{state}</span>
                          </div>
                        </div>
                        {index < fsm.states.length - 1 && (
                          <div className="w-12 h-px bg-cyan-900/30 mx-2 relative">
                            <ArrowRight className="w-3 h-3 absolute -right-1.5 -top-1.5 text-cyan-900/40" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Transition Controls & Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Transitions */}
                    <div className="space-y-4">
                      <h3 className="font-mono text-cyan-800 text-[10px] tracking-widest uppercase">Available_Transmissions</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {fsm.transitions
                          .filter(t => t.from === currentStates[selectedAgent as keyof typeof currentStates])
                          .map((transition, index) => (
                            <Button
                              key={index}
                              onClick={() => handleStateTransition(transition.to)}
                              className="bg-black/60 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/20 text-cyan-400 font-mono text-[10px] h-10 tracking-widest uppercase flex justify-between px-4 transition-all group"
                            >
                              <span className="opacity-50 group-hover:opacity-100">{transition.trigger}</span>
                              <ArrowRight className="w-3 h-3 text-cyan-500" />
                            </Button>
                          ))}
                        {fsm.transitions.filter(t => t.from === currentStates[selectedAgent as keyof typeof currentStates]).length === 0 && (
                          <div className="h-10 border border-dashed border-cyan-950/30 rounded flex items-center justify-center text-[9px] font-mono text-cyan-950 uppercase italic tracking-tighter">No output triggers available in terminal state</div>
                        )}
                      </div>
                    </div>

                    {/* Behavior Log */}
                    <div className="space-y-4">
                      <h3 className="font-mono text-cyan-800 text-[10px] tracking-widest uppercase">Protocol_Analysis</h3>
                      <Card className="bg-black/40 border border-cyan-500/10 p-4 h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                        <p className="text-cyan-300/70 text-[10px] leading-relaxed font-mono uppercase tracking-tighter">
                          {selectedAgent === 'sensor' && 'Continuous monitoring of entropy vector. Node transitions to MONITORING on handshake, switching to ALERT_TRIGGERED upon heuristic match. Post-synchronization, node reverts to baseline MONITORING.'}
                          {selectedAgent === 'coordinator' && 'Logic coordinator for resource arbitration. Node ingest events in IDLE, performs PROCESSING of threat vectors, and executes ASSIGNING protocols before clearing buffer back to IDLE.'}
                          {selectedAgent === 'rescue' && 'Force projection and asset management. Node persists in IDLE until DEPLOY command sequence, transitions to ENGAGED upon unit touchdown, returns to IDLE on extraction completion.'}
                          {selectedAgent === 'dome' && 'Atmospheric defense and kinetic interception. Node activates TRACKING modes on defense handshake. Upon detection, INTERCEPTING protocol is triggered for kinetic neutralized.'}
                        </p>
                      </Card>
                    </div>
                  </div>

                  {/* Complete Transition Map */}
                  <div className="space-y-4 pb-4">
                    <h3 className="font-mono text-cyan-800 text-[10px] tracking-widest uppercase">Global_Transition_Log</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {fsm.transitions.map((transition, index) => {
                        const isCurrent = currentStates[selectedAgent as keyof typeof currentStates] === transition.from;
                        return (
                          <div
                            key={index}
                            className={`p-2 border rounded-md font-mono text-[9px] transition-all ${isCurrent
                              ? 'bg-cyan-500/10 border-cyan-400 text-cyan-200'
                              : 'bg-black/20 border-white/5 text-gray-600 opacity-60'
                              }`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <span className="truncate">{transition.from}</span>
                              <ArrowRight className="w-2 h-2 shrink-0 opacity-40" />
                              <span className="truncate">{transition.to}</span>
                            </div>
                            <div className="text-[8px] opacity-40 truncate">TRIGGER: {transition.trigger.toUpperCase()}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
