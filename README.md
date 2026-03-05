# TARS - Terrorist Attack Response System 🛡️

TARS is a decentralized multi-agent system (MAS) built to simulate real-time coordination for defending a city against attacks (e.g., incoming ballistic missiles). It uses Python/SPADE to run an intelligent backend of agents with responsive finite state machines (FSM), hooked up to a rich React/Vite visualization dashboard leveraging Flask-SocketIO.

---

## 🚀 Getting Started

To run the full simulation stack, you need to start both the Python backend and the React frontend simultaneously.

### 1. Configure Environment
A `.env` file must be located at the root of the project with your configurations. Make sure the following keys exist (adjust ports if necessary):

```env
FLASK_PORT=5000
VITE_BACKEND_URL=http://localhost:5000
# Add your OPENAI_API_KEY here if you use the AI chat agent features
OPENAI_API_KEY=your_key_here
```

### 2. Run the Python Backend (SPADE Multi-Agent Network)
The backend manages the state of the agents, tracks physical events, handles inter-agent communication, and pushes live WebSocket telemetry to the frontend map.

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment (highly recommended):
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask server:
   ```bash
   python app.py
   ```
The backend should now be running locally on `http://localhost:5000`.

### 3. Run the React Frontend (TARS Command Center)
The frontend serves as the Command Center, visually tracking incoming missiles, plotting agent operations on the tactical map, and providing access to system logs.

1. Open a **new** separate terminal window and stay in the project's root directory:
   ```bash
   # E.g. /terrorist-response-system
   ```
2. Install the necessary Node.js packages using `npm` or `pnpm`:
   ```bash
   npm install
   # OR
   pnpm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   # OR
   pnpm run dev
   ```
4. Open your browser and navigate to the provided localhost URL (typically `http://localhost:5173` or `http://localhost:3000`).

---

## 🛑 How to Use the Simulator
- **City Tactical Map**: This displays a live layout of the region. Trigger a **"Trig_Missile"** event to simulate an incoming attack. Watch the `RescueAgent` dynamically calculate paths and deploy interceptors.
- **Missile Defense Sim**: Dive directly into the kinetic interception visualization. Monitor incoming velocities and defense logic buffers.
- **FSM Visualizer & Trace System**: Inspect the live Finite State Machine (FSM) states and execution trace timeline for each active node in the SPADE network (e.g., SensorAgent, ResponseAgent, SimulatorAgent).

## 🛠 Tech Stack
- **Frontend**: React, Vite, TSX, TailwindCSS, HTML5 Canvas API (for real-time entity rendering).
- **Backend**: Python, Flask, Flask-CORS, Flask-SocketIO (for real-time duplex data flow).
- **Agent Architecture**: SPADE (Smart Python Agent Development Environment) powering multi-agent asynchronous coordination and behaviors.
