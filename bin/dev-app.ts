// cdk/bin/dev-app.ts
import { App } from "aws-cdk-lib";
import { AppStack } from "../lib/application/app-stack";
import { loadConfig } from "../config-loader";
import { IEnvConfig } from "../lib/models/env-config.model";

const app = new App();
const config: IEnvConfig = loadConfig("dev");
// Ensure the config is loaded correctly
if (!config) {
  throw new Error("Configuration not loaded. Please check your config files.");
}
const appStack = new AppStack(app, "DevAppStack", {
  config: config,
});
