"""
Database models and initialization for TARS
"""

import os
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///tars.db')

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv('SQL_ECHO', False),
    pool_pre_ping=True
)

# Session factory
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Base class for models
Base = declarative_base()


class Event(Base):
    """Event model - represents detected events"""
    __tablename__ = "events"
    
    id = Column(String(36), primary_key=True)
    event_type = Column(String(50), nullable=False)  # attack, missile, etc.
    location_x = Column(Float, nullable=False)
    location_y = Column(Float, nullable=False)
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    description = Column(Text)
    detected_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.event_type,
            'location': {'x': self.location_x, 'y': self.location_y},
            'severity': self.severity,
            'description': self.description,
            'detected_at': self.detected_at.isoformat() if self.detected_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Agent(Base):
    """Agent model - represents SPADE agents"""
    __tablename__ = "agents"
    
    id = Column(String(36), primary_key=True)
    name = Column(String(100), nullable=False)
    agent_type = Column(String(50), nullable=False)  # sensor, coordinator, rescue, dome
    current_state = Column(String(50), nullable=False)
    status = Column(String(20), default='idle')  # idle, active, error
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.agent_type,
            'current_state': self.current_state,
            'status': self.status,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ExecutionTrace(Base):
    """Execution trace model - logs agent decisions and actions"""
    __tablename__ = "execution_traces"
    
    id = Column(String(36), primary_key=True)
    agent_id = Column(String(36), nullable=False)
    event_type = Column(String(50), nullable=False)  # state_change, decision, action, etc.
    from_state = Column(String(50))
    to_state = Column(String(50))
    message = Column(Text)
    details = Column(Text)  # JSON string with additional data
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'agent_id': self.agent_id,
            'event_type': self.event_type,
            'from_state': self.from_state,
            'to_state': self.to_state,
            'message': self.message,
            'details': self.details,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }


class Missile(Base):
    """Missile model - represents incoming missiles"""
    __tablename__ = "missiles"
    
    id = Column(String(36), primary_key=True)
    location_x = Column(Float, nullable=False)
    location_y = Column(Float, nullable=False)
    target_x = Column(Float, nullable=False)
    target_y = Column(Float, nullable=False)
    status = Column(String(20), default='incoming')  # incoming, intercepted, hit
    interceptor_id = Column(String(36))
    created_at = Column(DateTime, default=datetime.utcnow)
    intercepted_at = Column(DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'location': {'x': self.location_x, 'y': self.location_y},
            'target': {'x': self.target_x, 'y': self.target_y},
            'status': self.status,
            'interceptor_id': self.interceptor_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'intercepted_at': self.intercepted_at.isoformat() if self.intercepted_at else None
        }


class Deployment(Base):
    """Deployment model - represents troop deployments"""
    __tablename__ = "deployments"
    
    id = Column(String(36), primary_key=True)
    location_x = Column(Float, nullable=False)
    location_y = Column(Float, nullable=False)
    unit_size = Column(String(20), nullable=False)  # small, standard, large
    status = Column(String(20), default='deploying')  # deploying, active, complete
    created_at = Column(DateTime, default=datetime.utcnow)
    arrived_at = Column(DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'location': {'x': self.location_x, 'y': self.location_y},
            'unit_size': self.unit_size,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'arrived_at': self.arrived_at.isoformat() if self.arrived_at else None
        }


def init_db(app):
    """Initialize database"""
    with app.app_context():
        Base.metadata.create_all(bind=engine)


def get_db():
    """Get database session"""
    return SessionLocal()


def close_db():
    """Close database session"""
    SessionLocal.remove()
