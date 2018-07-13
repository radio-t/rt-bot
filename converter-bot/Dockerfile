FROM python:3.5-alpine

COPY requirements.txt /tmp/
RUN pip install -r /tmp/requirements.txt

RUN mkdir /usr/converter-bot
COPY . /usr/converter-bot/
WORKDIR /usr/converter-bot/

EXPOSE 8080

CMD ["python", "main.py"]
