#!/bin/sh
set -e

PGDATA=/var/lib/postgresql/data

# First start: create the cluster and the two databases
if [ ! -s "$PGDATA/PG_VERSION" ]; then
  mkdir -p "$PGDATA"
  chown postgres:postgres "$PGDATA"
  echo "$DB_PASSWORD" > /tmp/pwfile
  chown postgres /tmp/pwfile
  runuser -u postgres -- /usr/local/pgbin/initdb -D "$PGDATA" -U postgres \
    --pwfile=/tmp/pwfile --auth-local=trust --auth-host=scram-sha-256
  rm /tmp/pwfile

  runuser -u postgres -- /usr/local/pgbin/pg_ctl -D "$PGDATA" -w -o "-c listen_addresses=''" start
  runuser -u postgres -- /usr/local/pgbin/createdb eventell
  runuser -u postgres -- /usr/local/pgbin/createdb keycloak
  runuser -u postgres -- /usr/local/pgbin/pg_ctl -D "$PGDATA" -w stop
fi

export KC_DB_PASSWORD="$DB_PASSWORD" SPRING_DATASOURCE_PASSWORD="$DB_PASSWORD"
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/eventell.conf
