import asyncio
import logging
import random
from spade.agent import Agent
from spade.behaviour import PeriodicBehaviour
from spade.message import Message
from agents.spade_agents import start_agents

logger = logging.getLogger(__name__)

class EnvironmentSimulationBehaviour(PeriodicBehaviour):
    """Simulates environment threat and missile events over time"""

    async def on_start(self):
        logger.info("Environment Simulation started. Activating defense systems...")
        
        # Wake up sensor agent
        sensor_msg = Message(to="sensor@localhost")
        sensor_msg.set_metadata("performative", "request")
        sensor_msg.body = "START_MONITORING"
        await self.send(sensor_msg)
        
        # Activate dome agent
        dome_msg = Message(to="dome@localhost")
        dome_msg.set_metadata("performative", "request")
        dome_msg.body = "ACTIVATE"
        await self.send(dome_msg)
        
        logger.info("Environment Simulation: Sent wake up signals to sensor and dome agents")

    async def run(self):
        logger.debug("Environment Simulation tick...")
        
        # Randomly choose an event to simulate
        event_type = random.choice(["THREAT", "MISSILE", "NONE", "NONE"])
        
        if event_type == "THREAT":
            locations = ["Sector 7", "Downtown", "Industrial Zone", "Central Square"]
            loc = random.choice(locations)
            logger.info(f"Environment: Simulating THREAT event at {loc}")
            
            msg = Message(to="sensor@localhost")
            msg.set_metadata("performative", "inform")
            msg.body = f"Suspicious activity detected at {loc}"
            await self.send(msg)
            
        elif event_type == "MISSILE":
            logger.info("Environment: Simulating incoming MISSILE event")
            
            msg = Message(to="dome@localhost")
            msg.set_metadata("performative", "inform")
            msg.body = "MISSILE: Code Red incoming projectile"
            await self.send(msg)

class EnvironmentAgent(Agent):
    """Agent representing the environment simulating disasters and attacks"""
    
    async def setup(self):
        logger.info("EnvironmentAgent setup initiating...")
        # Simulate an event every 10 seconds
        b = EnvironmentSimulationBehaviour(period=10)
        self.add_behaviour(b)

async def main():
    # Configure logging specifically for the standalone environment runner if needed
    import logging.config
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler("tars_agents.log"),
            logging.StreamHandler()
        ]
    )
    
    # Start the core agents
    launched_agents = await start_agents()
    
    if launched_agents:
        # Start the environment agent
        env_agent = EnvironmentAgent("environment@localhost", "password")
        await env_agent.start()
        
        logger.info("EnvironmentAgent is running. Press Ctrl+C to stop...")
        
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            logger.info("Simulation stopping...")
            await env_agent.stop()
            for agent in launched_agents.values():
                await agent.stop()
    else:
        logger.error("Failed to start core agents.")

if __name__ == "__main__":
    asyncio.run(main())
