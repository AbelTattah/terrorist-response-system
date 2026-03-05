"""
SPADE-inspired Agent implementations with FSM behaviors
Uses local in-memory message bus for reliable autonomous operation
"""

import asyncio
import logging
import time
from collections import defaultdict

logger = logging.getLogger(__name__)

# --- Local Message Bus -------------------------------------------------------
# Replaces XMPP with a lightweight asyncio-based message queue system
# Each agent has its own inbox queue for receiving messages

class MessageBus:
    """In-memory message bus for inter-agent communication"""
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def __init__(self):
        self.queues = defaultdict(asyncio.Queue)
        self.agents = {}
        logger.info("MessageBus: Local message bus initialized")
    
    def register_agent(self, agent_id, agent):
        self.agents[agent_id] = agent
        logger.info(f"MessageBus: Registered agent '{agent_id}'")
    
    async def send(self, from_id, to_id, body, metadata=None):
        msg = {
            'from': from_id,
            'to': to_id,
            'body': body,
            'metadata': metadata or {},
            'timestamp': time.time()
        }
        await self.queues[to_id].put(msg)
        logger.debug(f"MessageBus: Message from '{from_id}' to '{to_id}': {body[:60]}")
    
    async def receive(self, agent_id, timeout=5):
        try:
            msg = await asyncio.wait_for(self.queues[agent_id].get(), timeout=timeout)
            return msg
        except asyncio.TimeoutError:
            return None


# --- FSM States --------------------------------------------------------------

SENSOR_IDLE = "SENSOR_IDLE"
SENSOR_MONITORING = "SENSOR_MONITORING"
SENSOR_ALERT_TRIGGERED = "SENSOR_ALERT_TRIGGERED"

COORDINATOR_IDLE = "COORDINATOR_IDLE"
COORDINATOR_PROCESSING = "COORDINATOR_PROCESSING"
COORDINATOR_ASSIGNING = "COORDINATOR_ASSIGNING"

DOME_IDLE = "DOME_IDLE"
DOME_TRACKING = "DOME_TRACKING"
DOME_INTERCEPTING = "DOME_INTERCEPTING"


# --- Base Agent Class --------------------------------------------------------

class LocalAgent:
    """Base agent with FSM support using local message bus"""
    
    def __init__(self, agent_id):
        self.agent_id = agent_id
        self.bus = MessageBus.get_instance()
        self.bus.register_agent(agent_id, self)
        self.current_state = None
        self.states = {}
        self.transitions = set()
        self.initial_state = None
        self._running = False
        self._task = None
    
    def add_state(self, name, handler, initial=False):
        self.states[name] = handler
        if initial:
            self.initial_state = name
            self.current_state = name
    
    def add_transition(self, source, dest):
        self.transitions.add((source, dest))
    
    async def send(self, to_id, body, metadata=None):
        await self.bus.send(self.agent_id, to_id, body, metadata)
    
    async def receive(self, timeout=5):
        return await self.bus.receive(self.agent_id, timeout)
    
    async def setup(self):
        """Override in subclass"""
        pass
    
    async def start(self):
        await self.setup()
        self._running = True
        self._task = asyncio.ensure_future(self._run_fsm())
        logger.info(f"Agent {self.agent_id} connected and authenticated.")
    
    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
    
    async def _run_fsm(self):
        logger.info(f"{self.agent_id} FSM starting at state {self.current_state}")
        while self._running:
            try:
                handler = self.states.get(self.current_state)
                if handler:
                    next_state = await handler(self)
                    if next_state and next_state != self.current_state:
                        if (self.current_state, next_state) in self.transitions:
                            logger.info(f"{self.agent_id} FSM transiting from {self.current_state} to {next_state}.")
                            self.current_state = next_state
                        elif next_state == self.current_state:
                            pass  # Same-state transition, no logging needed
                        else:
                            logger.warning(f"{self.agent_id} FSM: Transition {self.current_state} -> {next_state} not registered!")
                    elif next_state == self.current_state:
                        pass  # quiet idle cycling
                else:
                    await asyncio.sleep(1)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"{self.agent_id} FSM error: {e}")
                await asyncio.sleep(1)
        logger.info(f"{self.agent_id} FSM finished at state {self.current_state}")


