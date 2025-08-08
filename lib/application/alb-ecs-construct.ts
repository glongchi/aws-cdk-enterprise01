import { Construct } from "constructs";
import {
  Cluster,
  ContainerImage,
  FargateTaskDefinition,
  FargateService,
  CpuArchitecture,
  OperatingSystemFamily,
  ContainerDefinition,
  AwsLogDriver,
  FargatePlatformVersion,
  Protocol,
} from "aws-cdk-lib/aws-ecs";
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
  IpAddressType,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Duration } from "aws-cdk-lib";
import {
  IVpc,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
} from "aws-cdk-lib/aws-ec2";
import path from "path";
import { Logging } from "aws-cdk-lib/custom-resources";
import { ILoggingBucketProps, LoggingBucket } from "../shared/logging-bucket";
import { IBaseProps } from "../shared/base.props";
import * as ecs from 'aws-cdk-lib/aws-ecs';

export interface IAlbEcsProps extends IBaseProps {
  vpc: IVpc;
}

export class AlbEcsConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: IAlbEcsProps,
    loggingBucketProps?: ILoggingBucketProps
  ) {
    super(scope, id);

    //#region security groups
    // Create Security Group for ALB

    const albSecurityGroup = new SecurityGroup(this, "AlbSecurityGroup", {
      vpc: props.vpc,
      securityGroupName: `${props.namePrefix}-AlbSecurityGroup`,
    });
    // Allow HTTP traffic from the load balancer
    albSecurityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(80),
      "Allow All HTTP traffic",
    );

    // Create Security Group firewall settings
    const ec2SecurityGroup = new SecurityGroup(this, "EC2SecurityGroup", {
      securityGroupName: `${props.namePrefix}-EC2SecurityGroup`,
      vpc: props.vpc,
      allowAllOutbound: true,
    });

    // Allow HTTP traffic from the load balancer
    ec2SecurityGroup.addIngressRule(
      // ec2.Peer.anyIpv4(),
      Peer.securityGroupId(albSecurityGroup.securityGroupId),
      Port.tcp(80),
      "Allow All HTTP traffic from ALB on port 80",
    );

    //#endregion

    //#region ECS Cluster and Task Definition
    // Create ECS Cluster
    const cluster = new Cluster(this, "EcsCluster", {
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
    const fargateTaskDefinition = new FargateTaskDefinition(
      this,
      "FargateTaskDefinition",
      {
        family: `${props.namePrefix}-fargateTaskDefinition`,
        cpu: 512,
        memoryLimitMiB: 1024,
        runtimePlatform: {
          cpuArchitecture: CpuArchitecture.ARM64,
          operatingSystemFamily: OperatingSystemFamily.LINUX,
        },
      },
    );

    // Create AWS Fargate Container
    const fargateContainer = new ContainerDefinition(
      this,
      `EMD-FargateContainer`,
      {
        taskDefinition: fargateTaskDefinition,
        containerName: "EMD-FargateContainer",
        image: ContainerImage.fromAsset(
          path.resolve(__dirname, "../local-image"),
        ),
        portMappings: [
          {
            containerPort: 80,
            hostPort: 80,
            protocol: Protocol.TCP,
          },
        ],
        environment: {
          EMD_VAR: "option 1",
          FAVORITE_DESSERT: "ice cream",
        },
        logging: new AwsLogDriver({ streamPrefix: "infra" }),
      },
    );

    const service = new FargateService(this, `EcsService`, {
      assignPublicIp: true,
      cluster: cluster,
      taskDefinition: fargateTaskDefinition,
      platformVersion: FargatePlatformVersion.LATEST,
      vpcSubnets: {
        subnets: [props.vpc.publicSubnets[0], props.vpc.publicSubnets[1]],
      },
      securityGroups: [ec2SecurityGroup],
    });

    // // Add health check to the container
    // fargateContainer.addHealthCheck({
    //   command: ['CMD-SHELL', 'curl -f http://localhost/ || exit 1'],
    //   interval: Duration.seconds(30),
    //   timeout: Duration.seconds(5),
    //   retries: 3,
    //   startPeriod: Duration.seconds(10),
    // });

    //#endregion

    //#region Application Load Balancer
    // Create Application Load Balancer

    const alb = new ApplicationLoadBalancer(this, "AppALB", {
      vpc: props.vpc,
      internetFacing: true,
      ipAddressType: IpAddressType.IPV4,
      securityGroup: albSecurityGroup,
      loadBalancerName: `${props.namePrefix}-AppALB`,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
        subnets: props.vpc.publicSubnets,
      },
    });

    // Add HTTP Listener
    const httpListener = alb.addListener("HTTPListner", {
      port: 80,
      protocol: ApplicationProtocol.HTTP,
    });

    // Add listener target
    httpListener.addTargets("ECSAppTarget", {
      protocol: ApplicationProtocol.HTTP,
      targetGroupName: `${props.namePrefix}-AppTG`,
      targets: [
        service.loadBalancerTarget({
          containerName: "EMD-FargateContainer",
        }),
      ],
    });

    if (loggingBucketProps) {
      // Enable access logging for the ALB
    const loggingBucket = new LoggingBucket(this, "AccessLogsBucket",loggingBucketProps)
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
