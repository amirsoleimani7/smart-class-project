# backend/routes/gesture.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from connections import dashboard_clients
import connections

router = APIRouter()

@router.websocket("/ws/gesture")
async def gesture_ws(ws: WebSocket):
    await ws.accept()
    connections.gesture_clients.append(ws)
    connections.gesture_connected = True

    # (optional) tell dashboards that gesture source is connected
    for client in dashboard_clients:
        await client.send_json({
            "type": "status",
            "device": "gesture",
            "connected": True
        })

    try:
        while True:
            data = await ws.receive_json()
            # expect: {"gesture": "open_palm"} or {"gesture": "...", "confidence": 0.93}

            for client in dashboard_clients:
                await client.send_json({
                    "type": "gesture",
                    "data": data
                })

    except WebSocketDisconnect:
        connections.gesture_clients.remove(ws)
        connections.gesture_connected = False

        for client in dashboard_clients:
            await client.send_json({
                "type": "status",
                "device": "gesture",
                "connected": False
            })