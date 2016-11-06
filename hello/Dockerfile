FROM ubuntu:14.04.5

RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    make

RUN curl --silent https://raw.githubusercontent.com/miyagawa/cpanminus/1.7039/cpanm | perl - App::cpanminus
RUN cpanm Carton@v1.0.22

ADD cpanfile /app/
ADD cpanfile.snapshot /app/

WORKDIR /app

RUN carton install --deployment

ADD cmd /app
ADD app.psgi /app

EXPOSE 8080

CMD ./cmd
