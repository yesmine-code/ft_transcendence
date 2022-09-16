#!/bin/bash
set -e


# Defining functions
setConfig() {
	echo $1 >> "$PGDATA/postgresql.conf"
}

setDatabase() {
	find /docker-entrypoint-initdb.d/sql -name $1 -exec psql -U $POSTGRES_USER $POSTGRES_DB -f {} \;
}


# Set configuration
setConfig "listen_addresses = '*'"
setConfig "port = $POSTGRES_PORT"

# Set database
setDatabase "tables.sql"