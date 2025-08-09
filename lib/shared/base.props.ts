/**
 * common  base properties for constructs, stacks, and applications
 *
 * @interface IBaseProps
 */
export interface IBaseProps {
  /**
   * name convention: <Application|Project|Company name>-<DeploymentEnvironment>-[<DeploymentEnvironmentIndex>]-<resource name|tye>
   */
  namePrefix?: string;
  region?: string;
  deploymentEnvronment?: string;
  /**
   * TODO::
   *  This property can be used when we intend to support multiple parallel envrionments
   * ex: dev-00 as the primary, dev-01, dev-02, ... as secondary or parallel evns
   */
  deploymentEnvironmentIndex?: number;
  // tags?: { [key: string]: string };
}
