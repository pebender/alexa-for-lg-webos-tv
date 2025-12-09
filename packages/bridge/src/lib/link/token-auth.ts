import type { Credentials } from "./credentials";

export interface TokenAuth {
  authorize: (loginToken: string) => Promise<Credentials | null>;
}
