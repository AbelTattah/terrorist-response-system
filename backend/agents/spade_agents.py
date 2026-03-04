"""
SPADE Agent implementations with FSM behaviors
"""

import asyncio
import logging
from spade.agent import Agent
from spade.behaviour import FSMBehaviour, State, CyclicBehaviour
from spade.message import Message
import aiohttp

logger = logging.getLogger(__name__)

# FSM States
SENSOR_IDLE = "SENSOR_IDLE"
SENSOR_MONITORING = "SENSOR_MONITORING"
SENSOR_ALERT_TRIGGERED = "SENSOR_ALERT_TRIGGERED"

COORDINATOR_IDLE = "COORDINATOR_IDLE"
COORDINATOR_PROCESSING = "COORDINATOR_PROCESSING"
COORDINATOR_ASSIGNING = "COORDINATOR_ASSIGNING"

RESCUE_IDLE = "RESCUE_IDLE"
RESCUE_DEPLOYING = "RESCUE_DEPLOYING"
RESCUE_ENGAGED = "RESCUE_ENGAGED"

DOME_IDLE = "DOME_IDLE"
DOME_TRACKING = "DOME_TRACKING"
DOME_INTERCEPTING = "DOME_INTERCEPTING"


class SensorAgentFSM(FSMBehaviour):
    """Sensor Agent FSM - Detects events from news API and user reports"""
    
    async def on_start(self):
        logger.info(f"SensorAgent FSM starting at state {self.current_state}")
    
    async def on_end(self):
        logger.info(f"SensorAgent FSM finished at state {self.current_state}")


class SensorIdleState(State):
    """Idle state - waiting for monitoring command"""
    
    async def run(self):
        logger.debug("SensorAgent: Idle state")
        # Wait for message to start monitoring
        msg = await self.receive(timeout=5)
        if msg:
            logger.info(f"SensorAgent: Received command: {msg.body}")
            self.set_next_state(SENSOR_MONITORING)
        else:
            # Stay in idle
            self.set_next_state(SENSOR_IDLE)


class SensorMonitoringState(State):
    """Monitoring state - checking for events"""
    
    async def run(self):
        logger.debug("SensorAgent: Monitoring state")
        
        # Simulate checking news API and user reports
        # In production, this would call actual APIs
        
        # Check for incoming events
        msg = await self.receive(timeout=3)
        if msg:
            logger.info(f"SensorAgent: Triggering events from sensor reports - Event detected: {msg.body}")
            # Send alert to coordinator
            alert_msg = Message(to="coordinator@localhost")
            alert_msg.set_metadata("performative", "inform")
            alert_msg.body = f"EVENT_DETECTED:{msg.body}"
            await self.send(alert_msg)
            self.set_next_state(SENSOR_ALERT_TRIGGERED)
        else:
            # Continue monitoring
            self.set_next_state(SENSOR_MONITORING)


class SensorAlertTriggeredState(State):
    """Alert triggered state - event detected"""
    
    async def run(self):
        logger.debug("SensorAgent: Alert triggered state")
        
        # Wait for acknowledgment from coordinator
        msg = await self.receive(timeout=5)
        if msg and "ACK" in msg.body:
            logger.info("SensorAgent: Alert acknowledged by coordinator")
            self.set_next_state(SENSOR_MONITORING)
        else:
            # Timeout - return to monitoring
            self.set_next_state(SENSOR_MONITORING)


class SensorAgent(Agent):
    """Sensor Agent - Detects disaster events"""
    
    async def setup(self):
        logger.info(f"SensorAgent setup: {self.jid}")
        
        fsm = SensorAgentFSM()
        fsm.add_state(name=SENSOR_IDLE, state=SensorIdleState(), initial=True)
        fsm.add_state(name=SENSOR_MONITORING, state=SensorMonitoringState())
        fsm.add_state(name=SENSOR_ALERT_TRIGGERED, state=SensorAlertTriggeredState())
        
        fsm.add_transition(source=SENSOR_IDLE, dest=SENSOR_MONITORING)
        fsm.add_transition(source=SENSOR_MONITORING, dest=SENSOR_ALERT_TRIGGERED)
        fsm.add_transition(source=SENSOR_MONITORING, dest=SENSOR_MONITORING)
        fsm.add_transition(source=SENSOR_ALERT_TRIGGERED, dest=SENSOR_MONITORING)
        
        self.add_behaviour(fsm)


