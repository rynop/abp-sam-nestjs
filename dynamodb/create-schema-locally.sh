#!/bin/bash

TNAME="local-SingleTable"

aws dynamodb delete-table --table-name ${TNAME} --endpoint-url http://localhost:8000 > /dev/null 2>&1

# TODO: don't use this when creating dynamo db table in aws.  Need to specify --billing-mode PAY_PER_REQUEST and no --provisioned-throughput or ProvisionedThroughput
#https://stackoverflow.com/questions/37357397/how-to-create-dynamodb-global-secondary-index-using-aws-cli
aws dynamodb create-table \
    --table-name ${TNAME} \
    --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S AttributeName=GSI1SK,AttributeType=S \
    --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=50,WriteCapacityUnits=50 \
    --global-secondary-indexes \
    IndexName=GSI1,KeySchema=["{AttributeName=GSI1PK,KeyType=HASH}","{AttributeName=GSI1SK,KeyType=RANGE}"],Projection="{ProjectionType=ALL}",ProvisionedThroughput="{ReadCapacityUnits=50,WriteCapacityUnits=50}" \
    --endpoint-url http://localhost:8000 > /dev/null