import asyncio
import websockets
import json
import random

async def run():
    async with websockets.connect("ws://127.0.0.1:8000/ws/sensors") as ws:
        while True:
            data = {
                "temperature": round(random.uniform(20, 30), 2),
                "humidity": round(random.uniform(40, 60), 2),
                "co2": random.randint(400, 1200),
                "light": random.randint(100, 900),
                "noise": round(random.uniform(30, 80), 2)
            }

            await ws.send(json.dumps(data))
            await asyncio.sleep(1)

asyncio.run(run())
