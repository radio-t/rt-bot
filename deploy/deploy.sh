#/bin/sh
cd /srv/rt-bot
echo "deploy bots"
/usr/bin/docker-compose ps

/usr/bin/docker-compose pull
/usr/bin/docker-compose up -d

/usr/bin/docker-compose ps
echo "all done"
