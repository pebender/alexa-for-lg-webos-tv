import type { Credentials } from "./credentials";

export abstract class Application {
  public abstract start(): Promise<void>;
  public abstract getRequestSkillToken(request: object): string;
  public abstract handleRequest(
    request: object,
    credentials: Credentials,
  ): Promise<object>;
}
