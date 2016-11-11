FROM python:3.5.2

RUN pip install flask

CMD echo "import this, re, flask, json, base64\napp=flask.Flask(__name__)\nguido64=b'IVtndWlkb10oaHR0cHM6Ly9wYnMudHdpbWcuY29tL3Byb2ZpbGVfaW1hZ2VzLzQyNDQ5NTAwNC9HdWlkb0F2YXRhcl80MDB4NDAwLmpwZykK'\nguido=base64.b64decode(guido64).decode('utf-8')\nzen=''.join([this.d.get(c, c) for c in this.s])\nfind_guido=lambda s: re.search('.*?(guido|гвидо).*?', s, re.I) is not None\nmust_answer=lambda r: find_guido(r.get('text', '')) and r.get('username', '') != 'rt-bot'\ndef handler(): return (json.dumps({'text':guido+zen, 'bot': 'guido-bot'}), 201) if flask.request.is_json and must_answer(flask.request.json) else ('',417)\napp.route('/event', methods=['POST'])(handler)\napp.run('0.0.0.0', 8080)" | python