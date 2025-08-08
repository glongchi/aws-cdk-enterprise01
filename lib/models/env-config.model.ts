/***
 * This file is part of the AWS CDK Enterprise project.
 */
export interface IEnvConfig {
  account: string;
  region: string;
  appName: string;
  deploymentEnvironment: string;
  deploymentEnvironmentIndex?: number;

  namePrefix: string;
  maxAzs?: number;
  natGateways?: number;
  cidr: string;
  publicSubnetCidrMask?: number;
  privateSubnetCidrMask?: number;
  // log frequent access duration before transitioning to infrequent access
  logInstantAccessDuration: number;
  logExpirationDuration: number;
  // Add any other environment-specific properties you need
}
