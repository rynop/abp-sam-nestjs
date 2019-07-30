#!/bin/bash

# usage: export-data-for-local-import.sh <TableName> [-r us-east-2] [-l]

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
USE_LOCAL=""
Region=""

TableName="$1"
shift

while getopts ":lr:" opt; do
  case ${opt} in
    l )
      USE_LOCAL='--endpoint-url http://localhost:8000'
      ;;
    r )
      Region="--region $OPTARG"
      ;;      
    \?)
      echo "Invalid option. -$OPTARG usage: export-data-for-local-import.sh <TableName> [-r us-east-2] [-l]" >&2
      exit 1
      ;;    
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;      
  esac
done

chkreqs() {
    command -v jq > /dev/null
    test $? -ne 0 && abort "jq required"
}

chkreqs

echo "RUNNING: aws dynamodb scan --table-name ${TableName} ${Region} ${USE_LOCAL}"

aws dynamodb scan --table-name ${TableName} ${Region} ${USE_LOCAL} \
| jq --arg TableName ${TableName} '{ ($TableName): [.Items[] | {PutRequest: {Item: .}}]}' > ${DIR}/data/${TableName}.json

test $? -eq 0 && echo "WROTE: ${DIR}/data/${TableName}.json"