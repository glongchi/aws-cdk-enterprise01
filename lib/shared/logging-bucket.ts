import { Construct } from "constructs";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib";
import { Helpers } from "../utils/generate-bucket-name";
import { IBaseProps } from "./base.props";

export interface ILoggingBucketProps extends IBaseProps {
  logRetention?: number;
  //override(optional --> required ) region and environment for bucket name generation
  region: string;
  deploymentEnvronment: string;
}

export class LoggingBucket extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: ILoggingBucketProps) {
    super(scope, id);

    this.bucket = new Bucket(this, "LoggingBucket", {
      bucketName: Helpers.generateBucketName(
        props.region,
        props.deploymentEnvronment,
      ),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
    });
  }
}
