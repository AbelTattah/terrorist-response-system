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
    <div className="min-h-screen bg-black text-white p-8">
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
          animation: 'scanlines 8s linear infinite'
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b-2 border-cyan-500 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">EDUCATION CENTER</h1>
          </div>
          <p className="text-cyan-400 text-sm">Learn about FSM, multi-agent systems, and reactive behaviors</p>
        </div>

        {/* Educational Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <Card
              key={section.id}
              className="bg-gray-900 border-2 border-cyan-500 overflow-hidden"
            >
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4 text-left">
                  <span className="text-3xl">{section.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white font-mono">{section.title}</h2>
                  </div>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-cyan-400 transition-transform ${
                    expandedSection === section.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSection === section.id && (
                <div className="px-6 pb-6 border-t border-cyan-500">
                  <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                    {section.content}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Key Takeaways */}
        <div className="mt-12 border-t-2 border-cyan-500 pt-8">
          <h2 className="text-2xl font-bold text-white mb-6 font-mono">KEY TAKEAWAYS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-900 border border-cyan-500 p-4">
              <h3 className="text-cyan-400 font-mono text-sm mb-2">FSM Benefits</h3>
              <ul className="text-xs text-gray-300 space-y-1 font-mono">
                <li>✓ Predictable behavior</li>
                <li>✓ Easy to test and debug</li>
                <li>✓ Clear state transitions</li>
                <li>✓ Handles complex logic simply</li>
              </ul>
            </Card>
            <Card className="bg-gray-900 border border-cyan-500 p-4">
              <h3 className="text-cyan-400 font-mono text-sm mb-2">MAS Benefits</h3>
              <ul className="text-xs text-gray-300 space-y-1 font-mono">
                <li>✓ Decentralized decision-making</li>
                <li>✓ Resilience to failures</li>
                <li>✓ Parallel task execution</li>
                <li>✓ Scalable architecture</li>
              </ul>
            </Card>
            <Card className="bg-gray-900 border border-cyan-500 p-4">
              <h3 className="text-cyan-400 font-mono text-sm mb-2">Reactive Behavior</h3>
              <ul className="text-xs text-gray-300 space-y-1 font-mono">
                <li>✓ Real-time response</li>
                <li>✓ Minimal latency</li>
                <li>✓ No complex planning</li>
                <li>✓ Immediate action on events</li>
              </ul>
            </Card>
            <Card className="bg-gray-900 border border-cyan-500 p-4">
              <h3 className="text-cyan-400 font-mono text-sm mb-2">TARS Application</h3>
              <ul className="text-xs text-gray-300 space-y-1 font-mono">
                <li>✓ Emergency response</li>
                <li>✓ Threat detection</li>
                <li>✓ Resource coordination</li>
                <li>✓ Automated defense</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Further Reading */}
        <div className="mt-12 p-6 bg-gray-900 border border-cyan-500 rounded">
          <h3 className="text-cyan-400 font-mono text-sm mb-4">FURTHER READING</h3>
          <div className="text-xs text-gray-400 space-y-2 font-mono">
            <div>• Finite State Machines: https://en.wikipedia.org/wiki/Finite-state_machine</div>
            <div>• Multi-Agent Systems: https://en.wikipedia.org/wiki/Multi-agent_system</div>
            <div>• SPADE Framework: https://spade-mas.readthedocs.io/</div>
            <div>• Reactive Systems: https://www.reactivemanifesto.org/</div>
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
