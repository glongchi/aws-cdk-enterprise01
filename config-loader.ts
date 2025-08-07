// cdk/config/config-loader.ts
import * as fs from 'fs';

export function loadConfig(env: string): any {
  return JSON.parse(fs.readFileSync(`./config/${env}.json`, 'utf8'));
}
