"""
Real-time Missile Physics Simulation Engine
Runs a continuous physics loop in a background thread.
Publishes live positional updates via Flask-SocketIO.

Constrained arena: 800 x 600 units (mapped 1:1 to canvas pixels)
Defense dome:      radius 130 units, centred at (400, 500)  -- base of arena
"""

import math
import random
import time
import threading
import logging
import uuid

logger = logging.getLogger(__name__)

# --- Arena constants --------------------------------------------------------
ARENA_W = 800
ARENA_H = 600
DOME_CX = 400
DOME_CY = 500
DOME_RADIUS = 130          # interception engage radius
MISSILE_SPEED = 90         # pixels per second
INTERCEPTOR_SPEED = 180    # pixels per second (was 250 - too fast)
TICK = 0.1                 # physics tick seconds (10 Hz for stability)
# For diagnostic logging without flooding
_tick_count = 0 

# --- World State -------------------------------------------------------------
_lock = threading.RLock()
_missiles: dict = {}        # id -> missile dict
_interceptors: dict = {}    # id -> interceptor dict
_stats = {"incoming": 0, "intercepted": 0, "missed": 0}
_dome_active = True
_running = False
_thread: threading.Thread | None = None
_socketio = None            # injected by app.py


# --- Helpers -----------------------------------------------------------------