class CoordinatorAgentFSM(FSMBehaviour):
    """Coordinator Agent FSM - Processes events and assigns tasks"""
    
    async def on_start(self):
        logger.info(f"CoordinatorAgent FSM starting at state {self.current_state}")
    
    async def on_end(self):
        logger.info(f"CoordinatorAgent FSM finished at state {self.current_state}")


class CoordinatorIdleState(State):
    """Idle state - waiting for events"""
    
    async def run(self):
        logger.debug("CoordinatorAgent: Idle state")
        
        # Wait for event from sensor
        msg = await self.receive(timeout=5)
        if msg and "EVENT_DETECTED" in msg.body:
            logger.info(f"CoordinatorAgent: Event received: {msg.body}")
            self.set_next_state(COORDINATOR_PROCESSING)
        else:
            self.set_next_state(COORDINATOR_IDLE)


class CoordinatorProcessingState(State):
    """Processing state - analyzing event"""
    
    async def run(self):
        logger.debug("CoordinatorAgent: Processing state")
        
        # Simulate event analysis
        await asyncio.sleep(1)
        
        # Send acknowledgment to sensor
        msg = await self.receive(timeout=1)
        if msg:
            sensor_ack = Message(to=msg.sender)
            sensor_ack.set_metadata("performative", "inform")
            sensor_ack.body = "ACK"
            await self.send(sensor_ack)
        
        self.set_next_state(COORDINATOR_ASSIGNING)


class CoordinatorAssigningState(State):
    """Assigning state - assigning tasks to rescue agents"""
    
    async def run(self):
        logger.debug("CoordinatorAgent: Assigning state")
        
        # Send task assignment to rescue agent
        task_msg = Message(to="rescue@localhost")
        task_msg.set_metadata("performative", "request")
        task_msg.body = "DEPLOY_TROOPS"
        await self.send(task_msg)
        
        logger.info("CoordinatorAgent: Task assigned to rescue agent")
        self.set_next_state(COORDINATOR_IDLE)


class CoordinatorAgent(Agent):
    """Coordinator Agent - Processes events and coordinates response"""
    
    async def setup(self):
        logger.info(f"CoordinatorAgent setup: {self.jid}")
        
        fsm = CoordinatorAgentFSM()
        fsm.add_state(name=COORDINATOR_IDLE, state=CoordinatorIdleState(), initial=True)
        fsm.add_state(name=COORDINATOR_PROCESSING, state=CoordinatorProcessingState())
        fsm.add_state(name=COORDINATOR_ASSIGNING, state=CoordinatorAssigningState())
        
        fsm.add_transition(source=COORDINATOR_IDLE, dest=COORDINATOR_PROCESSING)
        fsm.add_transition(source=COORDINATOR_PROCESSING, dest=COORDINATOR_ASSIGNING)
        fsm.add_transition(source=COORDINATOR_ASSIGNING, dest=COORDINATOR_IDLE)
        
        self.add_behaviour(fsm)


class RescueAgentFSM(FSMBehaviour):
    """Rescue Agent FSM - Deploys troops"""
    
    async def on_start(self):
        logger.info(f"RescueAgent FSM starting at state {self.current_state}")
        # Define rescue goals and reactive behavior
        logger.info(f"RescueAgent: Defining rescue goals - Deploy troops to mitigate threats and secure area")
        logger.info(f"RescueAgent: Implementing reactive behavior using Finite State Machine (FSMs)")
    
    async def on_end(self):
        logger.info(f"RescueAgent FSM finished at state {self.current_state}")


class RescueIdleState(State):
    """Idle state - waiting for deployment command"""
    
    async def run(self):
        logger.debug("RescueAgent: Idle state")
        
        msg = await self.receive(timeout=5)
        if msg and "DEPLOY_TROOPS" in msg.body:
            logger.info("RescueAgent: Deployment command received")
            self.set_next_state(RESCUE_DEPLOYING)
        else:
            self.set_next_state(RESCUE_IDLE)


class RescueDeployingState(State):
    """Deploying state - sending troops"""
    
    async def run(self):
        logger.debug("RescueAgent: Deploying state")
        
        # Simulate troop deployment
        await asyncio.sleep(2)
        
        logger.info("RescueAgent: Troops deployed")
        self.set_next_state(RESCUE_ENGAGED)


class RescueEngagedState(State):
    """Engaged state - troops active"""
    
    async def run(self):
        logger.debug("RescueAgent: Engaged state")
        
        # Wait for completion signal
        await asyncio.sleep(3)
        
        logger.info("RescueAgent: Mission complete")
        self.set_next_state(RESCUE_IDLE)


