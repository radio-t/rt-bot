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
    display_name = data.get('display_name')
    message = message.strip()
    status, data = app.converter.analyse(message)
    if status:
        resp = display_name + ' упомянул ' + str(data['value']) + ' ' + str(data['unit'])
        for item in data['data']:
            resp += '\n\n' + ' ' + str(item['value']) + ' - ' + item['name']

        return Response(
            response=json.dumps({'text': resp, 'bot': 'converter-bot'}),
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
