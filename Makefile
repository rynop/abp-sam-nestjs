
# Thank you https://github.com/aspiration-labs/pyggpot/blob/master/Makefile
.PHONY: all clean db db-down dynamo*

#
# Runners
#

run/local-server:
	./build/cli server

ngrok:
	ngrok http -bind-tls=true -subdomain=$(shell hostname)-my-platform-api 8080

db-down:
	cd docker && docker-compose down

dynamo:
	cd docker && docker-compose up -d dynamo

dynamo/init: dynamo	
	./dynamodb/create-schema-locally.sh
	./dynamodb/load-data-locally.sh SingleTable

dynamo/down:
	cd docker && docker-compose stop dynamo

# Do this in lieu of db-down @see https://docs.docker.com/compose/reference/down/
dynamo/remove-volume:
	cd docker && docker-compose down --volumes
