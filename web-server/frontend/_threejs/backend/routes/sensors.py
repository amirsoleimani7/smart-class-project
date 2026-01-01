# backend/routes/sensors.py
from fastapi import APIRouter, WebSocket
from connections import dashboard_clients

router = APIRouter()

@router.websocket("/ws/sensors")
async def sensors_ws(ws: WebSocket):
    await ws.accept()

    while True:
        data = await ws.receive_json()

        # forward to all dashboards
        for client in dashboard_clients:
            await client.send_json({
                "type": "sensor",
                "data": data
            })
