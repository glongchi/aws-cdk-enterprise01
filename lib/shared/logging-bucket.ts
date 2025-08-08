import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { Helpers } from "../utils/generate-bucket-name";
import { IBaseProps } from "./base.props";
import * as s3 from 'aws-cdk-lib/aws-s3';

/**
 * add specific props to customize(lifecycle, retention) log artifacts accross envs
 */
export interface ILoggingBucketProps extends IBaseProps {
  // must be >= 30 to transition to infrequent access
  logInstantAccessDuration: number;
  //log expiration should be greater than logRetention
  logExpirationDuration: number;
  //override(optional --> required ) region and environment for bucket name generation
  region: string;
  deploymentEnvronment: string;
}

export class LoggingBucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: ILoggingBucketProps) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, "LoggingBucket", {
      bucketName: Helpers.generateBucketName(
        props.region,
        props.deploymentEnvronment,
      ),
      // Destroy the bucket and its contents upon stack deletion
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // Ensure objects are automatically deleted when the stack is removed
      autoDeleteObjects: true,
      versioned: true,
    });

    // out-of-scope 
    // Add a lifecycle rule to the access logs bucket
    this.bucket.addLifecycleRule({
      enabled: true,
      // Transition objects to infrequent access after 30 days
      transitions: [{
        storageClass: s3.StorageClass.INFREQUENT_ACCESS,
        // could be parameterized
        transitionAfter: cdk.Duration.days(props.logInstantAccessDuration),
      }],
      // configurable retention accross environments
      expiration: cdk.Duration.days(props.logExpirationDuration), 
    });

  }
}
