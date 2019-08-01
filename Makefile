.PHONY: all server clean run* dynamo* ngrok docker*

server:
	rm -rf dist
	yarn run tsc -p tsconfig.build.json

#
# Runners
#

ngrok:
	# Let ngrok handle HTTPS.  Vaild SSL cert needed for mobile dev. @see https://rynop.com/2019/05/09/howto-mobile-development-against-a-localhost-https-api/
	ngrok http -bind-tls=true -subdomain=$(shell hostname)-my-platform-api 8081

run/local-dev-server: dynamo/up
	yarn run start:dev

run/watch:
	yarn run watch

run/sam-start-api: dynamo/up
	sam local start-api -t sam-template.yml --skip-pull-image --profile default \
	--docker-network abp-sam-backend \
	--parameter-overrides 'ParameterKey=StageName,ParameterValue=local ParameterKey=DDBTableName,ParameterValue=local-SingleTable ParameterKey=SomeSecretInSSM,ParameterValue=SecretSetInSamLocalParameterOverrides'	

run/prod: server
	node dist/main.js	

#
# Docker commands
#

dynamo/up:
	cd docker && docker-compose up -d dynamo

# Load local DynamoDB with sample data (dropping table if exists)
dynamo/init: dynamo/up	
	./dynamodb/create-schema-locally.sh
	./dynamodb/load-data-locally.sh SingleTable

dynamo/down:
	cd docker && docker-compose stop dynamo

docker/down:
	cd docker && docker-compose down

# Do this in lieu of docker/down @see https://docs.docker.com/compose/reference/down/
docker/remove-volume:
	cd docker && docker-compose down --volumes

clean:
	rm -rf dist
	rm -rf deploy