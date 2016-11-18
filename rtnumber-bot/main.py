import asyncio
import hashlib
import json.decoder
import logging
from datetime import datetime, timedelta
from time import time

import pytz
from aiohttp import web
from log_handler import ArrayHandler

import requests

DEBUG_COMMANDS = True

last_update_timestamp = 0
last_themes_num = 0
last_podcast_num = 0

last_logs = ArrayHandler(max_count=200)
logging.basicConfig(format='%(asctime)-15s %(levelname)-8s %(message)s', level=logging.INFO,
                    datefmt="%Y-%m-%d %H:%M:%S", handlers=[logging.StreamHandler(), last_logs])
log = logging.getLogger()


def minutes_word(minutes):
    word = 'минут'
    if 11 <= minutes <= 14:
        pass
    elif minutes % 10 == 1:
        word += 'у'
    elif minutes % 10 in [2, 3, 4]:
        word += 'ы'
    return word


def hours_word(hours):
    word = 'часов'
    if 11 <= hours <= 14:
        pass
    elif hours % 10 == 1:
        word = 'час'
    elif hours % 10 in [2, 3, 4]:
        word = 'часа'
    return word


def hours_minutes_text(minutes, hours=0):
    if hours == 0:
        if minutes >= 60:
            hours = minutes // 60
            minutes -= (minutes // 60) * 60
    h_word = hours_word(hours)
    m_word = minutes_word(minutes)
    return '%i %s %i %s' % (hours, h_word, minutes, m_word)


async def http_info(request):
    data = {'author': 'strayge',
            'info': 'Пишет номер выпуска, время до эфира',
            'commands': ['Номер! | Выпуск!', 'Время!']}
    return web.json_response(data)


async def http_event(request):
    try:
        input_json = await request.json()
    except json.decoder.JSONDecodeError:
        return web.Response(status=417)
    
    input_text = input_json.get('text')

    valid_key = False
    if DEBUG_COMMANDS:
        input_key = input_json.get('key')
        if input_key:
            calced_hash = hashlib.new('sha256', str(input_key).encode('utf-8', errors='ignore')).hexdigest()
            predefined_hash = '3914b7f17b84ed68dc579b8308e2970950e29c257520975faee2f701f13311c7'
            if calced_hash == predefined_hash:
                valid_key = True

    delta_hours = None
    if DEBUG_COMMANDS and valid_key:
        delta_hours = input_json.get('delta')
        get_log = input_json.get('showlog')
        if get_log:
            return web.json_response({'log': last_logs.logs()})

    if not input_text:
        return web.Response(status=417)

    dt = datetime.now(tz=pytz.timezone('Europe/Moscow'))
    if delta_hours:
        dt = dt + timedelta(hours=int(delta_hours))

    if input_text.strip().lower() in ['время!', '!время']:
        weekday = dt.weekday()
        if weekday == 5:
            if dt.hour < 23:
                min_until_rt = 23*60 - (dt.hour*60 + dt.minute)
                text = 'Трансляция должна начаться через %s' % hours_minutes_text(min_until_rt)
            else:
                min_after_rt = (dt.hour-23)*60 + dt.minute
                text = 'Трансляция должна идти уже %s' % hours_minutes_text(min_after_rt)
        elif weekday == 6:
            if dt.hour <= 2:
                min_after_rt = (dt.hour+1)*60 + dt.minute
                text = 'Трансляция должна идти уже %s' % hours_minutes_text(min_after_rt)
            else:
                text = 'Трансляция должна была уже закончиться'
        else:
            text = 'Сегодня никакого Радио-Т'
        output = {'text': text, 'bot': 'rtnumber-bot'}
        return web.json_response(data=output, status=201)

    if input_text.strip().lower() in ['номер!', 'выпуск!', '!номер', '!выпуск']:
        if not last_podcast_num:
            return web.Response(status=417)
        weekday = dt.weekday()
        if weekday == 5:
            delta_days_num = 0
        elif weekday == 6:
            delta_days_num = -1
        else:
            delta_days_num = 5 - weekday
        day_num = (dt + timedelta(days=delta_days_num)).day
        if day_num <= 7:
            text = 'Подкаст # %i, гиковский' % (last_podcast_num + 1)
        else:
            text = 'Подкаст # %i, не гиковский' % (last_podcast_num + 1)
        output = {'text': text, 'bot': 'rtnumber-bot'}
        return web.json_response(data=output, status=201)

    return web.Response(status=417)


async def main_loop(web_app):
    try:
        while True:
            global last_update_timestamp
            
            if time() > last_update_timestamp + 24*3600:
                global last_podcast_num, last_themes_num
                try:
                    r = requests.get('https://radio-t.com/', timeout=20)
                except:
                    log.warn('Response error')
                    await asyncio.sleep(10)
                    continue
                r.encoding = 'utf-8'
                try:
                    h1 = r.text.split('"entry-title">')[1:]
                    for i in range(len(h1)):
                        h1[i] = h1[i].split('">',1)[1].split('</a',1)[0]
                except:
                    log.warn('Parsing error')
                    await asyncio.sleep(10)
                    continue

                podcast_num_found = False
                themes_num_found = False
                for title in h1:
                    if not podcast_num_found and 'Радио-Т 'in title:
                        num = title.replace('Радио-Т ', '').strip()
                        if num.isdigit():
                            last_podcast_num = int(num)
                            podcast_num_found = True
                        else:
                            log.warn('Invalid podcast num: "%s"' % num)
                    if not themes_num_found and 'Темя для 'in title:
                        num = title.replace('Темя для ', '').strip()
                        if num.isdigit():
                            last_themes_num = int(num)
                            themes_num_found = True
                        else:
                            log.warn('Invalid themes num: "%s"' % num)
                if last_podcast_num:
                    log.info('Retrieved podcast number, %i' % last_podcast_num)
                    last_update_timestamp = time()
            await asyncio.sleep(10)
    except asyncio.CancelledError:
        pass


async def start_background_tasks(web_app):
    web_app['loop'] = web_app.loop.create_task(main_loop(web_app))


async def cleanup_background_tasks(web_app):
    web_app['loop'].cancel()
    await web_app['loop']


if __name__ == "__main__":
    app = web.Application()
    app.on_startup.append(start_background_tasks)
    app.on_cleanup.append(cleanup_background_tasks)
    app.router.add_get('/info', http_info)
    app.router.add_post('/event', http_event)
    web.run_app(app, port=8080)
