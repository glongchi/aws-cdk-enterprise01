/***
 * This file is part of the AWS CDK Enterprise project.
 */
export interface IEnvConfig {
  account: string;
  region: string;
  appPrefix: string;
  deploymentEnvironment: string;
  deploymentEnvironmentIndex?: number;

  namePrefix: string;
  maxAzs?: number;
  natGateways?: number;
  cidr: string;
  publicSubnetCidrMask?: number;
  privateSubnetCidrMask?: number;
  // log frequent access duration before transitioning to infrequent access
  // logInstantAccessDuration: number;
  // logExpirationDuration: number;
  logBucket: ILogBucketConfig;
  vpc: IVpcConfig;
  container: IContainerConfig;
  containerEnvironmentVariables: IContainerEnvironmentVariables;
}

/**
 *
 */
export interface IVpcConfig {
  maxAzs?: number;
  natGateways?: number;
  cidr: string;
  publicSubnetCidrMask?: number;
  privateSubnetCidrMask?: number;
}

/**
 *
 */
export interface IContainerConfig {
  desiredCount: number;
  minHealthyPercent: number;
  maxHealthyPercent: number;
  cpu: number;
  memoryLimitMiB: number;
}

export interface IContainerEnvironmentVariables {
  favoriteDessert: string;
}

/**
 *
 */
export interface ILogBucketConfig {
  // log frequent access duration before transitioning to infrequent access
  logInstantAccessDuration: number;
  logExpirationDuration: number;
}
