import { Injectable, Logger } from '@nestjs/common';
import { DynamoDB, Endpoint } from 'aws-sdk';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

if (process.env['AWS_SAM_LOCAL']) {
  ddb.endpoint = new Endpoint('http://dynamo:8000');
} else if ('local' == process.env['APP_STAGE']) {
  ddb.endpoint = new Endpoint('http://localhost:8000');
}


@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name, false);

  async getHello(): Promise<any> {
    // this.logger.log(process.env);    
    this.logger.log(`App env vars:`);
    this.logger.log(`APP_STAGE: ${process.env['APP_STAGE']}`);
    this.logger.log(`DDB_TABLENAME: ${process.env['DDB_TABLENAME']}`);
    this.logger.log(`SECRET_KEY: ${process.env['SECRET_KEY']}`);
    this.logger.log(`ENV_TEST: ${process.env['ENV_TEST']}`);

    const params = {
      Key: {
        "PK": {
          S: "USER-UUID-1"
        },
        "SK": {
          S: "USER"
        }
      },
      TableName: process.env['DDB_TABLENAME']
    };

    try {
      const d = await ddb.getItem(params).promise();
      this.logger.warn("The Item");
      this.logger.warn(d.Item);
      return d.Item || {};
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
