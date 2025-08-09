import { Construct } from 'constructs';
import { IVpc, Vpc } from 'aws-cdk-lib/aws-ec2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { IBaseProps } from '@shared/base.props';

/**
 * Interface for VPC properties
 * @interface IVpcProps
 */
export interface IVpcProps extends IBaseProps {
  namePrefix: string;
  maxAzs?: number;
  natGateways?: number;
  cidr: string;
  publicSubnetCidrMask?: number;
  privateSubnetCidrMask?: number;
}

export class VpcConstruct extends Construct {
  public readonly vpc: IVpc;

  constructor(scope: Construct, id: string, props: IVpcProps) {
    super(scope, id);

    this.vpc = new Vpc(this, 'Vpc', {
      // vpcName: `${props.namePrefix}-Vpc`,
      maxAzs: props.maxAzs,
      ipAddresses: ec2.IpAddresses.cidr(props.cidr),
      natGateways: props.natGateways,
      subnetConfiguration: [
        {
          cidrMask: props.publicSubnetCidrMask,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: props.privateSubnetCidrMask,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });
  }

}
