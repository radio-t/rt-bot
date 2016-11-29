import datetime
import os
import re
from json.decoder import JSONDecodeError

import googlemaps
from flask import Flask, json, request
from pytz import timezone
from werkzeug.exceptions import ExpectationFailed

app = Flask(__name__)

google_key = os.environ.get('GOOGLE_KEY')

if not google_key:
    raise ValueError('GOOGLE_KEY environment variable is not set')

gmaps_api = googlemaps.Client(google_key)

fmt = '%d.%m.%Y %H:%M:%S'

bot_name = 'timezone_bot'


@app.route('/event', methods=['POST'])
def event():
    """Main event of app"""
    try:
        message = json.loads(request.data).get('text', None)

        if not message:
            return ExpectationFailed()

        # Check if message matches with pattern
        result = re.findall(r'время (в|во) (.*)', message)

        if not result:
            return ExpectationFailed()

        city = result[0][1]

        # Get places by city name (``query`` arg for ``places`` method)
        places = gmaps_api.places(city)

        if places['status'] == 'OK':
            # Get timezone by location
            tz = gmaps_api.timezone(
                places['results'][0]['geometry']['location']
            )
            if tz['status'] == 'OK':
                # Load timezone
                location = timezone(tz['timeZoneId'])
                localized_time = datetime.datetime.now(location)
                return json.dumps({
                    'text': 'Местное время в {city} сейчас {time}'.format(
                        city=city,
                        time=localized_time.strftime(fmt)
                    ),
                    'bot': bot_name
                }, ensure_ascii=False), 201
            else:
                return json.dumps({
                    'text': 'Не могу получить данные о часовом поясе',
                    'bot': bot_name
                }, ensure_ascii=False), 201
        else:
            return json.dumps({
                'text': 'Не могу найти город {city}'.format(city=city),
                'bot': bot_name
            }, ensure_ascii=False), 201

    except JSONDecodeError:
        return ExpectationFailed()
