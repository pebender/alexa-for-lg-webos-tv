declare module "certnames" {
  export function getCommonNames(
    cert: string | Buffer,
    encoding?: "der" | "pem",
  ): string[];
}
