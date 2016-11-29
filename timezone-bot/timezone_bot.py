from json.decoder import JSONDecodeError

from flask import Flask, json, request
from werkzeug.exceptions import ExpectationFailed

app = Flask(__name__)


@app.route('/event', methods=['POST'])
def event():
    """Main event of app"""
    try:
        message = json.loads(request.data).get('text', None)

        response = {
            'text': 'Hello world',
            'bot': 'timezone_bot'
        }
        return response, 201
    except JSONDecodeError:
        return ExpectationFailed()
