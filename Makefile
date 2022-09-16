all: start

start:
	@ docker-compose up --build

stop:
	@ docker-compose down

destroy:
	@ docker-compose down --remove-orphans --volumes

clean: destroy
	@ docker system prune -f -a --volumes

.PHONY: all start stop destroy clean