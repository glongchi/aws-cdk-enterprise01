import { App } from 'aws-cdk-lib';
import { AppStack } from '../lib/application/app-stack';
import { loadEnvConfig } from '../env-config-loader';
import { IEnvConfig } from '../lib/models/env-config.model';

const deploymentEnvList = ['dev', 'qa', 'stg', 'prod'];
//set deployment env at runtime: export DEPLOYMENT_ENV=dev|qa|stg|prod
const deploymentEnv = process.env.DEPLOYMENT_ENV || 'dev';
if (deploymentEnvList.indexOf(deploymentEnv) == -1) {
  console.error(`DEPLOYMENT ENV: ${deploymentEnv}`);
  throw new Error(`Deployment environment is not valid. Valid list of deployment envs include ${deploymentEnvList.join('|')} `);
}

const app = new App();
const config: IEnvConfig = loadEnvConfig(deploymentEnv);
// Ensure the config is loaded correctly
if (!config) {
  throw new Error('Configuration not loaded. Please check your config files.');
}
// create cdk App
new AppStack(app, `${config.namePrefix}Stack`, {
  env: { account: config.account, region: config.region },
  config: config,
});
