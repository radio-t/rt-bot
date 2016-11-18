FROM alpine:3.4

COPY requirements.txt /tmp/

RUN echo "@community http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories

RUN apk add --update --no-cache python3 python3-dev ffmpeg ca-certificates gcc g++ curl openblas-dev@community

RUN ln -s /usr/include/locale.h /usr/include/xlocale.h

RUN pip3 install --no-cache-dir --disable-pip-version-check -r /tmp/requirements.txt

RUN mkdir /usr/ksenks-bot/

COPY . /usr/ksenks-bot/

WORKDIR /usr/ksenks-bot/

EXPOSE 8080

CMD python3 main.py