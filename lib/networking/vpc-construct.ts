import { Construct } from "constructs";
import { SubnetConfiguration, Vpc } from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class VpcConstruct extends Construct {
  public readonly vpc: Vpc;

  constructor(
    scope: Construct,
    id: string,
    namePrefix: string,
    maxAzs: number = 3,
    natGateways: number = 1,
    publicSubnetCidrMask: number = 24,
    privateSubnetCidrMask: number = 24,
  ) {
    super(scope, id);

    this.vpc = new Vpc(this, "Vpc", {
      maxAzs: maxAzs,
      natGateways: natGateways,
      subnetConfiguration: this.createSubnetConfigurations(
        namePrefix,
        maxAzs,
        publicSubnetCidrMask,
        privateSubnetCidrMask,
      ),
    });
  }

  /**
   *
   * @param namePrefix
   * @param azCount
   * @param publicSubnetCidrMask
   * @param privateSubnetCidrMask
   * @returns
   */
  private createSubnetConfigurations(
    namePrefix: string,
    azCount: number,
    publicSubnetCidrMask: number,
    privateSubnetCidrMask: number,
  ): SubnetConfiguration[] {
    if (azCount < 1 || azCount > 6) {
      throw new Error("azCount must be between 1 and 6");
    }
    const output: SubnetConfiguration[] = [];
    // Create subnet configurations based on the number of availability zones
    for (let i = 1; i <= azCount; i++) {
      output.push(
        this.createSubnetConfiguration(
          `${namePrefix}-PublicSubnet${i}`,
          ec2.SubnetType.PUBLIC,
          publicSubnetCidrMask,
        ),
      );
      output.push(
        this.createSubnetConfiguration(
          `${namePrefix}-PrivateSubnet${i}`,
          ec2.SubnetType.PRIVATE_WITH_EGRESS,
          privateSubnetCidrMask,
        ),
      );
      output.push(
        this.createSubnetConfiguration(
          `${namePrefix}-IsolatedSubnet${i}`,
          ec2.SubnetType.PRIVATE_ISOLATED,
        ),
      );
    }
    return output;
  }

  /**
   * Helper function that generates a VPC subnet configuration.
   * @param subnetName - The name of the subnet
   * @param subnetType - The type of the subnet (e.g., PUBLIC, PRIVATE)
   * @param CidrMask - The CIDR mask for the subnet
   * @returns A SubnetConfiguration object
   */

  private createSubnetConfiguration(
    subnetName: string,
    subnetType: ec2.SubnetType,
    cidrMask: number = 24,
  ): ec2.SubnetConfiguration {
    const subnetConfig: SubnetConfiguration = {
      name: subnetName,
      subnetType: subnetType,
      cidrMask: cidrMask,
    };
    return subnetConfig;
  }
}
