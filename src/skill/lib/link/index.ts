import * as net from "node:net";
import * as tls from "node:tls";
import * as certnames from "certnames";
import * as Common from "../../../common";
import * as Database from "./user-database";
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
      if (error instanceof Common.Error.AuthorizationCommonError) {
        throw error;
      }
      throw new Common.Error.LinkCommonError({
        code: "userProfileFetchFailed",
        cause: error,
      });
    }
    await Database.setSkillToken(userId, skillToken);
    record = await Database.getRequiredRecordUsingSkillToken(skillToken, {
      requiredFields: ["userId"],
    });
  }
  if (record.userId === null) {
    throw new Common.Error.DatabaseCommonError({
      code: "fieldNotFound",
      message: `skill link user database is missing field 'userId' for 'skillToken'='${skillToken}'`,
    });
  }
  if (typeof bridgeHostname === "string") {
    await Database.setBridgeHostname(record.userId, bridgeHostname);
    record = await Database.getRequiredRecordUsingSkillToken(skillToken, {
      requiredFields: ["userId"],
    });
    if (record.userId === null) {
      throw new Common.Error.DatabaseCommonError({
        code: "fieldNotFound",
        message: `skill link user database is missing field 'userId' for 'skillToken'='${skillToken}'`,
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
  if (bridgeHostname === null) {
    throw new Common.Error.AuthorizationCommonError({
      code: "bridgeHostnameNotFound",
    });
  }
  if (bridgeToken === null) {
    throw new Common.Error.AuthorizationCommonError({
      code: "bridgeTokenNotFound",
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
      error instanceof Common.HTTPSRequest.HttpCommonError &&
      error.code === "unauthorized"
    ) {
      /* try again with a new bridge token */
      const { bridgeHostname, bridgeToken } = await getCredentials(skillToken, {
        updateBridgeToken: true,
      });
      if (bridgeHostname === null) {
        throw new Common.Error.AuthorizationCommonError({
          code: "bridgeHostnameNotFound",
        });
      }
      if (bridgeToken === null) {
        throw new Common.Error.AuthorizationCommonError({
          code: "bridgeTokenNotFound",
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
          const error = new Common.Error.LinkCommonError({
            code: "tcpConnectionFailed",
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
          const error = new Common.Error.LinkCommonError({
            code: "tlsConnectionFailed",
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
          const error = new Common.Error.LinkCommonError({
            code: "tlsCertificateValidationFailed",
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
          const error = new Common.Error.LinkCommonError({
            code: "tlsCertificateHostnameValidationFailed",
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
      if (error instanceof Common.HTTPSRequest.HttpCommonError) {
        switch (error.code) {
          case "badGateway": {
            throw new Common.Error.LinkCommonError({
              code: "httpConnectionFailed",
              cause: error,
            });
          }
          case "unauthorized": {
            throw new Common.Error.LinkCommonError({
              code: "authorizationFailed",
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
    throw new Common.Error.LinkCommonError({
      code: "bridgeHostnameNotFound",
    });
  }
  if (bridgeCredentials.bridgeToken === null) {
    throw new Common.Error.LinkCommonError({
      code: "bridgeTokenNotFound",
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
