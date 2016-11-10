import os
import json.decoder

import asyncio
import aiohttp
import aiohttp.web
import async_timeout

GIPHY_API_KEY = os.environ.get('GIPHY_API_KEY', 'dc6zaTOxFJmzC')
MY_NAME = os.environ.get('MY_NAME', 'Giphy')

GIPHY_ENDPOINT = 'http://api.giphy.com/v1/gifs/translate'
GIPHY_TIMEOUT = 3

loop = asyncio.get_event_loop()
web_app = aiohttp.web.Application(loop=loop)
client_session = aiohttp.ClientSession(loop=loop)


def wrap_response(text):
    return aiohttp.web.json_response(
        data={
            'bot': MY_NAME,
            'text': text,
        },
        status=201,
    )


def giphy_timeout_response():
    return wrap_response('**Giphy** did not responded in 3 seconds :(')


def giphy_error_response(giphy_response: aiohttp.ClientResponse):
    return wrap_response('Something went wrong. **Giphy** said: *{} {}*'.format(
        giphy_response.status,
        giphy_response.reason,
    ))


async def giphy_image_response(giphy_response: aiohttp.ClientResponse):
    try:
        giphy_data = await giphy_response.json()
    except json.decoder.JSONDecodeError:
        return wrap_response('Something bad happened :(')

    giphy_image_url = giphy_data. \
        get('data', {}). \
        get('images', {}). \
        get('fixed_height_small', {}). \
        get('webp', {})

    if giphy_image_url is None:
        return wrap_response('I cannot understand **Giphy** response :(')

    return wrap_response('![gif]({})'.format(giphy_image_url))


async def call_gyphy(search_string):
    async with client_session.get(GIPHY_ENDPOINT, params={
        's': search_string,
        'api_key': GIPHY_API_KEY,
    }) as client_response:
        if client_response.status != 200:
            return giphy_error_response(client_response)
        return await giphy_image_response(client_response)


async def handle(request: aiohttp.web.Request):
    try:
        request_data = await request.json()
    except json.decoder.JSONDecodeError:
        return aiohttp.web.Response(status=400)

    if request_data.get('text', None) is None:
        return aiohttp.web.Response(status=400)

    request_text = request_data.get('text')

    if not request_text.lower().startswith('giphy '):
        return aiohttp.web.Response(status=417)

    search_string = request_text[6:].strip()

    try:
        with async_timeout.timeout(GIPHY_TIMEOUT):
            return await call_gyphy(search_string)
    except asyncio.TimeoutError:
        return giphy_timeout_response()


web_app.router.add_post('/event', handle)

aiohttp.web.run_app(web_app, host='0.0.0.0', port=8080)
