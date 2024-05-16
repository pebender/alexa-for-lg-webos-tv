import * as net from "node:net";
import * as tls from "node:tls";
import * as certnames from "certnames";
import * as Common from "../../../common";
import * as Database from "./user-db";
import * as Login from "./login";

export async function getHostnames(ipAddress: string): Promise<string[]> {
  const ipPort = Common.constants.bridge.port.https;

  return await new Promise((resolve, reject): void => {
    const sock = tls.connect(ipPort, ipAddress, { rejectUnauthorized: false });
    sock.on("secureConnect", (): void => {
      const cert = sock.getPeerCertificate().raw;
      sock.on("close", (): void => {
        const hostnames = certnames.getCommonNames(cert);
        resolve(hostnames);
      });
      sock.end();
    });
    sock.on("error", (error: Error): void => {
      reject(error);
    });
  });
}

export async function getCredentials(
  skillToken: string,
  options?: {
    bridgeHostname?: string;
    updateBridgeToken?: boolean;
  },
): Promise<{ bridgeHostname: string | null; bridgeToken: string | null }> {
  const bridgeHostname: string | null = options?.bridgeHostname ?? null;
  let updateBridgeToken: boolean = options?.updateBridgeToken ?? false;

  let record: Database.Record | null;
  record = await Database.getRecordUsingSkillToken(skillToken, {
    requiredFields: ["userId"],
  });
  if (record === null) {
    /* skillToken changed (or is new), so get a new bridgeToken (if
    bridgeHostname is known) */
    updateBridgeToken = true;

    let userId: string;
    try {
      const profile = await Common.Profile.getUserProfile(skillToken);
      userId = profile.userId;
    } catch (error) {
      if (
        error instanceof Common.Error.CommonError &&
        typeof error.general === "string" &&
        error.general === "authorization"
      ) {
        throw error;
      }
      throw Common.Error.create({
        general: "link",
        specific: "skill_user_profile",
        cause: error,
      });
    }
    await Database.setSkillToken(userId, skillToken);
    record = await Database.getRequiredRecordUsingSkillToken(skillToken, {
      requiredFields: ["userId"],
    });
  }
  if (record.userId === null) {
    throw Common.Error.create({
      message: `skill link user database is missing field 'userId' for 'skillToken'='${skillToken}'`,
      general: "database",
      specific: "field_value_not_found+userId",
    });
  }
  if (typeof bridgeHostname === "string") {
    await Database.setBridgeHostname(record.userId, bridgeHostname);
    record = await Database.getRequiredRecordUsingSkillToken(skillToken, {
      requiredFields: ["userId"],
    });
    if (record.userId === null) {
      throw Common.Error.create({
        message: `skill link user database is missing field 'userId' for 'skillToken'='${skillToken}'`,
        general: "database",
        specific: "field_value_not_found+userId",
      });
    }
  }
  if (
    record.bridgeHostname !== null &&
    (updateBridgeToken || record.bridgeToken === null)
  ) {
    const bridgeHostname: string = record.bridgeHostname;
    const bridgeToken: string = await Login.getBridgeToken(
      skillToken,
      bridgeHostname,
    );
    await Database.setBridgeCredentials(record.userId, {
      bridgeHostname,
      bridgeToken,
    });
    record = await Database.getRequiredRecordUsingSkillToken(skillToken, {
      requiredFields: ["userId"],
    });
  }

  return {
    bridgeHostname: record.bridgeHostname,
    bridgeToken: record.bridgeToken,
  };
}

export async function sendMessageUsingBridgeToken(
  path: string,
  skillToken: string,
  message: object,
): Promise<object> {
  const { bridgeHostname, bridgeToken } = await getCredentials(skillToken);
  if (bridgeHostname === null || bridgeToken === null) {
    throw Common.Error.create({
      general: "authorization",
      specific: "bridgeHostname_or_bridgeToken_not_found",
    });
  }

  const requestOptions: Common.HTTPSRequest.RequestOptions = {
    hostname: bridgeHostname,
    path,
    port: Common.constants.bridge.port.https,
    headers: {},
  };

  let response: object;
  try {
    response = await Common.HTTPSRequest.request(
      requestOptions,
      bridgeToken,
      message,
    );
  } catch (error) {
    if (
      (error as Common.Error.CommonError).general === "http" &&
      (error as Common.Error.CommonError).specific === "UNAUTHORIZED"
    ) {
      /* try again with a new bridge token */
      const { bridgeHostname, bridgeToken } = await getCredentials(skillToken, {
        updateBridgeToken: true,
      });
      if (bridgeHostname === null || bridgeToken === null) {
        throw Common.Error.create({
          general: "authorization",
          specific: "bridgeHostname_or_bridgeToken_not_found",
        });
      }

      const requestOptions: Common.HTTPSRequest.RequestOptions = {
        hostname: bridgeHostname,
        path,
        port: Common.constants.bridge.port.https,
        headers: {},
      };

      response = await Common.HTTPSRequest.request(
        requestOptions,
        bridgeToken,
        message,
      );
    } else {
      throw error;
    }
  }

  return response;
}

