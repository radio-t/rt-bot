FROM java:8

RUN mkdir /tmp_b && \
    mkdir /wb
COPY . /tmp_b
RUN chmod 777 /tmp_b/gradlew
WORKDIR /tmp_b

RUN ./gradlew -g /tmp_b/tmp build -Dorg.gradle.daemon=false
RUN mv ./build/libs/weather-bot-0.1.jar /wb && \
    rm -rf /tmp_b

WORKDIR /wb

EXPOSE 8080

CMD ["java", "-jar", "weather-bot-0.1.jar"]
