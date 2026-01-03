# backend/routes/gesture.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from connections import dashboard_clients
import connections

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

# simple global state (fine for now)
gesture_state = {
    "selected_light": None,   # 1..4
    "selected_target": "light"  # later you can switch to door/curtain
}

async def broadcast_action(action: dict):
    for client in dashboard_clients:
        await client.send_json({
            "type": "action",
            "data": action
        })

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

    try:
        while True:
            data = await ws.receive_json()
            label = data.get("gesture")

            if not label:
                continue

            # 1) number selection
            if label in NUMBER_MAP:
                gesture_state["selected_light"] = NUMBER_MAP[label]
                await broadcast_action({
                    "target": "ui",
                    "command": "hint",
                    "text": f"Selected light {gesture_state['selected_light']}"
                })
                continue

            # 2) exit resets selection
            if label == "Exit":
                gesture_state["selected_light"] = None
                await broadcast_action({
                    "target": "ui",
                    "command": "hint",
                    "text": "Selection cleared"
                })
                continue

            # 3) open/close produces an action
            if label in VERB_MAP:
                verb = VERB_MAP[label]

                # If a light number was selected: operate that light
                if gesture_state["selected_light"] is not None:
                    light_id = gesture_state["selected_light"]

                    # example: Open = turn on, Close = turn off
                    await broadcast_action({
                        "target": "light",
                        "id": light_id,
                        "command": "on" if verb == "open" else "off"
                    })
                    continue

                # No number selected -> default mapping (door for now)
                await broadcast_action({
                    "target": "door",
                    "command": verb  # "open" / "close"
                })
                continue

            # 4) yes/no optional (reserved for confirmation later)
            if label in ("Yes", "No"):
                await broadcast_action({
                    "target": "ui",
                    "command": "hint",
                    "text": f"Received {label}"
                })
                continue

    except WebSocketDisconnect:
        connections.gesture_clients.remove(ws)
        connections.gesture_connected = False

        for client in dashboard_clients:
            await client.send_json({
                "type": "status",
                "device": "gesture",
                "connected": False
            })