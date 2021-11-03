import { Client } from "tmi.js";
import logger from "../logger";

const log = logger.extend("TWITCH_CLIENT");

const twitchClient = new Client({
  connection: {
    reconnect: true
  }
});

export const initialize = async () => {
  log("Initializing Twitch client...");
  await twitchClient.connect();
  log("Twitch client ready.");
};

type MessageHandler = (username: string, message: string, channel: string, emotes?: Record<string, string[]> ) => void;
type Subscription = [channels: string[], handler: MessageHandler];
const subscriptions: Subscription[] = [];
export const listenToChannels = async (channels: string[], handler: MessageHandler) => {

  // Check if client is already in provided channels.
  const currentChannels = twitchClient.getChannels().map(channel => channel.slice(1));
  for (const channel of channels) {
    // If client is not in channel then join.
    if (!currentChannels.includes(channel)) {
      await twitchClient.join(channel);
      log(`Twitch client joined channel: ${channel}`);
    }
  }

  // Track new subscription.
  const subscription: Subscription = [channels, handler];
  subscriptions.push(subscription);

  // Create method to unsubscribe this subscription later.
  const unsubscribe = async () => {
    
    // Remove subscription
    const subIndex = subscriptions.findIndex(s => s === subscription);
    subscriptions.splice(subIndex, 1);

    // Get list of all remaining subscription channels.
    const remainingSubChannels = subscriptions.map(([subChannels]) => subChannels)
      .reduce((remainingChannels, subChannels) => {
        for (const subChannel of subChannels) {
          if (!remainingChannels.includes(subChannel)) {
            remainingChannels.push(subChannel);
          }
        }
        return remainingChannels;
      }, [] as string[]);
    const currentChannels = twitchClient.getChannels().map(channel => channel.slice(1));

    // Leave channels that are not in remaining subscriptions.
    for (const currentChannel of currentChannels) {
      if (!remainingSubChannels.includes(currentChannel)) {
        await twitchClient.part(currentChannel);
        log(`Twitch client left channel: ${currentChannel}`);
      }
    }
  };
  return unsubscribe;
};

twitchClient.on("message", (channel, tags, message) => {
  console.log(tags);
  if (message === "!disc") {
    twitchClient.disconnect();
    return;
  }
  log(`${channel}:${tags["display-name"]}:${message}`);
  channel = channel.slice(1);
  // Find all message handlers that are subscribed to this message's channel.
  const handlers = subscriptions
    .filter(([subChannels]) => subChannels.includes(channel))
    .map(([,subHandler]) => subHandler);
  if (!handlers || handlers.length === 0) return;

  // Invoke each handler that is subscribed to messages in this channel.
  handlers.forEach(handler => handler(tags["display-name"]! as string, message, channel, tags.emotes));
});