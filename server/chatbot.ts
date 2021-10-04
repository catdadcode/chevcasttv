import debug from "debug";
import tts from "@google-cloud/text-to-speech";
import config from "config";
// import Speaker from "speaker";
import wav from "wav";
import stream from "stream";
import { Client as TwitchClient } from "tmi.js";
import { Client as DiscordClient, Intents, VoiceChannel } from "discord.js";
import { joinVoiceChannel, createAudioResource, createAudioPlayer, VoiceConnectionStatus, entersState, AudioPlayerStatus, StreamType } from "@discordjs/voice";
import { createDiscordJSAdapter } from './adapter';

const { DISCORD_BOT_TOKEN, GOOGLE_API_KEY } = config;
const log = debug("CHEVCASTTV:CHATBOT");
const CHANNELS = "Codemanis,HarlequinDollFace,Ember_Stone,rainbowkittencast,SithLordBoris";
const discordChannelId = "830238800239525898";
const discordGuildId = "284542264305385474";

const ttsClient = new tts.TextToSpeechClient({
  credentials: JSON.parse(GOOGLE_API_KEY)
});
let englishVoices: string[] | undefined;
const userVoice: Record<string, string> = {};

const discordClient = new DiscordClient({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

export default async function () {
  
  const [{ voices }] = await ttsClient.listVoices();
  englishVoices = voices
    ?.filter(voice => voice.languageCodes?.[0].match(/^en-(US|UK|AU)/) && typeof voice.name === "string")
    .map(voice => voice.name!);

  let currentUser: string | undefined;
  let timeoutId: number | undefined;

  const twitchClient = new TwitchClient({
    channels: CHANNELS.split(",")
  });

  twitchClient.on("message", async (channel, tags, message, self) => {
    const username = tags["display-name"];
    log(`Channel: ${channel}, User: ${username}, Message: ${message}`);
    if (typeof username !== "string") return;
    let voice = userVoice[username];
    if (!voice) {
      voice = userVoice[username] = englishVoices![Math.floor(Math.random()*englishVoices!.length)];
    }
    log(`${username}: ${message}`);
    const ttsMessage = username === currentUser ? message : `${username} says ${message}`;
    await speak(ttsMessage, voice);
    currentUser = username;
    if (timeoutId) clearTimeout(timeoutId);
    setTimeout(() => currentUser = undefined, 60000);
  });
  discordClient.on('ready', () => {
    console.log(`Logged in as ${discordClient.user?.tag}!`);
  });

  await twitchClient.connect();
  await discordClient.login(DISCORD_BOT_TOKEN);
  await speak(`Chevbot is now listening to Twitch chat for ${CHANNELS.split(",").map(cleanUsername).join(", ")}!`);

};

function cleanUsername(username: string) {
  return username.replace(/(\d+|[_-])/g, " ");
}

async function speak(message: string, voice?: string): Promise<void> {
  try {


    const [response] = await ttsClient.synthesizeSpeech({
      input: { text: message },
      voice: { name: voice, languageCode: "en-US" },
      audioConfig: { audioEncoding: "LINEAR16" },
    });

    const channel = (discordClient.channels.cache.get(discordChannelId) ?? await discordClient.channels.fetch(discordChannelId)) as VoiceChannel;
    // const ttsStream = new stream.Readable();
    // ttsStream._read = () => {};
    // ttsStream.push(response.audioContent);
    // ttsStream.push(null);
    const resource = createAudioResource("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", {
      inputType: StreamType.Arbitrary
    });
    const player = createAudioPlayer();
    player.play(resource);
    await entersState(player, AudioPlayerStatus.Playing, 5e3);
    const connection = await joinVoiceChannel({
      channelId: discordChannelId,
      guildId: discordGuildId,
      adapterCreator: createDiscordJSAdapter(channel)
    });
    await entersState(connection, VoiceConnectionStatus.Ready, 30e3);

  } catch (err: any) {
    console.log(err?.message ?? err);
  }
}