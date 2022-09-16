FROM postgres AS base

RUN apt-get update

COPY ./src/sql/ /docker-entrypoint-initdb.d/sql/
COPY ./src/script/ /docker-entrypoint-initdb.d/

RUN chmod a+r /docker-entrypoint-initdb.d/*

CMD ["-p", "4002"]