FROM python:3.5-alpine
MAINTAINER Sergey Levitin <selevit@gmail.com>

RUN mkdir /app
WORKDIR /app

RUN set -x && \
    apk add --no-cache --virtual builddeps ca-certificates && \
    rm -rf /var/cache/apk/* /tmp/*

COPY ./requirements.txt /app/requirements.txt

RUN set -x && \
    pip install --no-cache-dir --disable-pip-version-check --upgrade pip && \
    pip install --no-cache-dir --disable-pip-version-check -r requirements.txt

COPY . /app

ENTRYPOINT ["python", "test_bots.py"]
