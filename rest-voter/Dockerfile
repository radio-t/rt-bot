FROM openjdk:8

RUN mkdir /rest-voter

COPY . /rest-voter

RUN chmod 777 /rest-voter
RUN chmod 777 /rest-voter/gradlew

WORKDIR /rest-voter

EXPOSE 8080

CMD ["./gradlew", "bootRun"]