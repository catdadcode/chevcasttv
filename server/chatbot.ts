import debug from "debug";
import tts from "@google-cloud/text-to-speech";
import config from "config";
import stream from "stream";
import { Client as TwitchClient } from "tmi.js";
import { Client as DiscordClient, Intents, VoiceChannel } from "discord.js";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnectionStatus
} from "@discordjs/voice";

const { DISCORD_BOT_TOKEN, GOOGLE_API_KEY } = config;
const log = debug("CHEVCASTTV:CHATBOT");
const CHANNELS = "Codemanis,HarlequinDollFace,Ember_Stone,rainbowkittencast,SithLordBoris";
const discordChannelId = "752398756229677171";
const discordGuildId = "752398755533291571";

let englishVoices: string[] | undefined;
const userVoice: Record<string, string> = {};


export default async function () {

  log("Configuring Google TTS client...");
  const ttsClient = new tts.TextToSpeechClient({
    credentials: JSON.parse(GOOGLE_API_KEY)
  });
  const [{ voices }] = await ttsClient.listVoices();
  englishVoices = voices
    ?.filter(voice => voice.languageCodes?.[0].match(/^en-(US|UK|AU)/) && typeof voice.name === "string")
    .map(voice => voice.name!);
  log("TTS ready for synthesis.");

  // *******************************************

  log("Configuring Discord client...")
  const discordClient = new DiscordClient({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
  discordClient.on('ready', () => {
    log ("Discord client now logged in.");
  });
  await discordClient.login(DISCORD_BOT_TOKEN);

  // *******************************************

  log("Connecting Discord bot to voice channel...")
  const channel = (discordClient.channels.cache.get(discordChannelId) ?? await discordClient.channels.fetch(discordChannelId)) as VoiceChannel;
  const connection = await joinVoiceChannel({
    channelId: discordChannelId,
    guildId: discordGuildId,
    adapterCreator: channel.guild.voiceAdapterCreator
  });
  await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
  log("Discord bot is in channel and ready to play audio.");

  // *******************************************

  log("Creating Discord audio player resource...");
  const player = createAudioPlayer({
    behaviors: { noSubscriber: NoSubscriberBehavior.Play }
  });
  player.on("stateChange", ({}, newState) => {
    switch (newState.status) {
      case AudioPlayerStatus.Playing:
        connection.setSpeaking(true);
      default:
        connection.setSpeaking(false);
    }
  });
  log("Discord audio player is ready.");

  // *******************************************

  log("Configuring speak function...");
  const speak = async (message: string, voice?: string) => {
      const [{ audioContent }] = await ttsClient.synthesizeSpeech({
        input: { text: message },
        voice: { name: voice, languageCode: "en-US" },
        audioConfig: { audioEncoding: "LINEAR16" },
      });
      const ttsStream = new stream.Readable({ read: () => {} });
      ttsStream.push(audioContent);
      ttsStream.push(null);
      const resource = createAudioResource(ttsStream);
      player.play(resource);
      await entersState(player, AudioPlayerStatus.Playing, 5e3);
      connection.subscribe(player);
  }

  // *******************************************

  log("Configuring Twitch client...");
  let currentUser: string | undefined;
  let timeoutId: number | undefined;
  const twitchClient = new TwitchClient({
    channels: CHANNELS.split(",")
  });
  twitchClient.on("message", async (channel, tags, message, self) => {
    try {
      const username = tags["display-name"];
      log(`Twitch message: ${channel}:${username}: ${message}`);
      if (typeof username !== "string") return;
      let voice = userVoice[username];
      if (!voice) {
        voice = userVoice[username] = englishVoices![Math.floor(Math.random()*englishVoices!.length)];
      }
      const ttsMessage = username === currentUser ? message : `${username} says ${message}`;
      await speak(ttsMessage, voice);
      currentUser = username;
      if (timeoutId) clearTimeout(timeoutId);
      setTimeout(() => currentUser = undefined, 45e3);
    } catch (err: any) {
      console.log(err.message ?? err);
    }
  });
  await twitchClient.connect();
  log("Twitch client now ready to monitor chat messages.");

  // *******************************************

  const readyMsg = `Chevbot is now listening to Twitch chat for ${CHANNELS.split(",").map(cleanUsername).join(", ")}!`;
  console.log(readyMsg);
  await speak(readyMsg);
};

function cleanUsername(username: string) {
  return username.replace(/(\d+|[_-])/g, " ");
}
