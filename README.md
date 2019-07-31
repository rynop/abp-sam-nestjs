# abp-sam-nestjs

[aws-blueprint](https://github.com/rynop/aws-blueprint) example for a [NestJS](https://nestjs.com/) based API using AWS [Serverless Application Module (SAM)](https://github.com/awslabs/serverless-application-model).

Features:

-  DynamoDB (complete with local dev using [dynamodb local](https://hub.docker.com/r/amazon/dynamodb-local)).
-  Local dev server with hot-reload (quicker developer iterations than `sam local`)
-  Simulate API Gateway -> Lambda locally via `sam local start-api`.  Talks to DynamoDB local via docker-compose.
-  Multi-stage CI/CD via CodePipeline.  Convention over configuration, designed for teams and feature branches.
-  Straight forward enviornment varible configuration.  Supports pulling from SSM when running in AWS.
-  Realtime CodePipeline source pulls via GitHub webhook

## Prerequisites

1.  [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
1.  Create a [personal github access token](https://github.com/settings/tokens). This token will be used by the CI/CD to pull code. `repo` and `admin:repo_hook` scopes required.  If you work in a team, it is recommended to create a seperate github user account for this.
1.  S3 bucket to hold Lambda deployment zips. Only need 1 bucket per AWS account.
1.  Docker
1.  An SNS topic for CI/CD code promotion approvals. Subscribe your email address to it.

## Quickstart - local dev server with hot-reload

1.  `cp dotenv.example .env`
1.  `make dynamo/init` will load local DynamoDB with sample data (dropping table if exists).
1.  `yarn install`
1.  `make run/local-dev-server` will start server locally, and hot-reload on changes.
1.  Open http://127.0.0.1:8080/v1 If you look at the console you will see the app env vars. `ENV_TEST` is undefined? Keep reading...

## Simulate APIG + Lambda locally

This repo utlizes `sam local start-api` [cli](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using-start-api.html) to simulate APIG->Lambda->NestJS.

Enviornment variables are pulled from `sam-template.yml::Environment.Variables` (not `.env`).  To simulate how these will be set in cloudformation, the `--parameter-overrides` `sam` option is used.  See `run/sam-start-api` in [Makefile](./Makefile) for an example.

1. `make run watch` will compile typescript on file changes.
1. In another terminal run `make run/sam-start-api`
1. Open http://127.0.0.1:3000/v1 and look at the console for the app env vars.

Startup is slow right? This simulates Lambda cold starts. See [here](https://github.com/awslabs/aws-sam-cli/issues/239).

## Deploying to AWS via CI/CD (AWS CodePipeline) using GitHub webhook

The parameter `SomeSecretInSSM` in [sam-template.yml](./sam-template.yml) dictates where in [SSM](https://console.aws.amazon.com/systems-manager/parameters) to pull a value, which is then set as an env var in the lambda (see `SECRET_KEY` in [sam-template.yml](./sam-template.yml)). In CodePipeline you set the `SomeSecretInSSM` param value on a stage-by-stage basis [aws/cloudformation/parameters](./aws/cloudformation/parameters).  In [test--pipeline-parameters.json](./aws/cloudformation/parameters/test--pipeline-parameters.json) you'll notice it is set to `/test/abp-sam-nestjs/master/envs/SECRET_KEY`. If you update the value in SSM, just execute a stack update to [get the new env var into lambda](https://aws.amazon.com/blogs/mt/integrating-aws-cloudformation-with-aws-systems-manager-parameter-store/).

1. Clone this repo
1. From [SSM Console](https://console.aws.amazon.com/systems-manager/parameters) create a parameter `/test/abp-sam-nestjs/master/envs/SECRET_KEY` with any value you like.
1. Create a CI/CD pipeline via [CloudFormation](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/template) using [aws/cloudformation/pipeline.yml](./aws/cloudformation/pipeline.yml) using the name `abp-sam-nestjs--master--api--cicd` (naming convention is `[gitrepo]--[branch]--[eyecatcher]--cicd`)

