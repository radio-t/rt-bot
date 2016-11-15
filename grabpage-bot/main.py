import os
import json.decoder
import asyncio
import aiohttp.web

BOT_NAME = "grabpage-bot"

loop = asyncio.get_event_loop()
web_app = aiohttp.web.Application(loop=loop)
client_session = aiohttp.ClientSession(loop=loop)


async def handle(request: aiohttp.web.Request):

    return aiohttp.web.json_response(
        data={
            "bot" : "grabpage-bot",
            "text" : "Ahoy!"
        },
        status=201
    )


web_app.router.add_post("/event", handle)
aiohttp.web.run_app(web_app, host="127.0.0.1", port=8080)
# aiohttp.web.run_app(web_app, host="0.0.0.0", port=8080)