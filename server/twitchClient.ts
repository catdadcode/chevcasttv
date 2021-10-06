import { Client } from "tmi.js";

const twitchClient = new Client({});

export const initialize = async () => {
  await twitchClient.connect();
};

type MessageHandler = (username: string, message: string, self: boolean) => void;
const messageHandlers: Record<string, MessageHandler[]> = {};
export const onMessage = async (channel: string, handler: MessageHandler) => {
  const currentChannels = twitchClient.getChannels();
  if (!currentChannels.includes(channel)) {
    await twitchClient.join(channel);
  }
  let handlers = messageHandlers[channel];
  if (!handlers) {
    handlers = messageHandlers[channel] = [handler];
  } else {
    handlers.push(handler);
  }
  const unsubscribe = async () => {
    handlers.splice(handlers.indexOf(handler), 1);
    if (handlers.length === 0) {
      delete messageHandlers[channel];
      await twitchClient.part(channel);
    }
  };
  return unsubscribe;
};

twitchClient.on("message", (channel, tags, message, self) => {
  const handlers = messageHandlers[channel];
  if (!handlers) return;
  handlers.forEach(handler => handler(tags["display-name"]! as string, message, self));
});