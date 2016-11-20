#/bin/sh
cd /srv/rt-bot
echo "deploy bots"
/usr/bin/docker-compose ps

/usr/bin/docker-compose pull
/usr/bin/docker-compose up -d

/usr/bin/docker-compose ps

docker images --no-trunc | grep none | awk "{print \$3}" | xargs docker rmi

echo "all done"
