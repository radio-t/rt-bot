FROM python:3.5-alpine

COPY requirements.txt /tmp/

RUN pip3 install --no-cache-dir --disable-pip-version-check -r /tmp/requirements.txt

RUN mkdir /usr/rtnumber-bot/

COPY . /usr/rtnumber-bot/

WORKDIR /usr/rtnumber-bot/

EXPOSE 8080

CMD python3 -u main.py
