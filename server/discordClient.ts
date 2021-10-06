import { Client, Intents, Snowflake, VoiceChannel } from "discord.js";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus
} from "@discordjs/voice";
import config from "config";
import { Readable } from "stream";

const { DISCORD_BOT_TOKEN } = config;

const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] }); 

export const initialize = async () => {
  discordClient.on("error", console.log);
  await new Promise((resolve, reject) => {
    discordClient.once("ready", resolve);
    discordClient.once("error", reject);
    discordClient.login(DISCORD_BOT_TOKEN);
  });
};

const voiceConnections: Record<Snowflake, VoiceConnection> = {};
export const joinVoice = async (channelId: Snowflake) => {
  const channel = (discordClient.channels.cache.get(channelId) ?? await discordClient.channels.fetch(channelId)) as VoiceChannel;
  const connection = await joinVoiceChannel({
    channelId: channelId,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator
  });
  await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
  voiceConnections[channel.id] = connection;
};

export const playAudio = async (channelId: Snowflake, audioContent: Buffer) => {
  let connection = voiceConnections[channelId];
  if (!connection) {
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
};