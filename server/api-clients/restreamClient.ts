import config from "config";
import logger from "../logger";
import axios from "axios";
import moment from "moment";
import { User } from "db";
import { URLSearchParams } from "url";
import {
  client as WebSocketClient,
  connection as WebSocketConnection,
  Message as WebSocketMessage
} from "websocket";

const log = logger.extend("RESTREAM_CLIENT");

const {
  RESTREAM_OAUTH_URL,
  RESTREAM_CHAT_WEBSOCKET,
  RESTREAM_CLIENT_ID,
  RESTREAM_CLIENT_SECRET,
  CHEV_ID
} = config;

type ListenHandler = (username: string, text: string) => void;

let user: InstanceType<typeof User> | null = null;
let connection: WebSocketConnection;
let heartbeatTimerId: NodeJS.Timeout;
const listenHandlers: ListenHandler[] = [];

const validateToken = async () => {
  log("Validating restream access token...");
  if (!user) {
    user = await User.findById(CHEV_ID);
  }
  if (!user) throw new Error(`Unable to find account with ID: ${CHEV_ID}`);
  if (!user.restream) throw new Error(`User ${CHEV_ID} has no restream credentials.`);
  const { refreshToken, accessTokenExpiration } = user.restream;
  const now = moment();
  const expiration = moment(accessTokenExpiration);
  if (now.isBefore(expiration.subtract(30, "seconds"))) {
    log("Token is valid and not expired. No need to validate.");
    return;
  }
  log("Token has expired. Refreshing access token...");
  const credentials = Buffer.from(`${RESTREAM_CLIENT_ID}:${RESTREAM_CLIENT_SECRET}`).toString("base64");
  const { data } = await axios.post(
    `${RESTREAM_OAUTH_URL}/token`,
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
  Object.assign(user, {
    restream: {
      accessToken: data.accessToken,
      accessTokenExpiration: data.accessTokenExpiresAt,
      refreshToken: data.refreshToken
    }
  });
  log("Token refreshed. Updating database...");
  await user.save();
  log("Database updated with new token.");
};

export const initialize = async () => {
  const connect = async () => {
    await validateToken();
    const wsClient = new WebSocketClient();
    log("Connecting to restream chat websocket...");
    wsClient.connect(`${RESTREAM_CHAT_WEBSOCKET}?accessToken=${user?.restream?.accessToken}`);
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
    heartbeatMonitor();
  };

  const heartbeatMonitor = () => {
    if (heartbeatTimerId) {
      clearTimeout(heartbeatTimerId);
    } else {
      log(`Heartbeat monitor started.`);
    }
    heartbeatTimerId = setTimeout(async () => {
      try {
        log(`Restream heartbeat not received for more than 60 seconds.`);
        await connect();
      } catch (err: any) {
        console.log(err.message || err.toString());
      }
    }, 60000);
  };

  await connect();

  connection.on("error", async (err) => {
    log(`Restream websocket connection error: ${err.message || err.toString()}`);
    try {
      await connect();
    } catch(err: any) {
      log(err.message || err.toString());
    }
  });

  connection.on("close", async () => {
    log(`Restream websocket connection closed.`);
    try {
      await connect();
    } catch (err: any) {
      console.log(err.message || err.toString());
    }
  })

  connection.on("message", async (message: WebSocketMessage) => {
    try {
      if ("binaryData" in message) return;
      if (listenHandlers.length === 0) return;
      const { action, payload } = JSON.parse(message.utf8Data);
      switch(action) {
        case "event":
          const { eventPayload: { author, text } } = payload;
          const username = author.displayName ?? author.nickname ?? author.name;
          log(`${username}: "${text}"`);
          for (const handler of listenHandlers) {
            handler(username, text);
          }
          break;
        case "heartbeat":
          log(`Restream heartbeat received.`);
          heartbeatMonitor();
          break;
        case "connection_closed":
          log(`Restream connection closed event received.`);
          await connect();
          break;
        default:
          log(`Restream event: ${action} - ${JSON.stringify(payload, null, 2)}`);
          break;
      }
    } catch (err: any) {
      console.log(err.message || err.toString());
    }
  });
};

export const listen = async (handler: ListenHandler) => {
  listenHandlers.push(handler);
  return () => {
    const index = listenHandlers.findIndex(h => h === handler);
    listenHandlers.splice(index, 1);
  };
};