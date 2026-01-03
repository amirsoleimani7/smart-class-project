# backend/routes/gesture.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from connections import dashboard_clients
import connections

from enum import Enum
from dataclasses import dataclass, field
from typing import List, Optional

router = APIRouter()

NUMBER_MAP = {
    "One": 1,
    "Tow": 2,     # keep exactly your label spelling
    "Two": 2,     # optional fallback if you later fix label
    "Three": 3,
    "Four": 4,
}

VERB_MAP = {
    "Open": "open",
    "Close": "close",
}


class GestureState(str, Enum):
    """
    State machine hierarchy:

    OFF → SELECT → LIGHTS → FRONT_LIGHTS (lamps 1 & 3)
                          → BACK_LIGHTS  (lamps 2 & 4)

               SELECT → DOOR
                     → CURTAIN
    """
    OFF = "OFF"
    SELECT = "SELECT"
    LIGHTS = "LIGHTS"
    FRONT_LIGHTS = "FRONT_LIGHTS"
    BACK_LIGHTS = "BACK_LIGHTS"
    DOOR = "DOOR"
    CURTAIN = "CURTAIN"


# OFF state unlock sequence must be exactly:
# "Open" → "Close" → "Open" → "Close" → "Open" → "Close"
OFF_UNLOCK_SEQUENCE: List[str] = ["Open", "Close", "Open", "Close", "Open", "Close"]


@dataclass
class SessionState:
    """
    Per-WebSocket session state (no globals; each connection can be in different state).
    """
    state: GestureState = GestureState.OFF
    off_seq_index: int = 0  # tracks progress through OFF_UNLOCK_SEQUENCE


async def broadcast_action(action: dict):
    """
    Broadcast an action to all connected dashboards, preserving the exact JSON structure
    expected by existing clients.
    """
    for client in dashboard_clients:
        await client.send_json({
            "type": "action",
            "data": action
        })


async def beep():
    """
    Every state transition MUST trigger a beep.
    """
    await broadcast_action({"target": "buzzer", "command": "beep"})


async def transition(session: SessionState, new_state: GestureState):
    """
    Transition helper: beeps on every state transition, then updates session state.
    """
    if session.state != new_state:
        await beep()
        session.state = new_state


def _is_close(label: Optional[str]) -> bool:
    """
    "Close" gesture is ONLY a separator (except OFF sequence tracking).
    Use VERB_MAP for recognition.
    """
    return label in VERB_MAP and VERB_MAP[label] == "close"


def _is_open(label: Optional[str]) -> bool:
    """
    Use VERB_MAP for recognition.
    """
    return label in VERB_MAP and VERB_MAP[label] == "open"