class RescueAgent(Agent):
    """Rescue Agent - Deploys troops for rescue operations"""
    
    async def setup(self):
        logger.info(f"RescueAgent setup: {self.jid}")
        
        fsm = RescueAgentFSM()
        fsm.add_state(name=RESCUE_IDLE, state=RescueIdleState(), initial=True)
        fsm.add_state(name=RESCUE_DEPLOYING, state=RescueDeployingState())
        fsm.add_state(name=RESCUE_ENGAGED, state=RescueEngagedState())
        
        fsm.add_transition(source=RESCUE_IDLE, dest=RESCUE_DEPLOYING)
        fsm.add_transition(source=RESCUE_DEPLOYING, dest=RESCUE_ENGAGED)
        fsm.add_transition(source=RESCUE_ENGAGED, dest=RESCUE_IDLE)
        
        self.add_behaviour(fsm)


class DomeDefenseAgentFSM(FSMBehaviour):
    """Dome Defense Agent FSM - Intercepts missiles"""
    
    async def on_start(self):
        logger.info(f"DomeDefenseAgent FSM starting at state {self.current_state}")
        # Define response goals and reactive behavior
        logger.info(f"DomeDefenseAgent: Defining response goals - Intercept and neutralize incoming threats")
        logger.info(f"DomeDefenseAgent: Implementing reactive behavior using Finite State Machine (FSMs)")
    
    async def on_end(self):
        logger.info(f"DomeDefenseAgent FSM finished at state {self.current_state}")


class DomeIdleState(State):
    """Idle state - waiting for activation"""
    
    async def run(self):
        logger.debug("DomeDefenseAgent: Idle state")
        
        msg = await self.receive(timeout=5)
        if msg and "ACTIVATE" in msg.body:
            logger.info("DomeDefenseAgent: Activation command received")
            self.set_next_state(DOME_TRACKING)
        else:
            self.set_next_state(DOME_IDLE)


class DomeTrackingState(State):
    """Tracking state - monitoring for missiles"""
    
    async def run(self):
        logger.debug("DomeDefenseAgent: Tracking state")
        
        msg = await self.receive(timeout=3)
        if msg and "MISSILE" in msg.body:
            logger.info(f"DomeDefenseAgent: Missile detected: {msg.body}")
            self.set_next_state(DOME_INTERCEPTING)
        else:
            self.set_next_state(DOME_TRACKING)


class DomeInterceptingState(State):
    """Intercepting state - launching interceptor drones"""
    
    async def run(self):
        logger.debug("DomeDefenseAgent: Intercepting state")
        
        # Simulate interception
        await asyncio.sleep(1)
        
        logger.info("DomeDefenseAgent: Missile intercepted")
        self.set_next_state(DOME_TRACKING)


class DomeDefenseAgent(Agent):
    """Dome Defense Agent - Intercepts incoming missiles"""
    
    async def setup(self):
        logger.info(f"DomeDefenseAgent setup: {self.jid}")
        
        fsm = DomeDefenseAgentFSM()
        fsm.add_state(name=DOME_IDLE, state=DomeIdleState(), initial=True)
        fsm.add_state(name=DOME_TRACKING, state=DomeTrackingState())
        fsm.add_state(name=DOME_INTERCEPTING, state=DomeInterceptingState())
        
        fsm.add_transition(source=DOME_IDLE, dest=DOME_TRACKING)
        fsm.add_transition(source=DOME_TRACKING, dest=DOME_INTERCEPTING)
        fsm.add_transition(source=DOME_TRACKING, dest=DOME_TRACKING)
        fsm.add_transition(source=DOME_INTERCEPTING, dest=DOME_TRACKING)
        
        self.add_behaviour(fsm)


async def start_agents():
    """Start all SPADE agents"""
    logger.info("Starting SPADE agents...")
    
    try:
        # Create agents
        sensor = SensorAgent("sensor@localhost", "password")
        coordinator = CoordinatorAgent("coordinator@localhost", "password")
        rescue = RescueAgent("rescue@localhost", "password")
        dome = DomeDefenseAgent("dome@localhost", "password")
        
        # Start agents
        await sensor.start()
        await coordinator.start()
        await rescue.start()
        await dome.start()
        
        logger.info("All SPADE agents started successfully")
        
        return {
            'sensor': sensor,
            'coordinator': coordinator,
            'rescue': rescue,
            'dome': dome
        }
    
    except Exception as e:
        logger.error(f"Error starting agents: {e}")
        return None
