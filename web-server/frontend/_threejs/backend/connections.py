# backend/connections.py
from fastapi import WebSocket

dashboard_clients: list[WebSocket] = []
