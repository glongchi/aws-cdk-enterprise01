// cdk/config/config-loader.ts
import * as fs from "fs";
import { IEnvConfig } from "./lib/models/env-config.model";

export function loadConfig(env: string): IEnvConfig {
  return JSON.parse(fs.readFileSync(`./config/${env}.json`, "utf8"));
}
