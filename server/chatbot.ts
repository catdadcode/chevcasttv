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
  VoiceConnectionStatus
} from "@discordjs/voice";

const {
  DISCORD_BOT_TOKEN,
  GOOGLE_API_KEY,
} = config;

const log = debug("CHEVCASTTV:CHATBOT");

export default async function (twitchChannels: string[], discordGuildId: string, discordChannelId: string) {

  log("Configuring Google TTS client...");
  const ttsClient = new tts.TextToSpeechClient({
    credentials: JSON.parse(GOOGLE_API_KEY)
  });
  const [{ voices }] = await ttsClient.listVoices();
  const availableVoices: string[] = voices!
    .filter(voice => voice.languageCodes?.[0].match(/^en-/) && typeof voice.name === "string")
    .map(voice => voice.name!);
  shuffle(availableVoices);
  log("TTS ready for synthesis.");

  // *******************************************

  log("Configuring Discord client...")
  const discordClient = new DiscordClient({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
  await new Promise((resolve, reject) => {
    discordClient.once("ready", resolve);
    discordClient.once("error", reject);
    discordClient.login(DISCORD_BOT_TOKEN);
  });
  log ("Discord client now logged in.");

  // *******************************************

  log("Configuring speak function...");
  const speak = async (message: string, voice?: string) => {
    try {
      const channel = (discordClient.channels.cache.get(discordChannelId) ?? await discordClient.channels.fetch(discordChannelId)) as VoiceChannel;
      const connection = await joinVoiceChannel({
        channelId: discordChannelId,
        guildId: discordGuildId,
        adapterCreator: channel.guild.voiceAdapterCreator
      });
      await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
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
      const [{ audioContent }] = await ttsClient.synthesizeSpeech({
        input: { text: message },
        voice: { name: voice, languageCode: "en-US" },
        audioConfig: { audioEncoding: "MP3" },
      });
      const ttsStream = new stream.Readable({ read: () => {} });
      ttsStream.push(audioContent);
      ttsStream.push(null);
      const resource = createAudioResource(ttsStream);
      player.play(resource);
      await entersState(player, AudioPlayerStatus.Playing, 5e3);
      connection.subscribe(player);
      await entersState(player, AudioPlayerStatus.Idle, 60e3);
    } catch (err: any) {
      console.log(err.message ?? err);
    }
  }

  // *******************************************

  log("Configuring TTS queue function...");
  let currentUser: string | undefined;
  let timeoutId: number | undefined;
  const userVoice: Record<string, string> = {
    "ChevCast": "en-US-Wavenet-J",
    "Codemanis": "en-AU-Standard-B",
    "Ember_Stone": "en-US-Wavenet-H",
    "harlequindollface": "en-US-Wavenet-F",
    "noobpieces": "en-IN-Wavenet-D"
  };
  const ttsQueue: { username: string, message: string }[] = [];
  let queueInProgress = false;
  const processQueue = async () => {
    if (queueInProgress) return;
    queueInProgress = true;
    while (ttsQueue.length > 0) {
      const { username, message } = ttsQueue.pop()!;
      let voice = userVoice[username] ?? availableVoices.pop();
      const ttsMessage = username === currentUser || message.startsWith("ALEXA") ? message : `${enunciateUsername(username)} says ${message}`;
      await speak(ttsMessage, voice);
      currentUser = username;
      if (timeoutId) clearTimeout(timeoutId);
      setTimeout(() => currentUser = undefined, 45e3);
    }
    queueInProgress = false;
  };
  log("TTS queue function created.");

  // *******************************************

  log("Configuring Twitch client...");
  const twitchClient = new TwitchClient({
    channels: [...twitchChannels]
  });
  twitchClient.on("message", async (channel, tags, message, self) => {
    try {
      const username = tags["display-name"];
      log(`Twitch message: ${channel}:${username}: ${message}`);
      if (typeof username !== "string") return;
      ttsQueue.unshift({ username, message });
      processQueue();
    } catch (err: any) {
      console.log(err.message ?? err);
    }
  });
  await twitchClient.connect();
  log("Twitch client now ready to monitor chat messages.");

  // *******************************************

  const readyMsg = (channels: any) => `Chevbot is now listening to Twitch chat for ${channels}!`;
  log(readyMsg(twitchChannels.join(", ")));
  await speak(readyMsg(twitchChannels.map(cleanUsername).join(", ")));
  
  // const testVoices = englishVoices!;
  // await speak(`There are ${testVoices.length} voices available.`);
  // await keypress();
  // for (let index=0; index < testVoices.length; index++) {
  //   const voice = testVoices[index];
  //   const msg = `Voice ${index}: Hi this is Codeman`;
  //   console.log(`Voice ${index}: ${voice}`);
  //   await speak(msg, voice);
  //   await keypress();
  // }
};

async function keypress() {
  process.stdin.setRawMode(true);
  return new Promise<void>(resolve => process.stdin.once('data', () => {
    process.stdin.setRawMode(false);
    resolve();
  }));
}

function cleanUsername(username: string) {
  return username.replace(/(\d+|[_-])/g, " ");
}

function enunciateUsername(username: string) {
  username = cleanUsername(username);
  if (username.includes(" ")) username = username.slice(0, username.indexOf(" "));
  return username;
}

function shuffle(array: any[]) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}