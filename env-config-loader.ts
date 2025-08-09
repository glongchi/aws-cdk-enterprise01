// cdk/config/config-loader.ts
import * as fs from "fs";
import { IEnvConfig } from "./lib/models/env-config.model";
import { Helpers } from "./lib/utils/helpers";

export function loadEnvConfig(env: string): IEnvConfig {
  const baseConfig=  JSON.parse(fs.readFileSync(`./env/base.json`, "utf8"));
  const envConfig=  JSON.parse(fs.readFileSync(`./env/${env}.json`, "utf8"));
  const config = { ...baseConfig, ...envConfig}

  console.log("CONFIG JSON", config);

  config.namePrefix = Helpers.generateResourceNamePrefix(config);
  return config;
}
