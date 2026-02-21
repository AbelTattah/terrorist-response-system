import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, BookOpen } from 'lucide-react';

/**
 * Education Page - Learn about FSM, multi-agent systems, and reactive behaviors
 * Demonstrates core concepts used in TARS
 */
export default function Education() {
  const [expandedSection, setExpandedSection] = useState<string | null>('fsm');

  const sections = [
    {
      id: 'fsm',
      title: 'Finite State Machines (FSM)',
      icon: '⚙️',
      content: `
A Finite State Machine is a computational model that consists of:

1. **States**: Discrete conditions or modes of operation. Each state represents a specific behavior or configuration.
   - Example: IDLE, MONITORING, ALERT_TRIGGERED

2. **Transitions**: Movements from one state to another, triggered by events or conditions.
   - Example: IDLE → MONITORING when monitoring starts

3. **Events**: External or internal stimuli that trigger state transitions.
   - Example: "event detected" triggers MONITORING → ALERT_TRIGGERED

4. **Actions**: Behaviors executed when entering/exiting states or during transitions.
   - Example: Send alert message when entering ALERT_TRIGGERED

In TARS, each agent uses FSM to model reactive behavior. The SensorAgent, for example:
- Starts in IDLE state
- Transitions to MONITORING when activated
- Moves to ALERT_TRIGGERED when an event is detected
- Returns to MONITORING after sending the alert

This ensures predictable, deterministic behavior in response to environmental changes.
      `
    },
    {
      id: 'agents',
      title: 'Multi-Agent Systems',
      icon: '🤖',
      content: `
A Multi-Agent System (MAS) consists of multiple autonomous agents that:

1. **Autonomy**: Each agent makes decisions independently based on local information
2. **Decentralization**: No central control; agents coordinate through communication
3. **Reactivity**: Agents respond to environmental changes in real-time
4. **Proactivity**: Agents pursue goals and take initiative

In TARS, we have four types of agents:

**SensorAgent**: Monitors external data sources (news APIs, user reports)
- Detects terrorist attack events
- Sends alerts to CoordinatorAgent
- Maintains monitoring state

**CoordinatorAgent**: Processes events and makes strategic decisions
- Analyzes threat severity
- Assigns tasks to RescueAgent and DomeDefenseAgent
- Prioritizes resource allocation

**RescueAgent**: Manages troop deployments
- Receives deployment orders from CoordinatorAgent
- Coordinates ground response
- Tracks deployment status

**DomeDefenseAgent**: Manages air defense systems
- Tracks incoming missiles
- Launches interceptor drones
- Protects critical infrastructure

These agents communicate through message passing, enabling decentralized decision-making
and resilience against single points of failure.
      `
    },
    {
      id: 'reactive',
      title: 'Reactive Behavior',
      icon: '⚡',
      content: `
Reactive behavior means agents respond immediately to environmental stimuli without
complex planning or reasoning. This is crucial for emergency response systems.

**Key Principles**:

1. **Stimulus-Response**: Events trigger immediate actions
   - Missile detected → Launch interceptors
   - Attack reported → Deploy troops

2. **State-Based Decision Making**: Behavior depends on current state
   - In IDLE state: Wait for commands
   - In MONITORING state: Check for threats
   - In ALERT state: Take action

3. **Real-Time Response**: Minimal latency between detection and action
   - TARS targets <1 second response time
   - Automated decision-making without human intervention

4. **Graceful Degradation**: System continues functioning even if components fail
   - If one agent fails, others continue operating
   - Decentralized architecture prevents cascading failures

**Example Scenario**:
1. SensorAgent detects attack (EVENT)
2. Transitions from MONITORING to ALERT_TRIGGERED (STATE CHANGE)
3. Sends alert to CoordinatorAgent (ACTION)
4. CoordinatorAgent receives alert and transitions to PROCESSING (REACTION)
5. CoordinatorAgent analyzes threat and transitions to ASSIGNING (DECISION)
6. CoordinatorAgent sends deployment orders to RescueAgent and DomeDefenseAgent (COORDINATION)
7. Both agents execute their tasks in parallel (DECENTRALIZED EXECUTION)

This entire sequence happens in milliseconds, enabling rapid response to threats.
      `
    },
    {
      id: 'coordination',
      title: 'Agent Coordination Patterns',
      icon: '🔗',
      content: `
Agents in TARS coordinate through several patterns:

**1. Message Passing**
- Agents communicate through asynchronous messages
- No direct function calls or shared memory
- Enables loose coupling and independent operation

**2. Publish-Subscribe**
- Agents publish events (e.g., "threat detected")
- Other agents subscribe to events of interest
- Enables event-driven architecture

**3. Request-Response**
- CoordinatorAgent requests actions from other agents
- Agents respond with status updates
- Enables task delegation and monitoring

**4. Broadcast**
- Important events broadcast to all agents
- Example: System-wide emergency alert
- Ensures all agents are aware of critical situations

**5. Hierarchical Coordination**
- CoordinatorAgent acts as central decision maker
- Other agents execute assigned tasks
- Balances centralized planning with decentralized execution

**Benefits of These Patterns**:
- Scalability: Easy to add new agents
- Resilience: Failure of one agent doesn't crash the system
- Flexibility: Agents can be replaced or upgraded independently
- Responsiveness: Parallel execution of independent tasks
      `
    },
    {
      id: 'implementation',
      title: 'TARS Implementation Details',
      icon: '💻',
      content: `
TARS uses several technologies to implement multi-agent systems:

**Backend (Python)**:
- **SPADE Framework**: Provides agent infrastructure and message passing
- **Flask**: REST API for frontend communication
- **Flask-SocketIO**: WebSocket for real-time event streaming
- **SQLAlchemy**: Database for persistent state

**Frontend (React/TypeScript)**:
- **Real-time visualization**: Canvas-based graphics for map and defense simulation
- **FSM Visualizer**: Interactive state machine diagram
- **Execution Trace**: Timeline view of agent decisions
- **Voice Control**: Speech recognition and text-to-speech

**Communication**:
- Agents communicate via XMPP protocol (built into SPADE)
- Frontend receives updates via WebSocket
- REST API for queries and commands

**Data Flow**:
1. Sensor detects event → SPADE message to CoordinatorAgent
2. CoordinatorAgent processes → Sends messages to RescueAgent and DomeDefenseAgent
3. Agents execute tasks → Update database
4. Backend broadcasts updates via WebSocket
5. Frontend receives updates → Visualizes in real-time

**Execution Trace**:
Every agent decision is logged with:
- Timestamp
- Agent name
- Event type (detected, state_change, decision, action)
- From state and to state
- Details (location, severity, etc.)

This enables complete auditability and understanding of system behavior.
      `
    }
  ];

  return (
    <div className="h-full bg-black text-white p-6 overflow-hidden flex flex-col">
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
          animation: 'scanlines 8s linear infinite'
        }} />
      </div>

      <div className="relative z-10 flex flex-col h-full gap-6 max-w-5xl mx-auto w-full">
        {/* Header - Compact */}
        <div className="border-b-2 border-cyan-500 pb-4 flex flex-col gap-1 flex-shrink-0">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white tracking-widest font-mono uppercase">Education_Terminal</h1>
          </div>
          <p className="text-cyan-400 text-xs font-mono opacity-80 uppercase">Tactical_Theory and decentralized_Response_Models // DOC_ID: TARS_001</p>
        </div>

        {/* Educational Content Area - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
          <div className="space-y-4">
            {sections.map((section) => (
              <Card
                key={section.id}
                className="bg-gray-900/40 border border-cyan-500/30 overflow-hidden transition-all hover:border-cyan-400/50"
              >
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-cyan-500/5 transition-colors group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <span className="text-2xl opacity-80 group-hover:opacity-100 grayscale hover:grayscale-0">{section.icon}</span>
                    <h2 className="text-sm font-bold text-white font-mono uppercase tracking-widest group-hover:text-cyan-400">{section.title}</h2>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan-800 transition-transform duration-300 ${expandedSection === section.id ? 'rotate-180 text-cyan-400' : ''
                      }`}
                  />
                </button>

                {expandedSection === section.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-cyan-500/10 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="text-gray-400 text-[10px] whitespace-pre-wrap leading-relaxed font-mono uppercase tracking-tighter bg-black/40 p-4 rounded border border-cyan-500/5">
                      {section.content}
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {/* Key Takeaways - Compact Grid */}
            <div className="pt-6 border-t border-cyan-500/20">
              <h2 className="text-xs font-bold text-cyan-800 mb-4 font-mono uppercase tracking-[0.2em]">Operational_Takeaways</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
                {[
                  { title: "FSM_Advantages", list: ["Predictability", "Unit_Testable", "State_Coherence", "Logic_Clarity"] },
                  { title: "MAS_Strengths", list: ["Decentralization", "Fail_Safe", "Parallel_Execution", "Scalability"] },
                  { title: "Reactive_Model", list: ["Real_Time", "Low_Latency", "Event_Driven", "Immediate_Action"] },
                  { title: "System_Utility", list: ["Emergency_Coord", "Threat_Heuristics", "Asset_Optimization", "Auto_Defense"] }
                ].map((item) => (
                  <Card key={item.title} className="bg-gray-900/20 border border-cyan-500/10 p-3">
                    <h3 className="text-cyan-600 font-mono text-[9px] mb-2 uppercase tracking-widest border-b border-cyan-500/5 pb-1">{item.title}</h3>
                    <ul className="text-[9px] text-gray-600 space-y-1 font-mono uppercase tracking-tighter">
                      {item.list.map(li => <li key={li}>• {li}</li>)}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>

            {/* Footer - Cipher Links */}
            <div className="p-4 bg-cyan-950/10 border border-cyan-500/10 rounded mb-4">
              <h3 className="text-cyan-900 font-mono text-[9px] mb-3 uppercase tracking-widest">External_Reference_Buffer</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-[8px] uppercase tracking-tighter text-cyan-900/60">
                <a href="https://en.wikipedia.org/wiki/Finite-state_machine" className="hover:text-cyan-400">Finite_State_Machines // HTTP_EXT</a>
                <a href="https://en.wikipedia.org/wiki/Multi-agent_system" className="hover:text-cyan-400">Multi_Agent_Systems // HTTP_EXT</a>
                <a href="https://spade-mas.readthedocs.io/" className="hover:text-cyan-400">SPADE_Framework_Documentation // HTTP_EXT</a>
                <a href="https://www.reactivemanifesto.org/" className="hover:text-cyan-400">Reactive_Systems_Manifesto // HTTP_EXT</a>
              </div>
            </div>
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
