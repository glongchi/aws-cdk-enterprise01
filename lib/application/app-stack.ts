import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { IVpcProps, VpcConstruct } from "../networking/vpc-construct";
import { ILoggingBucketProps, LoggingBucket } from "../shared/logging-bucket";
import { AlbEcsConstruct, IAlbEcsProps } from "./alb-ecs-construct";
import { IBaseProps } from "../shared/base.props";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { IEnvConfig } from "../models/env-config.model";

interface AppStackProps extends StackProps, IBaseProps {
  config: IEnvConfig;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // Initialize VPC  properties
    const vpcProps: IVpcProps = {
      namePrefix: `EMD-${props.config.deploymentEnvironment}`,
      maxAzs: props.config.maxAzs,
      natGateways: props.config.natGateways,
      cidr: props.config.cidr,
      publicSubnetCidrMask: props.config.publicSubnetCidrMask,
      privateSubnetCidrMask: props.config.privateSubnetCidrMask,
    };
    // Initialize Logging Bucket properties
    const loggingBucketProps: ILoggingBucketProps = {
      logInstantAccessDuration: props.config.logInstantAccessDuration,
      logExpirationDuration: props.config.logExpirationDuration,
      region: props.config.region,
      deploymentEnvronment: props.config.deploymentEnvironment,
      namePrefix: props.config.appName,
    };

    // Create VPC
    const vpc = new VpcConstruct(this, "AppVpc", vpcProps);

    // ALB and ECS Cluster
    new AlbEcsConstruct(
      this,
      "AlbEcsConstruct",
      {
        vpc: vpc.vpc,
        namePrefix: props.namePrefix,
      },
      loggingBucketProps,
    );
  }
}
