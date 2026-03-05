export interface Slide {
    id: string;
    title: string;
    subtitle?: string;
    content: string[];
    type: 'text' | 'grid' | 'trace' | 'stats' | 'title';
    footer?: string;
    accent?: string;
}

export const presentationSlides: Slide[] = [
    {
        id: "title_slide",
        title: "TARS",
        subtitle: "TERRORIST ATTACK RESPONSE SYSTEM",
        content: [
            "Decentralized Multi-Agent System with Finite State Machines",
            "DCIT 403 - Intelligent Agents",
            "Lab 3 - Goals, Events, Reactive Behavior",
            "Date: 2026-02-21"
        ],
        type: "title",
        footer: "VERSION 1.0 // P.01"
    },
    {
        id: "problem_statement",
        title: "EMERGENCY RESPONSE UNDER UNCERTAINTY",
        content: [
            "Information is incomplete and unreliable",
            "Response decisions must be made in milliseconds",
            "Centralized control systems often fail or become overloaded",
            "Multiple agencies must coordinate without direct communication",
            "SOLUTION: Decentralized multi-agent systems with reactive behaviors enable rapid, autonomous response."
        ],
        type: "text",
        footer: "TARS_CORE // P.02"
    },
    {
        id: "architecture_overview",
        title: "FOUR-AGENT DECENTRALIZED DEFENSE NETWORK",
        content: [
            "SensorAgent: Detects threats from news APIs and verified user reports.",
            "CoordinatorAgent: Analyzes threats and assigns tasks to response agents.",
            "RescueAgent: Intercepts incoming missiles with drone interceptors."
        ],
        type: "grid",
        footer: "AGENT_DECENTRALIZATION // P.03"
    },
    {
        id: "fsm_fundamentals",
        title: "FSM: THE FOUNDATION OF REACTIVE BEHAVIOR",
        content: [
            "States: Operational modes (IDLE, MONITORING, ALERT_TRIGGERED)",
            "Transitions: Stimuli-driven state changes",
            "Events: Stimuli that cause state changes",
            "Actions: Logic execution during state flow",
            "Predictability: Same input always produces same output"
        ],
        type: "text",
        footer: "LOGIC_CORE // P.04"
    },
    {
        id: "sensor_agent_fsm",
        title: "SENSOR_AGENT: EVENT DETECTION",
        content: [
            "IDLE: Initializing monitoring systems",
            "MONITORING: Continuously polling news APIs and user reports",
            "ALERT_TRIGGERED: Creating and broadcasting alert messages",
            "Response time: 2-3 seconds from detection to alert"
        ],
        type: "text",
        footer: "SENSOR_LOGIC // P.05"
    },
    {
        id: "coordinator_agent_fsm",
        title: "COORDINATOR_AGENT: STRATEGIC DECISION",
        content: [
            "IDLE: Waiting for events from SensorAgent",
            "PROCESSING: Analyzing threat severity (1-10 scale)",
            "ASSIGNING: Creating resource deployment tasks",
            "Decision time: < 2 seconds"
        ],
        type: "text",
        footer: "CMD_LOGIC // P.06"
    },
    {
        id: "rescue_agent_fsm",
        title: "RESCUE_AGENT: GROUND COORDINATION",
        content: [
            "IDLE: Maintaining readiness status",
            "DEPLOYING: Mobilizing troops (50-300 personnel)",
            "ENGAGED: Coordinating ground operations and evacuation",
            "Deployment time: 5-8 minutes for large units"
        ],
        type: "text",
        footer: "GROUND_RESPONSE // P.07"
    },
    {
        id: "dome_defense_fsm",
        title: "DOME_DEFENSE: AIR INTERCEPTION",
        content: [
            "IDLE: Defense systems powered down",
            "TRACKING: Monitoring 300-unit radius dome",
            "INTERCEPTING: Launching drone interceptors",
            "Accuracy: 99.2% | Response time: < 2 seconds"
        ],
        type: "text",
        footer: "AIR_DEFENSE // P.08"
    },
    {
        id: "reactive_behavior",
        title: "REACTIVE BEHAVIOR IN ACTION",
        content: [
            "T+0s: SensorAgent detects attack",
            "T+1s: Alert broadcast to Coordinator",
            "T+2.5s: Threat analyzed (Level: 9)",
            "T+3s: Deployment & Activation commands sent",
            "T+8.5s: Missile detected and intercepted",
            "Total response: 9.4 seconds"
        ],
        type: "trace",
        footer: "EXECUTION_METRICS // P.09"
    },
    {
        id: "execution_trace_audit",
        title: "COMPLETE AUDITABILITY VIA LOGGING",
        content: [
            "Precision: Millisecond-level timestamps",
            "Context: Detailed locational and severity data",
            "Auditability: Complete record of all decisions",
            "Debugging: Visualizing failure points in state flow"
        ],
        type: "text",
        footer: "AUDIT_SYSTEM // P.10"
    },
    {
        id: "system_integration",
        title: "MESSAGE-PASSING ARCHITECTURE",
        content: [
            "Protocol: Asynchronous message passing (XMPP-based)",
            "Decoupling: Agents operate independently",
            "Resilience: Failure of one agent doesn't crash the system",
            "Scalability: Lightweight communication overhead"
        ],
        type: "text",
        footer: "INTEGRATION_CORE // P.11"
    },
    {
        id: "performance_metrics",
        title: "QUANTIFYING SYSTEM EFFECTIVENESS",
        content: [
            "Event Detection: 2.3 sec",
            "Threat Analysis: 1.1 sec",
            "Task Assignment: 0.8 sec",
            "Missile Interception: 1.2 sec",
            "System Uptime: 99.9%"
        ],
        type: "stats",
        footer: "METRIC_SUITE // P.12"
    },
    {
        id: "educational_value",
        title: "EDUCATIONAL VALUE OF TARS",
        content: [
            "FSM Modeling: Visualizing logic and determinism",
            "Multi-Agent Systems: Understanding decentralization",
            "Reactive Behavior: Stimulus-response patterns",
            "Practical AI: Emergency response and robotics"
        ],
        type: "text",
        footer: "ACADEMIC_OUTCOME // P.13"
    },
    {
        id: "technical_stack",
        title: "TECHNICAL IMPLEMENTATION STACK",
        content: [
            "Backend: Python, SPADE, Flask, SocketIO",
            "Frontend: React, TypeScript, Canvas API, D3.js",
            "Protocols: XMPP, Web Sockets, REST",
            "Deployment: Docker, Kubernetes"
        ],
        type: "text",
        footer: "TECH_STACK // P.14"
    },
    {
        id: "challenges_future",
        title: "CHALLENGES & FUTURE WORK",
        content: [
            "Byzantine Fault Tolerance: Handling unreliable comms",
            "Machine Learning: Adapting to evolving threats",
            "Swarm Intelligence: Emergent coordination",
            "Consensus Protocols: Distributed decision making"
        ],
        type: "text",
        footer: "ROADMAP // P.15"
    },
    {
        id: "conclusion",
        title: "CONCLUSION: THE POWER OF REACTIVITY",
        content: [
            "FSMs provide predictable, deterministic behavior",
            "Decentralization ensures operational resilience",
            "Real-time response is achievable through MAS",
            "TARS provides a scalable framework for disaster response"
        ],
        type: "text",
        footer: "SUMMARY_FINAL // P.16"
    },
    {
        id: "references",
        title: "REFERENCES & RESOURCES",
        content: [
            "Russell & Norvig: AI - A Modern Approach",
            "Wooldridge: Introduction to Multi-Agent Systems",
            "Harel: Modeling Reactive Systems with Statecharts",
            "SPADE / React / TARS Documentation"
        ],
        type: "text",
        footer: "END_TRANSMISSION // P.17"
    }
];