# --- Sensor Agent ------------------------------------------------------------

class SensorAgent(LocalAgent):
    """Sensor Agent - Detects disaster events from environment"""
    
    def __init__(self):
        super().__init__("sensor")
    
    async def setup(self):
        logger.info(f"SensorAgent setup: {self.agent_id}")
        logger.info("SensorAgent: Defining sensor goals - Monitor environment for threats and anomalies")
        logger.info("SensorAgent: Implementing reactive behavior using Finite State Machine (FSMs)")
        
        self.add_state(SENSOR_IDLE, self.state_idle, initial=True)
        self.add_state(SENSOR_MONITORING, self.state_monitoring)
        self.add_state(SENSOR_ALERT_TRIGGERED, self.state_alert_triggered)
        
        self.add_transition(SENSOR_IDLE, SENSOR_IDLE)
        self.add_transition(SENSOR_IDLE, SENSOR_MONITORING)
        self.add_transition(SENSOR_MONITORING, SENSOR_MONITORING)
        self.add_transition(SENSOR_MONITORING, SENSOR_ALERT_TRIGGERED)
        self.add_transition(SENSOR_ALERT_TRIGGERED, SENSOR_MONITORING)
    
    async def state_idle(self, agent):
        """Idle state - waiting for monitoring command"""
        msg = await agent.receive(timeout=5)
        if msg:
            logger.info(f"SensorAgent: Received command: {msg['body']}")
            return SENSOR_MONITORING
        return SENSOR_IDLE
    
    async def state_monitoring(self, agent):
        """Monitoring state - checking for events"""
        logger.debug("SensorAgent: Monitoring state - scanning for threats...")
        
        msg = await agent.receive(timeout=3)
        if msg:
            logger.info(f"SensorAgent: Triggering events from sensor reports - Event detected: {msg['body']}")
            # Send alert to coordinator
            await agent.send("coordinator", f"EVENT_DETECTED:{msg['body']}", {"performative": "inform"})
            return SENSOR_ALERT_TRIGGERED
        return SENSOR_MONITORING
    
    async def state_alert_triggered(self, agent):
        """Alert triggered - event detected, waiting for acknowledgment"""
        logger.info("SensorAgent: Alert triggered - waiting for coordinator acknowledgment")
        
        msg = await agent.receive(timeout=5)
        if msg and "ACK" in msg['body']:
            logger.info("SensorAgent: Alert acknowledged by coordinator")
        else:
            logger.info("SensorAgent: No acknowledgment received - returning to monitoring")
        return SENSOR_MONITORING


# --- Coordinator Agent -------------------------------------------------------

class CoordinatorAgent(LocalAgent):
    """Coordinator Agent - Processes events and assigns tasks"""
    
    def __init__(self):
        super().__init__("coordinator")
        self._last_event = None
    
    async def setup(self):
        logger.info(f"CoordinatorAgent setup: {self.agent_id}")
        logger.info("CoordinatorAgent: Defining coordination goals - Process events and deploy response units")
        logger.info("CoordinatorAgent: Implementing reactive behavior using Finite State Machine (FSMs)")
        
        self.add_state(COORDINATOR_IDLE, self.state_idle, initial=True)
        self.add_state(COORDINATOR_PROCESSING, self.state_processing)
        self.add_state(COORDINATOR_ASSIGNING, self.state_assigning)
        
        self.add_transition(COORDINATOR_IDLE, COORDINATOR_IDLE)
        self.add_transition(COORDINATOR_IDLE, COORDINATOR_PROCESSING)
        self.add_transition(COORDINATOR_PROCESSING, COORDINATOR_ASSIGNING)
        self.add_transition(COORDINATOR_ASSIGNING, COORDINATOR_IDLE)
    
    async def state_idle(self, agent):
        """Idle state - waiting for events from sensor"""
        msg = await agent.receive(timeout=5)
        if msg and "EVENT_DETECTED" in msg['body']:
            logger.info(f"CoordinatorAgent: Event received: {msg['body']}")
            self._last_event = msg
            return COORDINATOR_PROCESSING
        return COORDINATOR_IDLE
    
    async def state_processing(self, agent):
        """Processing state - analyzing event"""
        logger.info("CoordinatorAgent: Processing and analyzing event severity...")
        await asyncio.sleep(1)
        
        # Send acknowledgment to sensor
        if self._last_event:
            await agent.send(self._last_event['from'], "ACK: Event received and being processed", {"performative": "inform"})
            logger.info("CoordinatorAgent: Sent ACK to sensor agent")
        
        return COORDINATOR_ASSIGNING
    
    async def state_assigning(self, agent):
        """Assigning state - dispatching rescue units"""
        logger.info("CoordinatorAgent: Assigning rescue deployment tasks...")
        
        await agent.send("rescue", "DEPLOY_TROOPS", {"performative": "request"})
        logger.info("CoordinatorAgent: Task assigned to rescue agent - DEPLOY_TROOPS")
        
        return COORDINATOR_IDLE


