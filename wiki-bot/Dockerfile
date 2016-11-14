FROM java:latest
MAINTAINER Mike Shemanskiy <mike.shemanskiy@gmail.com>

RUN mkdir bot
ADD src /bot/src
ADD pom.xml /bot

RUN wget http://ftp.fau.de/apache/maven/maven-3/3.3.9/binaries/apache-maven-3.3.9-bin.tar.gz
RUN tar -zxvf apache-maven-3.3.9-bin.tar.gz
RUN rm apache-maven-3.3.9-bin.tar.gz
RUN mv apache-maven-3.3.9 /usr/lib/mvn

ENV M2_HOME=/usr/lib/mvn
ENV M2=$M2_HOME/bin
ENV PATH $PATH:$JAVA_HOME:$JAVA:$M2_HOME:$M2

RUN cd /bot \
    && mvn package \
    && mv target/rtbot-0.0.1-SNAPSHOT.jar . \
    && rm -r target src pom.xml /usr/lib/mvn

WORKDIR /bot

EXPOSE 8080

CMD ["java", "-jar", "rtbot-0.0.1-SNAPSHOT.jar"]