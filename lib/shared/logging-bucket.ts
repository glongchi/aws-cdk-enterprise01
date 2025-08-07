import { Construct } from 'constructs';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { Helpers } from '../utils/generate-bucket-name';

export class LoggingBucket extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, region: string,env: string, logRetentionDays: number = 30) {
    super(scope, id);

    this.bucket = new Bucket(this, 'LoggingBucket', {
          bucketName: Helpers.generateBucketName(region,env),
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        versioned: true
    });
  }
}