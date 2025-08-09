import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IVpcProps, VpcConstruct } from '../network/vpc-construct';
import { ILoggingBucketProps, LoggingBucket } from '../shared/logging-bucket';
import { AlbEcsConstruct, IAlbEcsProps } from './alb-ecs-construct';
import { IBaseProps } from '../shared/base.props';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { IEnvConfig } from '../models/env-config.model';
import { Helpers } from '../utils/helpers';

interface AppStackProps extends StackProps, IBaseProps {
  config: IEnvConfig;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // Initialize VPC  properties
    const vpcProps: IVpcProps = {
      namePrefix: props.config.namePrefix,
      maxAzs: props.config.vpc.maxAzs,
      natGateways: props.config.vpc.natGateways,
      cidr: props.config.vpc.cidr,
      publicSubnetCidrMask: props.config.vpc.publicSubnetCidrMask,
      privateSubnetCidrMask: props.config.vpc.privateSubnetCidrMask,
    };
    // Initialize Logging Bucket properties
    const loggingBucketProps: ILoggingBucketProps = {
      logInstantAccessDuration: props.config.logBucket.logInstantAccessDuration,
      logExpirationDuration: props.config.logBucket.logExpirationDuration,
      region: props.config.region,
      deploymentEnvronment: props.config.deploymentEnvironment,
      namePrefix: props.config.namePrefix,
    };

    // Create VPC
    const vpc = new VpcConstruct(this, 'AppVpc', vpcProps);

    // initialize albEcs construct props
    const albEcsProps: IAlbEcsProps = {
      namePrefix: props.config.namePrefix,
      vpc: vpc.vpc,
      desiredCount: props.config.container.desiredCount,
      minHealthyPercent: props.config.container.minHealthyPercent,
      maxHealthyPercent: props.config.container.maxHealthyPercent,
      cpu: props.config.container.cpu,
      memoryLimitMiB: props.config.container.memoryLimitMiB,
      containerEnvironmentVariables: props.config.containerEnvironmentVariables,
    };

    // ALB and ECS Cluster
    new AlbEcsConstruct(this, 'AlbEcs', albEcsProps, loggingBucketProps);
  }
}
