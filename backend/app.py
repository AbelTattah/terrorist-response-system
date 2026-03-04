"""
TARS (Terrorist Attack Response System) - Flask Backend
Main application entry point with Flask-SocketIO integration
"""

import os
import asyncio
import logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from dotenv import load_dotenv
from agents.agent_manager import AgentManager
from models.database import init_db, get_db
from models.schemas import Event, AgentState, ExecutionTrace

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("tars_agents.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'tars-secret-key-dev')
app.config['JSON_SORT_KEYS'] = False

# Initialize Flask-SocketIO
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    logger=False,
    engineio_logger=False
)

# Global agent manager
agent_manager = None


def create_app():
    """Application factory"""
    global agent_manager
    
    # Initialize database
    init_db(app)
    
    # Initialize agent manager
    agent_manager = AgentManager(socketio)
    
    # Register blueprints and routes
    register_routes()
    register_socketio_handlers()
    
    return app


def register_routes():
    """Register Flask REST API routes"""
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'agents_active': len(agent_manager.agents) if agent_manager else 0
        })
    
    @app.route('/api/agents', methods=['GET'])
    def get_agents():
        """Get all agents and their states"""
        if not agent_manager:
            return jsonify({'error': 'Agent manager not initialized'}), 500
        
        agents_data = []
        for agent_id, agent_info in agent_manager.agents.items():
            agents_data.append({
                'id': agent_id,
                'name': agent_info.get('name'),
                'type': agent_info.get('type'),
                'state': agent_info.get('current_state'),
                'status': agent_info.get('status'),
                'last_updated': agent_info.get('last_updated')
            })
        
        return jsonify({'agents': agents_data})
    
    @app.route('/api/agents/<agent_id>', methods=['GET'])
    def get_agent(agent_id):
        """Get specific agent details"""
        if not agent_manager or agent_id not in agent_manager.agents:
            return jsonify({'error': 'Agent not found'}), 404
        
        agent_info = agent_manager.agents[agent_id]
        return jsonify(agent_info)
    
    @app.route('/api/events', methods=['GET'])
    def get_events():
        """Get recent events"""
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        if not agent_manager:
            return jsonify({'error': 'Agent manager not initialized'}), 500
        
        events = agent_manager.get_events(limit=limit, offset=offset)
        return jsonify({'events': events, 'total': len(events)})
    
    @app.route('/api/events', methods=['POST'])
    def create_event():
        """Create a new event (trigger sensor)"""
        data = request.get_json()
        
        if not agent_manager:
            return jsonify({'error': 'Agent manager not initialized'}), 500
        
        event = agent_manager.create_event(
            event_type=data.get('type'),
            location=data.get('location'),
            severity=data.get('severity', 'medium'),
            description=data.get('description')
        )
        
        return jsonify(event), 201
    
    @app.route('/api/traces', methods=['GET'])
    def get_traces():
        """Get execution traces"""
        limit = request.args.get('limit', 100, type=int)
        agent_id = request.args.get('agent_id')
        
        if not agent_manager:
            return jsonify({'error': 'Agent manager not initialized'}), 500
        
        traces = agent_manager.get_traces(limit=limit, agent_id=agent_id)
        return jsonify({'traces': traces})
    
    @app.route('/api/commands/deploy-troops', methods=['POST'])
    def deploy_troops():
        """Command to deploy troops"""
        data = request.get_json()
        
        if not agent_manager:
            return jsonify({'error': 'Agent manager not initialized'}), 500
        
        result = agent_manager.deploy_troops(
            location=data.get('location'),
            unit_size=data.get('unit_size', 'standard')
        )
        
        return jsonify(result)
    
    @app.route('/api/commands/activate-dome', methods=['POST'])
    def activate_dome():
        """Command to activate dome defense"""
        if not agent_manager:
            return jsonify({'error': 'Agent manager not initialized'}), 500
        
        result = agent_manager.activate_dome()
        return jsonify(result)
    
    @app.route('/api/simulation/status', methods=['GET'])
    def simulation_status():
        """Get current simulation status"""
        if not agent_manager:
            return jsonify({'error': 'Agent manager not initialized'}), 500
        
        return jsonify(agent_manager.get_simulation_status())
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal error: {error}")
        return jsonify({'error': 'Internal server error'}), 500


