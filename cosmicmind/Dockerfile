FROM haskell:8

ADD . /app
RUN \
 cd /app && \
 cabal update && \
 cabal install
EXPOSE 8080
WORKDIR /srv
CMD ["cosmicmind"]
