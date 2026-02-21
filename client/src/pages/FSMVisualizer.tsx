import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Circle } from 'lucide-react';

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
          <h1 className="text-4xl font-bold text-white mb-2">FSM VISUALIZER</h1>
          <p className="text-cyan-400 text-sm">Finite State Machine visualization and reactive behavior demonstration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agent Selector */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-2 border-cyan-500 p-4">
              <h3 className="font-mono text-cyan-400 text-sm mb-4">SELECT AGENT</h3>
              <div className="space-y-2">
                {Object.entries(fsmDefinitions).map(([key, agent]) => (
                  <Button
                    key={key}
                    onClick={() => setSelectedAgent(key)}
                    className={`w-full justify-start text-xs font-mono ${
                      selectedAgent === key
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-800 text-cyan-400 hover:bg-gray-700'
                    }`}
                  >
                    {agent.name}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* FSM Diagram */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-2 border-cyan-500 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{fsm.name}</h2>
                <p className="text-gray-400 text-sm">{fsm.description}</p>
              </div>

              {/* State Diagram */}
              <div className="mb-8 p-6 bg-black border border-cyan-400 rounded">
                <div className="flex items-center justify-between mb-8">
                  {fsm.states.map((state, index) => (
                    <div key={state} className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-24 h-24 rounded-full border-2 cursor-pointer transition-all ${
                          currentStates[selectedAgent as keyof typeof currentStates] === state
                            ? 'border-cyan-400 bg-cyan-400 bg-opacity-20 shadow-lg shadow-cyan-400'
                            : 'border-gray-500 hover:border-cyan-400'
                        }`}
                        onClick={() => handleStateTransition(state)}
                      >
                        <div className="text-center">
                          <Circle className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                          <span className="font-mono text-xs text-white">{state}</span>
                        </div>
                      </div>
                      {index < fsm.states.length - 1 && (
                        <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-cyan-400 to-transparent"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Current State Info */}
                <div className="mt-6 p-4 bg-gray-800 border border-cyan-400 rounded">
                  <div className="font-mono text-sm">
                    <div className="text-cyan-400">Current State:</div>
                    <div className="text-white text-lg mt-2">{currentStates[selectedAgent as keyof typeof currentStates]}</div>
                  </div>
                </div>
              </div>

              {/* Transitions */}
              <div className="mb-6">
                <h3 className="font-mono text-cyan-400 text-sm mb-4">STATE TRANSITIONS</h3>
                <div className="space-y-3">
                  {fsm.transitions.map((transition, index) => {
                    const isCurrentTransition = currentStates[selectedAgent as keyof typeof currentStates] === transition.from;
                    return (
                      <div
                        key={index}
                        className={`p-3 border rounded font-mono text-xs ${
                          isCurrentTransition
                            ? 'bg-cyan-400 bg-opacity-20 border-cyan-400'
                            : 'bg-gray-800 border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={isCurrentTransition ? 'text-cyan-300' : 'text-gray-400'}>
                              {transition.from}
                            </span>
                            <ArrowRight className="w-4 h-4 inline mx-2 text-cyan-400" />
                            <span className={isCurrentTransition ? 'text-cyan-300' : 'text-gray-400'}>
                              {transition.to}
                            </span>
                          </div>
                          <span className="text-gray-500">{transition.trigger}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transition Controls */}
              <div className="mb-6">
                <h3 className="font-mono text-cyan-400 text-sm mb-4">TRIGGER TRANSITION</h3>
                <div className="grid grid-cols-2 gap-2">
                  {fsm.transitions
                    .filter(t => t.from === currentStates[selectedAgent as keyof typeof currentStates])
                    .map((transition, index) => (
                      <Button
                        key={index}
                        onClick={() => handleStateTransition(transition.to)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs"
                      >
                        {transition.trigger}
                      </Button>
                    ))}
                </div>
              </div>

              {/* Behavioral Description */}
              <div className="p-4 bg-gray-800 border border-cyan-400 rounded">
                <h3 className="font-mono text-cyan-400 text-sm mb-2">BEHAVIOR DESCRIPTION</h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  {selectedAgent === 'sensor' && 'The SensorAgent monitors external data sources for disaster events. It transitions from IDLE to MONITORING when activated, then to ALERT_TRIGGERED when an event is detected. After sending the alert to the CoordinatorAgent, it returns to MONITORING.'}
                  {selectedAgent === 'coordinator' && 'The CoordinatorAgent processes incoming events and makes decisions about resource allocation. It receives events in IDLE state, analyzes them in PROCESSING state, and assigns tasks in ASSIGNING state before returning to IDLE.'}
                  {selectedAgent === 'rescue' && 'The RescueAgent manages troop deployments. It waits in IDLE state for deployment commands, transitions to DEPLOYING when ordered, moves to ENGAGED when troops arrive, and returns to IDLE when the mission completes.'}
                  {selectedAgent === 'dome' && 'The DomeDefenseAgent protects against missile attacks. It remains in IDLE until activated, then enters TRACKING state to monitor for threats. When a missile is detected, it transitions to INTERCEPTING to launch drone interceptors.'}
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* FSM Concepts Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border border-cyan-500 p-4">
            <h3 className="font-mono text-cyan-400 text-sm mb-2">STATES</h3>
            <p className="text-gray-400 text-xs">Discrete conditions representing agent behavior modes. Each state defines what the agent can do and what transitions are possible.</p>
          </Card>
          <Card className="bg-gray-900 border border-cyan-500 p-4">
            <h3 className="font-mono text-cyan-400 text-sm mb-2">TRANSITIONS</h3>
            <p className="text-gray-400 text-xs">Movements between states triggered by events or conditions. Transitions ensure agents follow defined behavioral patterns.</p>
          </Card>
          <Card className="bg-gray-900 border border-cyan-500 p-4">
            <h3 className="font-mono text-cyan-400 text-sm mb-2">EVENTS</h3>
            <p className="text-gray-400 text-xs">External or internal stimuli that trigger state transitions. Events enable reactive behavior in response to environmental changes.</p>
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
