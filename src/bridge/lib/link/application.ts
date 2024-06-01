import type { Credentials } from "./credentials";

export interface Application {
  start: () => Promise<void>;
  getRequestSkillToken: (request: object) => string;
  handleRequest: (request: object, credentials: Credentials) => Promise<object>;
}
