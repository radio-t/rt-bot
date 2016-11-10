FROM golang:alpine

ADD . /go/src/github.com/umputun/rt-bot/gifs-bot
RUN apk --update add ca-certificates
RUN \
 cd /go/src/github.com/umputun/rt-bot/gifs-bot && \
 go build -o /srv/gifs-bot && \
 rm -rf /go/src/*

EXPOSE 8080
WORKDIR /srv
CMD ["/srv/gifs-bot"]