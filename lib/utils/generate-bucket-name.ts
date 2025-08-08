export class Helpers {
  /**
   * Generates a bucket name based on the region and environment.
   * The format is: env-region-timestamp
   * @param region - The AWS region
   * @param env - The environment (e.g., dev, qa, stg, prod)
   * @returns A formatted bucket name
   */
  static generateBucketName(region: string, env: string): string {
    const timestamp = new Date().toISOString().split("T")[0];
    const result = `${env}-${region}-${timestamp}`;
    return result.toLocaleLowerCase();
  }
}
