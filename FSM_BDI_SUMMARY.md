# TARS: FSM & BDI Agent Simulation Summary

This document explains the autonomous agent behavior model implemented in the TARS system, focusing on **Finite State Machines (FSM)** for reactive behavior and the **Belief-Desire-Intention (BDI)** model for high-level goal coordination.

## 1. Finite State Machine (FSM) Transitions

Each agent in the TARS system operates as an autonomous node with a dedicated FSM. This ensures their behavior is predictable, modular, and reactive to environmental events.

### SensorAgent FSM
*   **SENSOR_IDLE**: Standard operating mode, awaiting activation.
*   **SENSOR_MONITORING**: Active scanning; responds to "threat" messages from `environment.py`.
*   **SENSOR_ALERT_TRIGGERED**: Transitioned to when a threat is identified. Sends an `inform` message to the Coordinator.
*   **Transition Pattern**: `IDLE -> MONITORING -> ALERT_TRIGGERED -> MONITORING`.

### CoordinatorAgent FSM
*   **COORDINATOR_IDLE**: Listening for alerts from SensorAgents.
*   **COORDINATOR_PROCESSING**: Analyzing threat severity and impact.
*   **COORDINATOR_ASSIGNING**: Dispatching specific tasks to response agents (Rescue/Dome).
*   **Transition Pattern**: `IDLE -> PROCESSING -> ASSIGNING -> IDLE`.

### RescueAgent FSM
*   **DOME_IDLE**: Standby.
*   **DOME_TRACKING**: High-alert mode; scanning the physics engine for incoming projectiles.
*   **DOME_INTERCEPTING**: Kinetic engagement activated. Launches interceptors toward targets.
*   **Transition Pattern**: `IDLE -> TRACKING -> INTERCEPTING -> TRACKING`.

### RescueAgent FSM
*   **RESCUE_IDLE**: Base status.
*   **RESCUE_DEPLOYING**: Responding to deployment requests from the Coordinator.
*   **RESCUE_ENGAGED**: Active at the scene, securing the perimeter.
*   **Transition Pattern**: `IDLE -> DEPLOYING -> ENGAGED -> IDLE`.

---

## 2. BDI (Belief-Desire-Intention) Mapping

The agents exhibit BDI characteristics in their autonomous decision loop:

### Beliefs (Represented by Agent Mental Models)
*   Agents maintain beliefs about the world via messages and the `environment` simulation.
*   Example: `SensorAgent` believes there is a threat if a specific "Suspicious activity" message is received.
*   Example: `RescueAgent` believes a missile exists if it sees it in the physics snapshot.

### Desires (Represented by Agent Goals)
*   Desires are the long-term objectives assigned during agent setup.
*   **Sensor**: Desire to achieve "Full Perimeter Awareness".
*   **Coordinator**: Desire to "Neutralize Public Safety Threats".
*   **Dome**: Desire to "Maintain a 100% Interception Success Rate".

### Intentions (Represented by FSM Execution)
*   Intentions are the specific plans the agent commit to at any given moment.
*   When a `RescueAgent` transitions to `INTERCEPTING`, it has formed an **Intention** to launch an interceptor 0xFFA1 based on its **Belief** of a projectile and its **Desire** to protect the sector.

---

## 3. Real-time Physics Integration

The **Missile Defense** module bridges the logical (Agents) and physical (Real-time Simulation) worlds:
1.  **Logical Layer**: `environment` agent triggers a missile event.
2.  **Physics Layer**: `missile_simulation.py` spawns a missile with coordinates and velocity.
3.  **BDI Reasoning**: `RescueAgent` observes the physical world, recognizes the threat, and intends to counter it.
4.  **Action**: The Agent instructs the physics simulator to spawn an interceptor.
5.  **Feedback**: The physics engine broadcasts the result (collision detected), updating the agent's beliefs.
