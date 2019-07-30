# abp-sam-nestjs

[aws-blueprint](https://github.com/rynop/aws-blueprint) example for a [NestJS](https://nestjs.com/) based API using AWS [Serverless Application Module (SAM)](https://github.com/awslabs/serverless-application-model) and DynamoDB (complete with local dev using [dynamodb local](https://hub.docker.com/r/amazon/dynamodb-local)).

## Prerequisites

1.  [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
1.  Create a [personal github access token](https://github.com/settings/tokens). This token will be used by the CI/CD to pull code.  If you work in a team, it is recommended to create a seperate github user account for this.
1.  S3 bucket to hold Lambda deployment zips. Only need 1 bucket per AWS account.
1.  Docker
1.  An SNS topic for CI/CD code promotion approvals. Subscribe your email address to it.

## Setup

1.  From [SSM](https://console.aws.amazon.com/systems-manager/parameters) create a key `/test/abp-sam-nestjs/master/envs/SECRET_KEY` with any value you like.  [sam-template.yml](./sam-template.yml) will pull in the value for an Lambda env var.  The key path used, is dictated by the stage specific cloudformaton parameter file in [aws/cloudformation/parameters](./aws/cloudformation/parameters)


