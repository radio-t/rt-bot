FROM java:latest

RUN mkdir bot
ADD target/bot.jar /bot
ADD target/dependency /bot/dependency

WORKDIR /bot

EXPOSE 8080

CMD ["java", "-cp", "bot.jar:./dependency/*:.", "com.gekoreed.Server"]