def _vec(ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    d = math.hypot(dx, dy)
    return dx, dy, d


def _spawn_missile():
    """Spawn a missile from a random edge, targeting the dome area."""
    edge = random.choice(["top", "left", "right"])
    if edge == "top":
        sx = random.uniform(50, ARENA_W - 50)
        sy = 0.0
    elif edge == "left":
        sx = 0.0
        sy = random.uniform(0, ARENA_H // 2)
    else:
        sx = float(ARENA_W)
        sy = random.uniform(0, ARENA_H // 2)

    # Target: random point within dome radius
    angle = random.uniform(0, math.pi * 2)
    spread = random.uniform(0, DOME_RADIUS * 0.9)
    tx = DOME_CX + math.cos(angle) * spread
    ty = DOME_CY + math.sin(angle) * spread

    mid = str(uuid.uuid4())[:8]
    missile = {
        "id": mid,
        "x": sx, "y": sy,
        "tx": tx, "ty": ty,
        "status": "incoming",   # incoming | intercepted | missed
        "status_changed_at": time.time(),
        "trail": [],
    }
    with _lock:
        _missiles[mid] = missile
        _stats["incoming"] += 1
    logger.info(f"MissileSim: SPAWNED missile {mid} ({sx:.0f},{sy:.0f}) -> ({tx:.0f},{ty:.0f})")
    return mid


def _spawn_interceptor(missile_id):
    """Launch an interceptor from the dome center toward the missile."""
    iid = str(uuid.uuid4())[:8]
    interceptor = {
        "id": iid,
        "x": float(DOME_CX),
        "y": float(DOME_CY),
        "target_id": missile_id,
    }
    with _lock:
        _interceptors[iid] = interceptor
    logger.info(f"MissileSim: LAUNCHED interceptor {iid} -> missile {missile_id}")
    return iid


# --- Physics Tick -------------------------------------------------------------

def _tick():
    global _stats, _tick_count
    _tick_count += 1
    to_remove_interceptors = []

    with _lock:
        missiles_snap = {k: dict(v) for k, v in _missiles.items()}
        interceptors_snap = {k: dict(v) for k, v in _interceptors.items()}
        dome = _dome_active

    # --- Move missiles ---
    for mid, m in missiles_snap.items():
        if m["status"] != "incoming":
            continue
        dx, dy, dist = _vec(m["x"], m["y"], m["tx"], m["ty"])
        step = MISSILE_SPEED * TICK
        if dist <= step:
            # Missile reached target without interception -> missed
            with _lock:
                if mid in _missiles:
                    _missiles[mid]["status"] = "missed"
                    _missiles[mid]["status_changed_at"] = time.time()
                    _stats["missed"] += 1
            logger.info(f"MissileSim: missile {mid} MISSED -- struck target area")
        else:
            nx = m["x"] + (dx / dist) * step
            ny = m["y"] + (dy / dist) * step
            with _lock:
                if mid in _missiles:
                    trail = _missiles[mid]["trail"]
                    trail.append((round(m["x"], 1), round(m["y"], 1)))
                    if len(trail) > 12:
                        trail.pop(0)
                    _missiles[mid]["x"] = nx
                    _missiles[mid]["y"] = ny

    # --- Move interceptors & check collisions ---
    for iid, ic in interceptors_snap.items():
        tid = ic["target_id"]
        with _lock:
            m = _missiles.get(tid)

        if m is None or m["status"] != "incoming":
            to_remove_interceptors.append(iid)
            continue

        mx, my = m["x"], m["y"]
        dx, dy, dist = _vec(ic["x"], ic["y"], mx, my)
        step = INTERCEPTOR_SPEED * TICK

        if dist <= step + 12: # Increased hit box slightly for 10Hz
            # Collision -- missile intercepted
            with _lock:
                if tid in _missiles:
                    _missiles[tid]["status"] = "intercepted"
                    _missiles[tid]["status_changed_at"] = time.time()
                    _stats["intercepted"] += 1
            logger.info(f"MissileSim: interceptor {iid} NEUTRALIZED missile {tid}")
            to_remove_interceptors.append(iid)
        else:
            nx = ic["x"] + (dx / dist) * step
            ny = ic["y"] + (dy / dist) * step
            with _lock:
                if iid in _interceptors:
                    _interceptors[iid]["x"] = nx
                    _interceptors[iid]["y"] = ny

    # Cleanup finished interceptors
    with _lock:
        for iid in to_remove_interceptors:
            _interceptors.pop(iid, None)

    # --- Auto-launch interceptors when dome is active ---
    if dome:
        with _lock:
            active_targets = {ic["target_id"] for ic in _interceptors.values()}
            for mid, m in _missiles.items():
                if m["status"] == "incoming" and mid not in active_targets:
                    # Check if missile is within engage range
                    dist_to_dome = math.hypot(m["x"] - DOME_CX, m["y"] - DOME_CY)
                    if dist_to_dome < DOME_RADIUS * 2:  # engage when closer (was 3)
                        _spawn_interceptor(mid)

    # --- Delayed cleanup of intercepted/missed missiles (after 1.5s flash) ---
    # We stagger removal so frontend can render explosion
    # Actually remove missiles 1.5 seconds after status change -- we do it by
    # scheduling removal next tick for now (frontend handles explosion display)
    time.sleep(0)  # yield


def _build_snapshot():
    """Build the state dict to broadcast to clients."""
    with _lock:
        missiles_out = [
            {
                "id": m["id"],
                "x": round(m["x"], 1),
                "y": round(m["y"], 1),
                "tx": m["tx"],
                "ty": m["ty"],
                "status": m["status"],
                "status_changed_at": m.get("status_changed_at", 0),
                "trail": list(m["trail"]),
            }
            for m in _missiles.values()
        ]
        interceptors_out = [
            {
                "id": ic["id"],
                "x": round(ic["x"], 1),
                "y": round(ic["y"], 1),
                "target_id": ic["target_id"],
            }
            for ic in _interceptors.values()
        ]
        stats_out = dict(_stats)
        dome_out = _dome_active

    return {
        "missiles": missiles_out,
        "interceptors": interceptors_out,
        "stats": stats_out,
        "dome_active": dome_out,
        "arena": {"w": ARENA_W, "h": ARENA_H, "dome_cx": DOME_CX, "dome_cy": DOME_CY, "dome_r": DOME_RADIUS},
    }


# _delayed_remove removed in favor of in-loop timestamp check


# --- Main Loop ----------------------------------------------------------------

def _simulation_loop():
    global _running
    logger.info("MissileSim: Physics loop starting...")
    spawn_timer = 0.0
    spawn_interval = 15.0  # seconds between auto-spawns

    while _running:
        t0 = time.time()

        try:
            _tick()
        except Exception as e:
            logger.error(f"MissileSim: Physics tick error: {e}", exc_info=True)
        
        if _tick_count % 100 == 0:
            with _lock:
                m_count = len(_missiles)
            logger.info(f"MissileSim: Step {_tick_count} | Active: {m_count}")

        # Auto-spawn missiles periodically
        spawn_timer += TICK
        if spawn_timer >= spawn_interval:
            spawn_timer = 0.0
            _spawn_missile()

        # Cleanup missiles after they've exploded (1.5s delay)
        now = time.time()
        to_pop = []
        with _lock:
            for mid, m in _missiles.items():
                if m["status"] != "incoming":
                    if now - m["status_changed_at"] >= 2.5:
                        to_pop.append(mid)
            for mid in to_pop:
                _missiles.pop(mid, None)
                logger.debug(f"MissileSim: REMOVED missile {mid} from state")

        # Broadcast snapshot via SocketIO
        if _socketio:
            snap = _build_snapshot()
            _socketio.emit("missile_physics_update", snap)

        elapsed = time.time() - t0
        sleep_time = max(0, TICK - elapsed)
        time.sleep(sleep_time)

    logger.info("MissileSim: Physics loop stopped.")


# --- Public API ---------------------------------------------------------------

def init_simulation(socketio_instance):
    """Called once by app.py to register the SocketIO instance."""
    global _socketio
    _socketio = socketio_instance
    logger.info("MissileSim: SocketIO instance registered.")


def start_simulation():
    global _running, _thread
    if _running:
        return
    _running = True
    _thread = threading.Thread(target=_simulation_loop, daemon=True, name="MissilePhysics")
    _thread.start()
    logger.info("MissileSim: Simulation started.")


def stop_simulation():
    global _running
    _running = False
    logger.info("MissileSim: Simulation stopping...")


def trigger_missile():
    """Manually spawn a missile (called by environment.py or API endpoint)."""
    return _spawn_missile()


def set_dome(active: bool):
    global _dome_active
    with _lock:
        _dome_active = active
    logger.info(f"MissileSim: Dome set to {'ACTIVE' if active else 'OFFLINE'}")


def get_dome_state() -> bool:
    return _dome_active


def get_stats() -> dict:
    with _lock:
        return dict(_stats)


def get_snapshot() -> dict:
    return _build_snapshot()