@router.websocket("/ws/gesture")
async def gesture_ws(ws: WebSocket):
    await ws.accept()
    connections.gesture_clients.append(ws)
    connections.gesture_connected = True

    # tell dashboards gesture source is connected
    for client in dashboard_clients:
        await client.send_json({
            "type": "status",
            "device": "gesture",
            "connected": True
        })

    # per-connection session state (CRITICAL REQUIREMENT)
    session = SessionState()

    try:
        while True:
            data = await ws.receive_json()
            label = data.get("gesture")
            print("gesture label:", label, "state:", session.state, "off_idx:", session.off_seq_index)
            
            if not label:
                continue

            # -----------------------------------------------------------------
            # 1) OFF STATE: Track exact unlock sequence:
            #    "Open" → "Close" → "Open" → "Close" → "Open" → "Close"
            #    Ignore ALL gestures except this exact sequence tracking.
            # -----------------------------------------------------------------
            if session.state == GestureState.OFF:
                expected = OFF_UNLOCK_SEQUENCE[session.off_seq_index]

                # Track exact alternating sequence using the raw labels "Open"/"Close"
                # (recognized via VERB_MAP by name).
                if label == expected:
                    session.off_seq_index += 1
                    if session.off_seq_index == len(OFF_UNLOCK_SEQUENCE):
                        # Correct full sequence received: beep + transition to SELECT.
                        session.off_seq_index = 0
                        await transition(session, GestureState.SELECT)
                    # In OFF state, even valid steps do not produce actions besides
                    # the final transition beep.
                    continue

                # Any deviation resets progress. If the current label could be the
                # start of the sequence, restart at 1; otherwise reset to 0.
                session.off_seq_index = 1 if label == OFF_UNLOCK_SEQUENCE[0] else 0
                continue

            # -----------------------------------------------------------------
            # 2) "Close" is ONLY a separator outside OFF: ignore in all other states.
            #    This "consumes" separators in the input stream.
            # -----------------------------------------------------------------
            if _is_close(label):
                continue

            # -----------------------------------------------------------------
            # 3) State handling (all unqualified gestures => do nothing)
            # -----------------------------------------------------------------
            if session.state == GestureState.SELECT:
                # "One" → Beep → LIGHTS
                if label == "One":
                    await transition(session, GestureState.LIGHTS)
                    continue

                # "Tow" → Beep → DOOR
                if label == "Tow":
                    await transition(session, GestureState.DOOR)
                    continue

                # "Three" → Beep → CURTAIN
                if label == "Three":
                    await transition(session, GestureState.CURTAIN)
                    continue

                # "Exit" → Beep → OFF
                if label == "Exit":
                    await transition(session, GestureState.OFF)
                    # Reset OFF sequence tracker when returning to OFF.
                    session.off_seq_index = 0
                    continue

                # Ignore all other gestures (including "Close", "Yes", "No", "Open")
                continue

            if session.state == GestureState.LIGHTS:
                # "One" → Beep → FRONT_LIGHTS
                if label == "One":
                    await transition(session, GestureState.FRONT_LIGHTS)
                    continue

                # "Tow" → Beep → BACK_LIGHTS
                if label == "Tow":
                    await transition(session, GestureState.BACK_LIGHTS)
                    continue

                # "Exit" → Beep → SELECT
                if label == "Exit":
                    await transition(session, GestureState.SELECT)
                    continue

                # Ignore all other gestures
                continue

            if session.state == GestureState.FRONT_LIGHTS:
                # "Yes" → two separate actions: light 1 ON, light 3 ON
                if label == "Yes":
                    await broadcast_action({"target": "light", "id": 1, "command": "on"})
                    await broadcast_action({"target": "light", "id": 2, "command": "on"})
                    continue

                # "No" → two separate actions: light 1 OFF, light 3 OFF
                if label == "No":
                    await broadcast_action({"target": "light", "id": 1, "command": "off"})
                    await broadcast_action({"target": "light", "id": 2, "command": "off"})
                    continue

                # "Exit" → Beep → LIGHTS
                if label == "Exit":
                    await transition(session, GestureState.LIGHTS)
                    continue

                # Ignore all other gestures
                continue

            if session.state == GestureState.BACK_LIGHTS:
                # "Yes" → two separate actions: light 2 ON, light 4 ON
                if label == "Yes":
                    await broadcast_action({"target": "light", "id": 3, "command": "on"})
                    await broadcast_action({"target": "light", "id": 4, "command": "on"})
                    continue

                # "No" → two separate actions: light 2 OFF, light 4 OFF
                if label == "No":
                    await broadcast_action({"target": "light", "id": 3, "command": "off"})
                    await broadcast_action({"target": "light", "id": 4, "command": "off"})
                    continue

                # "Exit" → Beep → LIGHTS
                if label == "Exit":
                    await transition(session, GestureState.LIGHTS)
                    continue

                # Ignore all other gestures
                continue

            if session.state == GestureState.DOOR:
                # "Yes" → door OPEN
                if label == "Yes":
                    await broadcast_action({"target": "door", "command": "open"})
                    continue

                # "No" → door CLOSE
                if label == "No":
                    await broadcast_action({"target": "door", "command": "close"})
                    continue

                # "Exit" → Beep → SELECT
                if label == "Exit":
                    await transition(session, GestureState.SELECT)
                    continue

                # Ignore all other gestures
                continue

            if session.state == GestureState.CURTAIN:
                # "Yes" → curtain OPEN
                if label == "Yes":
                    await broadcast_action({"target": "curtain", "command": "open"})
                    continue

                # "No" → curtain CLOSE
                if label == "No":
                    await broadcast_action({"target": "curtain", "command": "close"})
                    continue

                # "Exit" → Beep → SELECT
                if label == "Exit":
                    await transition(session, GestureState.SELECT)
                    continue

                # Ignore all other gestures
                continue

            # Fallback (should not happen): do nothing.
            continue

    except WebSocketDisconnect:
        # Preserve existing connection management and error handling
        if ws in connections.gesture_clients:
            connections.gesture_clients.remove(ws)
        connections.gesture_connected = False

        for client in dashboard_clients:
            await client.send_json({
                "type": "status",
                "device": "gesture",
                "connected": False
            })
