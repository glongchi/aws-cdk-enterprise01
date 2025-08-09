import { Construct } from 'constructs';
// import {
//   Cluster,
//   ContainerImage,
//   FargateTaskDefinition,
//   FargateService,
//   CpuArchitecture,
//   OperatingSystemFamily,
//   ContainerDefinition,
//   AwsLogDriver,
//   FargatePlatformVersion,
//   Protocol,
// } from "aws-cdk-lib/aws-ecs";
// import {
//   ApplicationLoadBalancer,
//   ApplicationProtocol,
//   IpAddressType,
// } from "aws-cdk-lib/aws-elasticloadbalancingv2";
// import { Duration } from "aws-cdk-lib";
// import {
//   IVpc,
//   Peer,
//   Port,
//   SecurityGroup,
//   SubnetType,
// } from "aws-cdk-lib/aws-ec2";
// import path from "path";
// import { Logging } from "aws-cdk-lib/custom-resources";
// import { ILoggingBucketProps, LoggingBucket } from "../shared/logging-bucket";
// import { IBaseProps } from "../shared/base.props";
// import * as ecs from "aws-cdk-lib/aws-ecs";

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ApplicationProtocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import { IBaseProps } from '../shared/base.props';
import { ILoggingBucketProps, LoggingBucket } from '../shared/logging-bucket';
import { IContainerEnvironmentVariables } from '../models/env-config.model';

export interface IAlbEcsProps extends IBaseProps {
  vpc: ec2.IVpc;
  //ECS container and service configs
  desiredCount: number;
  minHealthyPercent: number;
  maxHealthyPercent: number;
  cpu: number;
  memoryLimitMiB: number;
  containerEnvironmentVariables: IContainerEnvironmentVariables;
}

export class AlbEcsConstruct extends Construct {
  constructor(scope: Construct, id: string, props: IAlbEcsProps, loggingBucketProps?: ILoggingBucketProps) {
    super(scope, id);

    //#region security groups
    // Create Security Group for ALB
    const albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: props.vpc,
      securityGroupName: `${props.namePrefix}-AlbSecurityGroup`,
    });
    // Allow HTTP traffic from the load balancer
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow All HTTP traffic');

    // Create Security Group firewall settings
    const ec2SecurityGroup = new ec2.SecurityGroup(this, 'EC2SecurityGroup', {
      securityGroupName: `${props.namePrefix}-EC2SecurityGroup`,
      vpc: props.vpc,
      allowAllOutbound: true,
    });

    // Allow HTTP traffic from the load balancer
    ec2SecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(albSecurityGroup.securityGroupId),
      ec2.Port.tcp(80),
      'Allow All HTTP traffic from ALB on port 80 only',
    );

    //#endregion

    //#region ECS Cluster and Task Definition
    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc: props.vpc,
      clusterName: `${props.namePrefix}-EcsCluster`,
      //   containerInsights: true,
      //   enableFargateCapacityProviders: true,
      //   defaultCloudMapNamespace: {
      //     name: `${props.namePrefix}.local`,
      //   },
      // Uncomment the following line if you want to enable service discovery
      // enableServiceDiscovery: true,
    });

    // Create ECS Task Definition Template
    const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, 'FargateTaskDefinition', {
      family: `${props.namePrefix}-fargateTaskDefinition`,
      cpu: props.cpu,
      memoryLimitMiB: props.memoryLimitMiB,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    // Create AWS Fargate Container
    const fargateContainer = new ecs.ContainerDefinition(this, `EMD-FargateContainer`, {
      taskDefinition: fargateTaskDefinition,
      containerName: 'EMD-FargateContainer',
      image: ecs.ContainerImage.fromAsset(path.resolve(__dirname, '../local-image')),
      portMappings: [
        {
          containerPort: 80,
          hostPort: 80,
          protocol: ecs.Protocol.TCP,
        },
      ],
      environment: {
        EMD_VAR: 'option 1',
        FAVORITE_DESSERT: props.containerEnvironmentVariables.favoriteDessert,
      },
      logging: new ecs.AwsLogDriver({ streamPrefix: 'infra' }),
      // health check
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost/ || exit 1'],
        // the properties below are optional
        interval: cdk.Duration.seconds(30),
        retries: 3,
        startPeriod: cdk.Duration.seconds(120),
        timeout: cdk.Duration.seconds(10),
      },
    });

    const service = new ecs.FargateService(this, `EcsService`, {
      assignPublicIp: true,
      cluster: cluster,
      taskDefinition: fargateTaskDefinition,
      platformVersion: ecs.FargatePlatformVersion.LATEST,
      desiredCount: props.desiredCount, // Sets the initial desired count to 2 tasks
      minHealthyPercent: props.minHealthyPercent,
      maxHealthyPercent: props.maxHealthyPercent,
      vpcSubnets: {
        subnets: props.vpc.privateSubnets,
      },
      securityGroups: [ec2SecurityGroup],
    });

    //#endregion

    //#region Application Load Balancer
    // Create Application Load Balancer

    const alb = new elbv2.ApplicationLoadBalancer(this, 'AppALB', {
      vpc: props.vpc,
      internetFacing: true,
      ipAddressType: elbv2.IpAddressType.IPV4,
      securityGroup: albSecurityGroup,
      loadBalancerName: `${props.namePrefix}-AppALB`,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    // Add HTTP Listener
    const httpListener = alb.addListener('HTTPListner', {
      port: 80,
      protocol: ApplicationProtocol.HTTP,
    });

    // Add listener target
    httpListener.addTargets('ECSAppTarget', {
      protocol: ApplicationProtocol.HTTP,
      targetGroupName: `${props.namePrefix}-AppTG`,
      targets: [
        service.loadBalancerTarget({
          containerName: 'EMD-FargateContainer',
        }),
      ],
    });

    if (loggingBucketProps) {
      // Enable access logging for the ALB
      const loggingBucket = new LoggingBucket(this, 'AccessLogsBucket', loggingBucketProps);
      alb.logAccessLogs(loggingBucket.bucket, `${props.namePrefix}-alb-logs`);
    }

    //#endregion

    //#region
    //#endregion

    // listener.addTargets('AppTargets', {
    //   port: 80,
    //   targets: [service],
    //   protocol: ApplicationProtocol.HTTP,
    //   targetGroupName: 'AppTG',
    //   healthCheck: {
    //     path: '/',
    //     interval: Duration.seconds(30),
    //   },
    // });
  }
}
