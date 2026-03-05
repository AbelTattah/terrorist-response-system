"""
Agent Manager - Coordinates SPADE agents and Flask-SocketIO communication
"""

import uuid
import asyncio
import logging
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from missile_simulation import trigger_deployment
from models.database import get_db, Event, Agent, ExecutionTrace, Missile, Deployment
from models.schemas import SystemState

logger = logging.getLogger(__name__)


class AgentManager:
    """Manages SPADE agents and system state"""
    
    def __init__(self, socketio):
        """Initialize agent manager"""
        self.socketio = socketio
        self.agents: Dict[str, Dict[str, Any]] = {}
        self.events: List[Dict[str, Any]] = []
        self.traces: List[Dict[str, Any]] = []
        self.missiles: List[Dict[str, Any]] = []
        self.deployments: List[Dict[str, Any]] = []
        self.dome_active = False
        self.simulation_running = False
        
        # Initialize default agents
        self._init_default_agents()
    
    def _init_default_agents(self):
        """Initialize default SPADE agents"""
        agents_config = [
            {
                'id': 'sensor_agent_1',
                'name': 'SensorAgent-1',
                'type': 'sensor',
                'current_state': 'IDLE',
                'status': 'active'
            },
            {
                'id': 'coordinator_agent_1',
                'name': 'CoordinatorAgent-1',
                'type': 'coordinator',
                'current_state': 'IDLE',
                'status': 'active'
            },
            {
                'id': 'rescue_agent_1',
                'name': 'RescueAgent-1',
                'type': 'rescue',
                'current_state': 'IDLE',
                'status': 'active'
            },
        ]
        
        for agent_config in agents_config:
            self.agents[agent_config['id']] = {
                **agent_config,
                'last_updated': datetime.utcnow().isoformat(),
                'created_at': datetime.utcnow().isoformat()
            }
            logger.info(f"Initialized agent: {agent_config['name']}")
    
    def create_event(self, event_type: str, location: Dict[str, float], 
                    severity: str = 'medium', description: str = '') -> Dict[str, Any]:
        """Create a new event"""
        event_id = str(uuid.uuid4())
        
        event = {
            'id': event_id,
            'type': event_type,
            'location': location,
            'severity': severity,
            'description': description,
            'detected_at': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat()
        }
        
        self.events.append(event)
        # Cap events to last 100
        if len(self.events) > 100:
            self.events.pop(0)
        
        # Log trace
        self.log_trace(
            agent_id='sensor_agent_1',
            event_type='event_detected',
            message=f"Event detected: {event_type} at {location}",
            details={'event_id': event_id, 'severity': severity}
        )
        
        # Broadcast to frontend
        self.socketio.emit('event_created', event)
        
        # Trigger coordinator agent
        self._trigger_coordinator(event)
        
        logger.info(f"Event created: {event_id} - {event_type}")
        return event
    
    def _trigger_coordinator(self, event: Dict[str, Any]):
        """Trigger coordinator agent to process event"""
        # Update coordinator state
        self.update_agent_state(
            agent_id='coordinator_agent_1',
            new_state='PROCESSING',
            message=f"Processing event: {event['type']}"
        )
        
        # Simulate decision making
        if event['severity'] in ['high', 'critical']:
            # Trigger rescue deployment
            self.deploy_troops(
                location=event['location'],
                unit_size='large' if event['severity'] == 'critical' else 'standard'
            )
            
            # Activate dome if attack
            if event['type'] == 'attack':
                self.activate_dome()
    
    def update_agent_state(self, agent_id: str, new_state: str, message: str = ''):
        """Update agent state"""
        if agent_id not in self.agents:
            logger.warning(f"Agent not found: {agent_id}")
            return
        
        old_state = self.agents[agent_id]['current_state']
        self.agents[agent_id]['current_state'] = new_state
        self.agents[agent_id]['last_updated'] = datetime.utcnow().isoformat()
        
        # Log trace
        self.log_trace(
            agent_id=agent_id,
            event_type='state_change',
            from_state=old_state,
            to_state=new_state,
            message=message
        )
        
        # Broadcast state change
        self.socketio.emit(
            'agent_state_changed',
            {
                'agent_id': agent_id,
                'from_state': old_state,
                'to_state': new_state,
                'message': message,
                'timestamp': datetime.utcnow().isoformat()
            }
        )
        
        logger.info(f"Agent {agent_id} state changed: {old_state} -> {new_state}")
    
    def deploy_troops(self, location: Dict[str, float], unit_size: str = 'standard') -> Dict[str, Any]:
        """Deploy troops to location"""
        deployment_id = str(uuid.uuid4())
        
        deployment = {
            'id': deployment_id,
            'location': location,
            'unit_size': unit_size,
            'status': 'deploying',
            'created_at': datetime.utcnow().isoformat(),
            'arrived_at': None
        }
        
        # Trigger real-time physics simulation for troop movement
        # Convert {x,y} to lat/lon for the physics engine coordinates
        physics_id = trigger_deployment(location['x'], location['y'], unit_size)
        deployment['physics_id'] = physics_id
        
        self.deployments.append(deployment)
        
        # Update rescue agent state
        self.update_agent_state(
            agent_id='rescue_agent_1',
            new_state='DEPLOYING',
            message=f"Deploying {unit_size} unit to {location}"
        )
        
        # Log trace
        self.log_trace(
            agent_id='rescue_agent_1',
            event_type='action',
            message=f"Troops deployed: {unit_size} unit",
            details={'deployment_id': deployment_id, 'location': location}
        )
        
        # Broadcast deployment
        self.socketio.emit('troops_deployed', deployment)
        
        logger.info(f"Troops deployed: {deployment_id}")
        return deployment
    
    def activate_dome(self) -> Dict[str, Any]:
        """Activate dome defense system"""
        if self.dome_active:
            return {'status': 'already_active', 'message': 'Dome is already active'}
        
        self.dome_active = True
        
        # Update dome agent state
        self.update_agent_state(
            agent_id='dome_agent_1',
            new_state='ACTIVE',
            message='Dome defense system activated'
        )
        
        # Log trace
        self.log_trace(
            agent_id='dome_agent_1',
            event_type='action',
            message='Dome defense system activated'
        )
        
        # Broadcast dome activation
        result = {
            'status': 'activated',
            'message': 'Dome defense system activated',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.socketio.emit('dome_activated', result)
        
        logger.info("Dome defense system activated")
        return result
    
    def deactivate_dome(self) -> Dict[str, Any]:
        """Deactivate dome defense system"""
        if not self.dome_active:
            return {'status': 'already_inactive', 'message': 'Dome is already inactive'}
        
        self.dome_active = False
        
        # Update dome agent state
        self.update_agent_state(
            agent_id='dome_agent_1',
            new_state='IDLE',
            message='Dome defense system deactivated'
        )
        
        # Log trace
        self.log_trace(
            agent_id='dome_agent_1',
            event_type='action',
            message='Dome defense system deactivated'
        )
        
        # Broadcast dome deactivation
        result = {
            'status': 'deactivated',
            'message': 'Dome defense system deactivated',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.socketio.emit('dome_deactivated', result)
        
        logger.info("Dome defense system deactivated")
        return result
    
    def simulate_missile(self, target: Dict[str, float]) -> Dict[str, Any]:
        """Simulate incoming missile"""
        missile_id = str(uuid.uuid4())
        
        # Random starting position (outside dome)
        import random
        location = {
            'x': random.choice([random.uniform(-100, 0), random.uniform(1000, 1100)]),
            'y': random.choice([random.uniform(-100, 0), random.uniform(1000, 1100)])
        }
        
        missile = {
            'id': missile_id,
            'location': location,
            'target': target,
            'status': 'incoming',
            'interceptor_id': None,
            'created_at': datetime.utcnow().isoformat(),
            'intercepted_at': None
        }
        
        self.missiles.append(missile)
        
        # Update dome agent state
        self.update_agent_state(
            agent_id='dome_agent_1',
            new_state='TRACKING',
            message=f"Missile detected: {missile_id}"
        )
        
        # Log trace
        self.log_trace(
            agent_id='dome_agent_1',
            event_type='event',
            message='Missile detected',
            details={'missile_id': missile_id, 'target': target}
        )
        
        # Broadcast missile
        self.socketio.emit('missile_detected', missile)
        
        logger.info(f"Missile simulated: {missile_id}")
        return missile
    
    def intercept_missile(self, missile_id: str) -> Dict[str, Any]:
        """Intercept missile with interceptor drone"""
        # Find missile
        missile = next((m for m in self.missiles if m['id'] == missile_id), None)
        if not missile:
            return {'status': 'error', 'message': 'Missile not found'}
        
        interceptor_id = str(uuid.uuid4())
        missile['status'] = 'intercepted'
        missile['interceptor_id'] = interceptor_id
        missile['intercepted_at'] = datetime.utcnow().isoformat()
        
        # Update dome agent state
        self.update_agent_state(
            agent_id='dome_agent_1',
            new_state='INTERCEPTING',
            message=f"Missile intercepted: {missile_id}"
        )
        
        # Log trace
        self.log_trace(
            agent_id='dome_agent_1',
            event_type='action',
            message=f"Missile intercepted",
            details={'missile_id': missile_id, 'interceptor_id': interceptor_id}
        )
        
        # Broadcast interception
        result = {
            'missile_id': missile_id,
            'interceptor_id': interceptor_id,
            'status': 'intercepted',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.socketio.emit('missile_intercepted', result)
        
        logger.info(f"Missile intercepted: {missile_id}")
        return result
    
    def log_trace(self, agent_id: str, event_type: str, from_state: str = None,
                 to_state: str = None, message: str = '', details: Dict = None):
        """Log execution trace"""
        trace_id = str(uuid.uuid4())
        
        trace = {
            'id': trace_id,
            'agent_id': agent_id,
            'event_type': event_type,
            'from_state': from_state,
            'to_state': to_state,
            'message': message,
            'details': details or {},
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.traces.append(trace)
        # Cap traces to last 500 to prevent memory leaks during long runs
        if len(self.traces) > 500:
            self.traces.pop(0)
        
        # Broadcast trace
        self.socketio.emit('trace_recorded', trace)
        
        logger.debug(f"Trace logged: {trace_id}")
    
    def get_events(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get events"""
        return self.events[offset:offset + limit]
    
    def get_traces(self, limit: int = 100, agent_id: str = None) -> List[Dict[str, Any]]:
        """Get execution traces"""
        traces = self.traces
        if agent_id:
            traces = [t for t in traces if t['agent_id'] == agent_id]
        return traces[-limit:]
    
    def get_system_state(self) -> Dict[str, Any]:
        """Get current system state"""
        return {
            'agents': list(self.agents.values()),
            'events': self.events[-10:],  # Last 10 events
            'missiles': self.missiles,
            'deployments': self.deployments,
            'dome_active': self.dome_active,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def get_simulation_status(self) -> Dict[str, Any]:
        """Get simulation status"""
        return {
            'running': self.simulation_running,
            'dome_active': self.dome_active,
            'agents_count': len(self.agents),
            'events_count': len(self.events),
            'missiles_count': len(self.missiles),
            'deployments_count': len(self.deployments),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def process_voice_command(self, command: str) -> Dict[str, Any]:
        """Process voice command"""
        command_lower = command.lower()
        
        if 'deploy' in command_lower and 'troops' in command_lower:
            return {
                'status': 'executing',
                'action': 'deploy_troops',
                'message': 'Deploying troops to detected location'
            }
        elif 'activate' in command_lower and 'dome' in command_lower:
            return {
                'status': 'executing',
                'action': 'activate_dome',
                'message': 'Activating dome defense system'
            }
        elif 'status' in command_lower:
            return {
                'status': 'success',
                'action': 'query_status',
                'message': 'System status queried',
                'details': self.get_simulation_status()
            }
        else:
            return {
                'status': 'unknown',
                'action': None,
                'message': f'Unknown command: {command}'
            }
