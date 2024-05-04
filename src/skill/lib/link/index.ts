import * as net from "node:net";
import * as tls from "node:tls";
import * as Common from "../../../common";
import * as Database from "./user-db";
import * as Login from "./login";
const certnames = require("certnames");

export async function getHostnames(ipAddress: string) {
  const ipPort = Common.constants.bridge.port.https;

  return new Promise((resolve, reject): void => {
    const sock = tls.connect(ipPort, ipAddress, { rejectUnauthorized: false });
    sock.on("secureConnect", (): void => {
      const cert = sock.getPeerCertificate().raw;
      sock.on("close", (): void => {
        const hostnames = certnames.getCommonNames(cert);
        return resolve(hostnames);
      });
      sock.end();
    });
    sock.on("error", (error): void => {
      reject(error);
    });
  });
}

export async function getCredentials(
  skillToken: string,
  hostname?: string,
): Promise<{ hostname: string | null; bridgeToken: string | null }> {
  let record: Database.Record | null;
  record = await Database.getRecordUsingSkillToken(skillToken, {
    requiredFields: ["email"],
  });
  if (record === null) {
    let email: string;
    try {
      email = await Common.Profile.getUserEmail(skillToken);
    } catch (cause: any) {
      throw Common.Error.create("", {
        general: "link",
        specific: "skill_user_profile",
        cause,
      });
    }
    await Database.setSkillToken(email, skillToken);
    record = await Database.getRequiredRecordUsingSkillToken(skillToken, {
      requiredFields: ["email"],
    });
  }
  if (record.email === null) {
    throw Common.Error.create(
      `skill link user database is missing field 'email' for 'skillToken'='${skillToken}'`,
      {
        general: "database",
        specific: "field_value_not_found+email",
      },
    );
  }
  if (typeof hostname === "string") {
    await Database.setHostname(record.email, hostname);
    record = await Database.getRequiredRecordUsingSkillToken(skillToken, {
      requiredFields: ["email"],
    });
    if (record.email === null) {
      throw Common.Error.create(
        `skill link user database is missing field 'email' for 'skillToken'='${skillToken}'`,
        {
          general: "database",
          specific: "field_value_not_found+email",
        },
      );
    }
  }
  if (record.hostname !== null && record.bridgeToken === null) {
    const hostname: string = record.hostname;
    const bridgeToken: string = await Login.getBridgeToken(
      skillToken,
      hostname,
    );
    await Database.setBridgeInformation(record.email, {
      hostname,
      bridgeToken,
    });
    record = await Database.getRequiredRecordUsingSkillToken(skillToken, {
      requiredFields: ["email"],
    });
  }

  return { hostname: record.hostname, bridgeToken: record.bridgeToken };
}

export async function testConnection(skillToken: string): Promise<void> {
  function testTcp(hostname: string, port: number): Promise<void> {
    return new Promise((resolve, reject): void => {
      const client = net.connect(port, hostname);
      client
        .on("connect", (): void => {
          client.end();
        })
        .on("close", (): void => {
          resolve();
        })
        .on("error", (cause: any): void => {
          const error = Common.Error.create("", {
            general: "link",
            specific: "test_failed_tcp_connection",
            cause,
          });
          reject(error);
        });
    });
  }

  function testTls(hostname: string, port: number): Promise<void> {
    return new Promise((resolve, reject): void => {
      const client = tls.connect(port, hostname, { rejectUnauthorized: false });
      client
        .on("secureConnect", (): void => {
          client.end();
        })
        .on("close", (): void => {
          resolve();
        })
        .on("error", (cause: any): void => {
          const error = Common.Error.create("", {
            general: "link",
            specific: "test_failed_tls_connection",
            cause,
          });
          reject(error);
        });
    });
  }

  function testTlsTestCertificate(
    hostname: string,
    port: number,
  ): Promise<void> {
    return new Promise((resolve, reject): void => {
      const client = tls.connect(port, hostname);
      client
        .on("secureConnect", (): void => {
          client.end();
        })
        .on("close", (): void => {
          resolve();
        })
        .on("error", (cause: any): void => {
          const error = Common.Error.create("", {
            general: "link",
            specific: "test_failed_tls_certificate_validation",
            cause,
          });
          reject(error);
        });
    });
  }

  function testTlsTestHostname(hostname: string, port: number): Promise<void> {
    return new Promise((resolve, reject): void => {
      const client = tls.connect(port, hostname, { servername: hostname });
      client
        .on("secureConnect", (): void => {
          client.end();
        })
        .on("close", (): void => {
          resolve();
        })
        .on("error", (cause: any): void => {
          const error = Common.Error.create("", {
            general: "link",
            specific: "test_failed_tls_hostname_validation",
            cause,
          });
          reject(error);
        });
    });
  }

  async function testBridgeConnection(
    hostname: string,
    port: number,
    bridgeToken: string,
  ): Promise<void> {
    const requestOptions: Common.HTTPSRequest.RequestOptions = {
      hostname,
      path: Common.constants.bridge.path.test,
      port,
      method: "GET",
      headers: {},
    };
    return new Promise((resolve, reject): void => {
      Common.HTTPSRequest.request(requestOptions, bridgeToken)
        .then(resolve)
        .catch((cause: any) => {
          if (
            typeof cause.general === "string" &&
            cause.general === "http" &&
            typeof cause.specific === "string"
          ) {
            switch (cause.specific) {
              case "BAD_GATEWAY":
                reject(
                  Common.Error.create("", {
                    general: "link",
                    specific: "link_failed_http",
                    cause,
                  }),
                );
                return;
              case "INVALID_AUTHORIZATION_CREDENTIAL":
                reject(
                  Common.Error.create("", {
                    general: "link",
                    specific: "link_failed_authorization",
                    cause,
                  }),
                );
                return;
            }
          }
          reject(cause);
        });
    });
  }

  const bridgeCredentials: {
    hostname: string | null;
    bridgeToken: string | null;
  } = await getCredentials(skillToken);
  if (bridgeCredentials.hostname === null) {
    throw Common.Error.create("", {
      general: "link",
      specific: "bridge_hostname_not_found",
      receiver: "bridge_link",
      sender: "skill_link",
    });
  }
  if (bridgeCredentials.bridgeToken === null) {
    throw Common.Error.create("", {
      general: "link",
      specific: "bridge_token_not_found",
      receiver: "bridge_link",
      sender: "skill_link",
    });
  }

  const { hostname, bridgeToken } = bridgeCredentials;
  const port = Common.constants.bridge.port.https;
  await testTcp(hostname, port);
  await testTls(hostname, port);
  await testTlsTestCertificate(hostname, port);
  await testTlsTestHostname(hostname, port);
  await testBridgeConnection(hostname, port, bridgeToken);
}
