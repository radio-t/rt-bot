FROM golang:alpine

ADD . /go/src/github.com/umputun/excerpt-bot/excerpt
RUN \
 cd /go/src/github.com/umputun/excerpt-bot/excerpt && \
 go get -v && \
 go build -o /srv/excerpt && \
 rm -rf /go/src/*

EXPOSE 8080
WORKDIR /srv
CMD ["/srv/excerpt"]
