"""
Environment Simulation - Generates autonomous threat and missile events
Sends events to both the local agent message bus AND the Flask backend API
"""

import asyncio
import logging
import random
import aiohttp
from agents.spade_agents import MessageBus, LocalAgent, start_agents

logger = logging.getLogger(__name__)


class EnvironmentAgent(LocalAgent):
    """Agent representing the environment - simulates disasters and attacks autonomously"""
    
    def __init__(self):
        super().__init__("environment")
        self._sim_running = False
    
    async def setup(self):
        logger.info("EnvironmentAgent setup initiating...")
    
    async def start(self):
        await self.setup()
        self._running = True
        self._sim_running = True
        self._task = asyncio.ensure_future(self._run_simulation())
        logger.info("EnvironmentAgent connected and authenticated.")
    
    async def _run_simulation(self):
        """Main autonomous simulation loop"""
        logger.info("Environment Simulation started. Activating defense systems...")
        
        # Wake up sensor agent
        await self.send("sensor", "START_MONITORING", {"performative": "request"})
        logger.info("Environment Simulation: Sent START_MONITORING to SensorAgent")
        
        # Activate dome agent
        await self.send("dome", "ACTIVATE", {"performative": "request"})
        logger.info("Environment Simulation: Sent ACTIVATE to RescueAgent")
        
        logger.info("Environment Simulation: All defense systems activated. Beginning autonomous event loop...")
        
        while self._sim_running:
            try:
                await asyncio.sleep(10)  # Simulate an event every 10 seconds
                await self._simulate_event()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Environment Simulation error: {e}")
                await asyncio.sleep(5)
        
        logger.info("Environment Simulation stopped.")
    
    async def _simulate_event(self):
        """Randomly choose and trigger an environment event"""
        event_type = random.choice(["THREAT", "MISSILE", "NONE", "NONE"])
        
        if event_type == "THREAT":
            locations = [
                {"name": "Sector 7", "coords": {"x": 200, "y": 200}},
                {"name": "Downtown", "coords": {"x": 500, "y": 500}},
                {"name": "Industrial Zone", "coords": {"x": 800, "y": 800}}
            ]
            loc = random.choice(locations)
            logger.info(f"Environment: === SIMULATING THREAT EVENT at {loc['name']} ===")
            
            # Send message to sensor agent via local message bus
            await self.send("sensor", f"Suspicious activity detected at {loc['name']}", {"performative": "inform"})
            
            # Forward event to the Flask backend to influence the UI
            try:
                async with aiohttp.ClientSession() as session:
                    await session.post('http://localhost:5000/api/events', json={
                        'type': 'attack',
                        'location': loc['coords'],
                        'severity': 'high',
                        'description': f"Suspicious activity detected at {loc['name']}"
                    })
                    logger.info(f"Environment: Threat event forwarded to Flask backend")
            except Exception as e:
                logger.warning(f"Environment: Could not forward to Flask backend (non-critical): {e}")
        
        elif event_type == "MISSILE":
            logger.info("Environment: === SIMULATING INCOMING MISSILE EVENT ===")
            
            # Send message to dome defense agent via local message bus
            await self.send("dome", "MISSILE: Code Red incoming projectile", {"performative": "inform"})
            
            # Forward missile event to Flask backend
            try:
                async with aiohttp.ClientSession() as session:
                    await session.post('http://localhost:5000/api/commands/simulate-missile', json={
                        'target': {'x': random.uniform(300, 700), 'y': random.uniform(300, 700)}
                    })
                    logger.info("Environment: Missile event forwarded to Flask backend")
            except Exception as e:
                logger.warning(f"Environment: Could not forward to Flask backend (non-critical): {e}")
        
        else:
            logger.debug("Environment: Quiet period - no events detected")


async def main():
    """Main entry point for standalone environment simulation"""
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
        env_agent = EnvironmentAgent()
        await env_agent.start()
        await asyncio.sleep(1)
        
        logger.info("Environment Simulation: Booting simulation loop...")
        logger.info("=== TARS AUTONOMOUS SYSTEM FULLY OPERATIONAL ===")
        
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


def start_background_simulation():
    """Starts the simulation loop autonomously in a background daemon thread."""
    import threading
    def _run_loop():
        # Setup a dedicated asyncio event loop for the background thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Delay slightly to ensure Flask server has completely booted up
        import time
        time.sleep(3)
        loop.run_until_complete(main())
        loop.close()
    
    t = threading.Thread(target=_run_loop, daemon=True)
    t.start()
    logger.info("Autonomous background simulation thread correctly dispatched")

if __name__ == "__main__":
    asyncio.run(main())
