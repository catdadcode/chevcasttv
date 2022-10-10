import { Client, Intents, Snowflake, VoiceChannel } from "discord.js";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  entersState,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus
} from "@discordjs/voice";
import config from "config";
import { Readable } from "stream";
import logger from "../logger";

const log = logger.extend("DISCORD_CLIENT");

const { DISCORD_BOT_TOKEN } = config;

const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES] }); 

export const initialize = async () => {
  log("Initializing Discord client...");
  discordClient.on("error", console.log);
  await new Promise((resolve, reject) => {
    discordClient.once("ready", resolve);
    discordClient.once("error", reject);
    discordClient.login(DISCORD_BOT_TOKEN);
  });
  log("Discord client ready.");
};

const voiceConnections: Record<Snowflake, VoiceConnection> = {};
const joinVoice = async (channelId: Snowflake) => {
  log(`Discord client joining voice channel ${channelId}...`);
  const channel = (discordClient.channels.cache.get(channelId) ?? await discordClient.channels.fetch(channelId)) as VoiceChannel;
  const connection = await joinVoiceChannel({
    channelId: channelId,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
  });
  await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
  voiceConnections[channel.id] = connection;
  log(`Voice channel ${channelId} joined successfully.`);
};

export const playAudio = async (channelId: Snowflake, audioContent: Buffer) => {
  log(`Playing audio to voice channel ${channelId}...`);
  let connection = voiceConnections[channelId];
  if (!connection || [VoiceConnectionStatus.Destroyed, VoiceConnectionStatus.Disconnected].includes(connection.state.status)) {
    await joinVoice(channelId);
    connection = voiceConnections[channelId];
  }
  const audioStream = new Readable({ read: () => {} });
  audioStream.push(audioContent);
  audioStream.push(null);
  const resource = createAudioResource(audioStream);
  const player = createAudioPlayer();
  player.play(resource);
  await entersState(player, AudioPlayerStatus.Playing, 10e3);
  connection.setSpeaking(true);
  connection.subscribe(player);
  await entersState(player, AudioPlayerStatus.Idle, 60e3);
  connection.setSpeaking(false);
  log(`Audio finished playing in channel ${channelId}.`);
};