# --- Dome Defense Agent ------------------------------------------------------

class RescueAgent(LocalAgent):
    """Dome Defense Agent - Intercepts incoming missiles"""
    
    def __init__(self):
        super().__init__("dome")
    
    async def setup(self):
        logger.info(f"RescueAgent setup: {self.agent_id}")
        logger.info("RescueAgent: Defining response goals - Intercept and neutralize incoming threats")
        logger.info("RescueAgent: Implementing reactive behavior using Finite State Machine (FSMs)")
        
        self.add_state(DOME_IDLE, self.state_idle, initial=True)
        self.add_state(DOME_TRACKING, self.state_tracking)
        self.add_state(DOME_INTERCEPTING, self.state_intercepting)
        
        self.add_transition(DOME_IDLE, DOME_IDLE)
        self.add_transition(DOME_IDLE, DOME_TRACKING)
        self.add_transition(DOME_TRACKING, DOME_TRACKING)
        self.add_transition(DOME_TRACKING, DOME_INTERCEPTING)
        self.add_transition(DOME_INTERCEPTING, DOME_TRACKING)
    
    async def state_idle(self, agent):
        """Idle state - waiting for activation"""
        msg = await agent.receive(timeout=5)
        if msg and "ACTIVATE" in msg['body']:
            logger.info("RescueAgent: Activation command received - powering up tracking systems")
            return DOME_TRACKING
        return DOME_IDLE
    
    async def state_tracking(self, agent):
        """Tracking state - scanning skies for missiles"""
        logger.debug("RescueAgent: Tracking state - scanning for incoming projectiles...")
        
        msg = await agent.receive(timeout=3)
        if msg and "MISSILE" in msg['body']:
            logger.info(f"RescueAgent: MISSILE DETECTED: {msg['body']}")
            return DOME_INTERCEPTING
        return DOME_TRACKING
    
    async def state_intercepting(self, agent):
        """Intercepting state - launching interceptor"""
        logger.info("RescueAgent: Launching interceptor drone...")
        await asyncio.sleep(1)
        logger.info("RescueAgent: Missile intercepted and neutralized successfully!")
        return DOME_TRACKING


# --- Agent Startup -----------------------------------------------------------

async def start_agents():
    """Start all agents with the local message bus"""
    logger.info("Starting SPADE-inspired autonomous agents...")
    
    try:
        # Reset the message bus for a fresh start
        MessageBus._instance = None
        
        sensor = SensorAgent()
        coordinator = CoordinatorAgent()
        rescue = RescueAgent()
        dome = RescueAgent()
        
        await sensor.start()
        await asyncio.sleep(0.5)
        
        await coordinator.start()
        await asyncio.sleep(0.5)
        
        await rescue.start()
        await asyncio.sleep(0.5)
        
        await dome.start()
        await asyncio.sleep(0.5)
        
        logger.info("All autonomous agents started successfully")
        
        return {
            'sensor': sensor,
            'coordinator': coordinator,
            'rescue': rescue,
            'dome': dome
        }
    
    except Exception as e:
        logger.error(f"Error starting agents: {e}")
        import traceback
        traceback.print_exc()
        return None
