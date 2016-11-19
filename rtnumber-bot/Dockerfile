FROM python:3.5-alpine

RUN set -x && \
    apk add --no-cache --virtual builddeps ca-certificates && \
    rm -rf /var/cache/apk/* /tmp/*

COPY requirements.txt /tmp/

RUN pip3 install --no-cache-dir --disable-pip-version-check -r /tmp/requirements.txt

RUN apk --no-cache add git && cd /tmp/ && git clone https://github.com/disqus/disqus-python.git && \
    cd disqus-python && python3 setup.py install

RUN mkdir /usr/rtnumber-bot/

COPY . /usr/rtnumber-bot/

WORKDIR /usr/rtnumber-bot/

EXPOSE 8080

CMD python3 -u main.py
