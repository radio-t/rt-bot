FROM java:latest
MAINTAINER Mike Shemanskiy <mike.shemanskiy@gmail.com>

RUN mkdir bot
ADD target/rtbot-0.0.1-SNAPSHOT.jar /bot

WORKDIR /bot

EXPOSE 8080

CMD ["java", "-jar", "rtbot-0.0.1-SNAPSHOT.jar"]
