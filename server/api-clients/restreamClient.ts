import config from "config";
import logger from "../logger";
import axios from "axios";
import moment from "moment";
import db from "db";
import { URLSearchParams } from "url";
import {
  client as WebSocketClient,
  connection as WebSocketConnection,
  Message as WebSocketMessage
} from "websocket";
import { ObjectId } from "mongodb";
import type { Account } from "db/repositories/accounts";

const log = logger.extend("RESTREAM_CLIENT");

const {
  RESTREAM_API_URL,
  RESTREAM_API_VERSION,
  RESTREAM_CHAT_WEBSOCKET,
  RESTREAM_CLIENT_ID,
  RESTREAM_CLIENT_SECRET,

  CHEV_ID
} = config;

type ListenHandler = (username: string, text: string) => void;

const chevId = new ObjectId(CHEV_ID);
let account: Account | null = null;
let connection: WebSocketConnection;
const listenHandlers: ListenHandler[] = [];

const validateToken = async () => {
  log("Validating restream access token...");
  if (!account) {
    account = await db.accounts.getAccountByUserId(chevId);
  }
  if (!account) throw new Error(`Unable to find account with ID: ${CHEV_ID}`);
  const { refreshToken, expiresAt } = account.restream;
  const now = moment();
  const expiration = moment(expiresAt);
  if (now.isBefore(expiration.subtract(30, "seconds"))) {
    log("Token is valid and not expired. No need to validate.");
    return;
  }
  log("Token has expired. Refreshing access token...");
  const credentials = Buffer.from(`${RESTREAM_CLIENT_ID}:${RESTREAM_CLIENT_SECRET}`).toString("base64");
  const { data } = await axios.post(
    `${RESTREAM_API_URL}/oauth/token`,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken
    }).toString(),
    {
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
  Object.assign(account, {
    restream: {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.accessTokenExpiresAt
    }
  });
  log("Token refreshed. Updating database...");
  await db.accounts.updateAccount(account);
  log("Database updated with new token.");
};

export const initialize = async () => {
  await validateToken();
  const wsClient = new WebSocketClient();
  log("Connecting to restream chat websocket...");
  wsClient.connect(`${RESTREAM_CHAT_WEBSOCKET}?accessToken=${account?.restream.accessToken}`);
  connection = await new Promise((resolve, reject) => {
    wsClient.once("connect", connection => {
      log("Websocket connected.");
      resolve(connection);
    });
    wsClient.once("connectFailed", err => {
      log(`Websocket connection failed: ${err}.`);
      reject(err);
    });
  });

  connection.on("message", (message: WebSocketMessage) => {
    if ("binaryData" in message) return;
    if (listenHandlers.length === 0) return;
    const { action, payload: { eventPayload } } = JSON.parse(message.utf8Data);
    if (action === "event") {
      const { author, text } = eventPayload;
      const username = author.displayName ?? author.nickname ?? author.name;
      log(`${author}: "${message}"`);
      for (const handler of listenHandlers) {
        handler(username, text);
      }
    }
  });
};

export const listen = (handler: ListenHandler) => {
  listenHandlers.push(handler);
  return () => {
    const index = listenHandlers.findIndex(h => h === handler);
    listenHandlers.splice(index, 1);
  };
};