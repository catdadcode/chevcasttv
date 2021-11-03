import { playAudio } from "./api-clients/discordClient";
import { createAudio, englishVoices } from "./api-clients/googleTTSClient";
import { listenToChannels as twitchListen } from "./api-clients/twitchClient";
import logger from "./logger";
import config from "config";
import packageJson from "../package.json";

const {
  CONTEXT_TIMEOUT
} = config;

type Options = {
  twitchChannels: string[];
  discordChannelIds: string[];
};

export default class Chatbot {

  private userVoices: Record<string, string> = {
    "chevcast": "en-US-Wavenet-I",
    "chev": "en-US-Wavenet-I",
    "alex ford": "en-US-Wavenet-I",
    "alopex_art": "en-GB-Standard-A",
    "codemanis": "en-AU-Standard-B",
    "ember_stone": "en-US-Wavenet-H",
    "harlequindollface": "en-US-Wavenet-F",
    "noobpieces": "en-IN-Wavenet-D"
  };

  private availableVoices: string[] = [];
  private currentUser?: string;
  private discordChannelIds: string[];
  private log: debug.Debugger;
  private ttsQueue: { username: string, message: string }[] = [];
  private twitchChannels: string[];
  private voiceContextTimeout?: NodeJS.Timeout;
  private queueInProgress = false;

  constructor(options: Options) {
    const { twitchChannels, discordChannelIds } = options;
    this.discordChannelIds = discordChannelIds;
    this.twitchChannels = twitchChannels;
    this.log = logger.extend("CHATBOT");
  }

  async initialize() {
    this.log("Subscribing to Twitch channels...");
    await twitchListen(this.twitchChannels, this.queueMessage.bind(this));
    const readyMsg = (twitchChannels: string[]) => {
      const channels = [...twitchChannels];
      const version = packageJson.version.split(".").slice(0, 2).join(" point ");
      if (channels.length === 1) return `Chevbot version ${version} is now listening to Twitch chat for ${channels.pop()}!`;
      const lastChannel = channels.pop();
      return `Chevbot version ${version} is now listening to Twitch chat for ${channels.join(", ")}, and ${lastChannel}!`;
    }
    this.log(readyMsg(this.twitchChannels));
    const audioContent = await createAudio(readyMsg(this.twitchChannels.map(this.cleanUsername)));
    await this.sendTTS(audioContent);
  }

  async sendTTS(audioContent: Buffer) {
    return Promise.all(this.discordChannelIds.map(channelId => playAudio(channelId, audioContent)));
  }

  fillAvailableVoices() {
    this.log("Filling available voices...");
    this.availableVoices = [...englishVoices.filter(voice =>
      !Object.values(this.userVoices).includes(voice.toLowerCase()))];

    // Shuffle voices to ensure variety.
    let currentIndex = this.availableVoices.length;
    let randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [
        this.availableVoices[currentIndex],
        this.availableVoices[randomIndex]
      ] = [
        this.availableVoices[randomIndex],
        this.availableVoices[currentIndex]
      ];
    }
    this.log(`${this.availableVoices.length} voices available.`);
  }

  queueMessage(username: string, message: string) {
    const blackList = ["streamelements", "soundalerts"];
    if (blackList.includes(username.toLowerCase())) return;
    if (message.startsWith("!")) return;
    const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    message = message.replace(urlRegex, "");
    this.ttsQueue.unshift({ username, message });
    this.processQueue();
  }

  async processQueue() {
    if (this.queueInProgress) return;
    this.queueInProgress = true;
    while (this.ttsQueue.length > 0) {
      const { username, message } = this.ttsQueue.pop()!;
      let voice: string | undefined = this.userVoices[username.toLowerCase()];
      if (!voice) {
        voice = this.userVoices[username.toLowerCase()] = this.availableVoices.pop()!;
        if (this.availableVoices.length === 0) {
          this.fillAvailableVoices();
        }
      }
      const ttsMessage = username === this.currentUser || message.startsWith("ALEXA")
        ? message : `${this.enunciateUsername(username)} says ${message}`;
      const audioContent = await createAudio(ttsMessage, voice);
      await this.sendTTS(audioContent);
      this.currentUser = username;
      if (this.voiceContextTimeout) clearTimeout(this.voiceContextTimeout);
      this.voiceContextTimeout = setTimeout(() => this.currentUser = undefined, parseInt(CONTEXT_TIMEOUT) * 1000);
    }
    this.queueInProgress = false;
  }

  cleanUsername(username: string) {
    return username.replace(/(\d+|[_-])/g, " ");
  }

  enunciateUsername(username: string) {
    username = this.cleanUsername(username);
    // if (username.includes(" ")) username = username.slice(0, username.indexOf(" "));
    return username;
  }

}