export async function testConnection(skillToken: string): Promise<void> {
  async function testTcp(hostname: string, port: number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const client = net.connect(port, hostname);
      client
        .on("connect", (): void => {
          client.end();
        })
        .on("close", (): void => {
          resolve();
        })
        .on("error", (cause): void => {
          const error = Common.Error.create({
            general: "link",
            specific: "test_failed_tcp_connection",
            cause,
          });
          reject(error);
        });
    });
  }

  async function testTls(hostname: string, port: number): Promise<void> {
    await new Promise<void>((resolve, reject): void => {
      const client = tls.connect(port, hostname, { rejectUnauthorized: false });
      client
        .on("secureConnect", (): void => {
          client.end();
        })
        .on("close", (): void => {
          resolve();
        })
        .on("error", (cause): void => {
          const error = Common.Error.create({
            general: "link",
            specific: "test_failed_tls_connection",
            cause,
          });
          reject(error);
        });
    });
  }

  async function testTlsTestCertificate(
    hostname: string,
    port: number,
  ): Promise<void> {
    await new Promise<void>((resolve, reject): void => {
      const client = tls.connect(port, hostname);
      client
        .on("secureConnect", (): void => {
          client.end();
        })
        .on("close", (): void => {
          resolve();
        })
        .on("error", (cause): void => {
          const error = Common.Error.create({
            general: "link",
            specific: "test_failed_tls_certificate_validation",
            cause,
          });
          reject(error);
        });
    });
  }

  async function testTlsTestHostname(
    hostname: string,
    port: number,
  ): Promise<void> {
    await new Promise<void>((resolve, reject): void => {
      const client = tls.connect(port, hostname, { servername: hostname });
      client
        .on("secureConnect", (): void => {
          client.end();
        })
        .on("close", (): void => {
          resolve();
        })
        .on("error", (cause): void => {
          const error = Common.Error.create({
            general: "link",
            specific: "test_failed_tls_hostname_validation",
            cause,
          });
          reject(error);
        });
    });
  }

  async function testBridgeConnection(
    bridgeToken: string,
    skillToken: string,
  ): Promise<void> {
    try {
      const request = { skillToken };
      await sendMessageUsingBridgeToken(
        Common.constants.bridge.path.test,
        skillToken,
        request,
      );
    } catch (error) {
      if (error instanceof Common.Error.CommonError) {
        switch (error.specific) {
          case "BAD_GATEWAY": {
            throw Common.Error.create({
              general: "link",
              specific: "link_failed_http",
              cause: error,
            });
          }
          case "INVALID_AUTHORIZATION_CREDENTIAL": {
            throw Common.Error.create({
              general: "link",
              specific: "link_failed_authorization",
              cause: error,
            });
          }
        }
      }
      throw error;
    }
  }

  const bridgeCredentials: {
    bridgeHostname: string | null;
    bridgeToken: string | null;
  } = await getCredentials(skillToken);
  if (bridgeCredentials.bridgeHostname === null) {
    throw Common.Error.create({
      general: "link",
      specific: "bridge_hostname_not_found",
    });
  }
  if (bridgeCredentials.bridgeToken === null) {
    throw Common.Error.create({
      general: "link",
      specific: "bridge_token_not_found",
    });
  }

  const { bridgeHostname, bridgeToken } = bridgeCredentials;
  const port = Common.constants.bridge.port.https;
  await testTcp(bridgeHostname, port);
  await testTls(bridgeHostname, port);
  await testTlsTestCertificate(bridgeHostname, port);
  await testTlsTestHostname(bridgeHostname, port);
  await testBridgeConnection(bridgeToken, skillToken);
}
