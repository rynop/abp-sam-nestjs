#!/bin/bash

DataFile="$1"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

aws dynamodb batch-write-item --request-items file://${DIR}/data/${DataFile}.json --endpoint-url http://localhost:8000 > /dev/null