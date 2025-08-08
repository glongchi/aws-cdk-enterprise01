
/**
 * common  base properties for constructs, stacks, and applications
 * @interface IBaseProps
 */
export interface IBaseProps {
  namePrefix?: string;
  region?: string;
  deploymentEnvronment?: string;
  deploymentEnvironmentIndex?: number;
  // tags?: { [key: string]: string };
}