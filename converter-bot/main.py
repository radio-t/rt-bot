# coding: utf-8

import json
from flask import Flask, request, Response
from converter import Converter


def event():
    try:
        data = json.loads(request.data.decode('utf-8'))
    except ValueError:
        return silence()

    message = data.get('text')
    message = message.strip()
    app.converter.analyse(message)
    if 1 == 1:
        return Response(
            response=json.dumps({'text': message, 'bot': 'converter-bot'}),
            status=201,
            mimetype="application/json"
        )
    else:
        return silence()


def info():
    return Response(
        response=json.dumps({
            'author': "Sergey Kovalchuk",
            "info": "Бот конвертер "
        }),
        status=200,
        mimetype="application/json",
    )


def silence():
    return Response(
        response=json.dumps({'error': True, 'status': 417}),
        status=417,
        mimetype="application/json"
    )


app = Flask('converter-bot')
app.converter = Converter()

app.add_url_rule('/event', 'event', event, methods=['POST'])
app.add_url_rule('/info', 'info', info, methods=['GET'])

if __name__ == "__main__":
    # app.run(host='0.0.0.0', port=8080)
    app.run(host='0.0.0.0', debug=True)
