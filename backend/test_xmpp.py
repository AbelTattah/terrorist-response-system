import asyncio
from spade.agent import Agent

class DummyAgent(Agent):
    async def setup(self):
        print("Agent starting...")

async def main():
    agent = DummyAgent("test_tars_agent_123@yax.im", "tars_password")
    try:
        await agent.start(auto_register=True)
        print("Successfully connected!")
        await agent.stop()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