def register_socketio_handlers():
    """Register Socket.IO event handlers"""
    
    @socketio.on('connect')
    def handle_connect():
        """Handle client connection"""
        logger.info(f"Client connected: {request.sid}")
        emit('connection_response', {
            'status': 'connected',
            'timestamp': datetime.utcnow().isoformat()
        })
        
        # Send initial system state
        if agent_manager:
            emit('system_state', agent_manager.get_system_state())
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        logger.info(f"Client disconnected: {request.sid}")
    
    @socketio.on('subscribe_agent')
    def handle_subscribe_agent(data):
        """Subscribe to agent updates"""
        agent_id = data.get('agent_id')
        room = f"agent_{agent_id}"
        join_room(room)
        logger.info(f"Client {request.sid} subscribed to {agent_id}")
        emit('subscribed', {'agent_id': agent_id})
    
    @socketio.on('unsubscribe_agent')
    def handle_unsubscribe_agent(data):
        """Unsubscribe from agent updates"""
        agent_id = data.get('agent_id')
        room = f"agent_{agent_id}"
        leave_room(room)
        logger.info(f"Client {request.sid} unsubscribed from {agent_id}")
    
    @socketio.on('trigger_event')
    def handle_trigger_event(data):
        """Trigger a new event"""
        if not agent_manager:
            emit('error', {'message': 'Agent manager not initialized'})
            return
        
        event = agent_manager.create_event(
            event_type=data.get('type'),
            location=data.get('location'),
            severity=data.get('severity', 'medium'),
            description=data.get('description')
        )
        
        # Broadcast to all clients
        socketio.emit('event_created', event, broadcast=True)
        logger.info(f"Event created: {event['id']}")
    
    @socketio.on('command_deploy_troops')
    def handle_deploy_troops(data):
        """Handle troop deployment command"""
        if not agent_manager:
            emit('error', {'message': 'Agent manager not initialized'})
            return
        
        result = agent_manager.deploy_troops(
            location=data.get('location'),
            unit_size=data.get('unit_size', 'standard')
        )
        
        socketio.emit('troops_deployed', result, broadcast=True)
        logger.info(f"Troops deployed: {result}")
    
    @socketio.on('command_activate_dome')
    def handle_activate_dome():
        """Handle dome activation command"""
        if not agent_manager:
            emit('error', {'message': 'Agent manager not initialized'})
            return
        
        result = agent_manager.activate_dome()
        socketio.emit('dome_activated', result, broadcast=True)
        logger.info(f"Dome activated: {result}")
    
    @socketio.on('voice_command')
    def handle_voice_command(data):
        """Handle voice command"""
        command = data.get('command', '').lower()
        logger.info(f"Voice command received: {command}")
        
        if not agent_manager:
            emit('error', {'message': 'Agent manager not initialized'})
            return
        
        # Process voice command
        result = agent_manager.process_voice_command(command)
        emit('voice_response', result)


def broadcast_agent_state(agent_id, state_data):
    """Broadcast agent state change to subscribed clients"""
    room = f"agent_{agent_id}"
    socketio.emit('agent_state_changed', state_data, room=room)


def broadcast_event(event_data):
    """Broadcast event to all connected clients"""
    socketio.emit('event_occurred', event_data, broadcast=True)


def broadcast_trace(trace_data):
    """Broadcast execution trace to all connected clients"""
    socketio.emit('trace_recorded', trace_data, broadcast=True)


if __name__ == '__main__':
    app = create_app()
    
    # Start the application
    logger.info("Starting TARS Flask-SocketIO server...")
    socketio.run(
        app,
        host='0.0.0.0',
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG', False),
        allow_unsafe_werkzeug=True
    )
