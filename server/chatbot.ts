import { playAudio } from "./api-clients/discordClient";
import { createAudio, englishVoices } from "./api-clients/googleTTSClient";
import { listenToChannels } from "./api-clients/twitchClient";
import logger from "./logger";

export default class Chatbot {

  private userVoices: Record<string, string> = {
    "alopex_art": "en-GB-Standard-A",
    "ChevCast": "en-US-Wavenet-I",//"en-US-Wavenet-J",
    "Codemanis": "en-AU-Standard-B",
    "Ember_Stone": "en-US-Wavenet-H",
    "harlequindollface": "en-US-Wavenet-F",
    "noobpieces": "en-IN-Wavenet-D"
  };

  private availableVoices: string[] = [];
  private currentUser?: string;
  private voiceContextTimeout?: NodeJS.Timeout;
  private ttsQueue: { username: string, message: string }[] = [];
  private queueInProgress = false;
  private log: debug.Debugger;

  constructor(name: string, private twitchChannels: string[], private discordChannelId: string) {
    this.log = logger.extend(`CHATBOT:${name}`);
  }

  async initialize() {
    this.log("Subscribing to Twitch channels...");
    await listenToChannels(this.twitchChannels, this.queueMessage.bind(this));
    const readyMsg = (twitchChannels: string[]) => {
      const channels = [...twitchChannels];
      if (channels.length === 1) return `Chevbot is now listening to Twitch chat for ${channels.pop()}!`;
      const lastChannel = channels.pop();
      return `Chevbot is now listening to Twitch chat for ${channels.join(", ")}, and ${lastChannel}!`;
    }
    this.log(readyMsg(this.twitchChannels));
    const audioContent = await createAudio(readyMsg(this.twitchChannels.map(this.cleanUsername)));
    await playAudio(this.discordChannelId, audioContent);
  }

  fillAvailableVoices() {
    this.log("Filling available voices...");
    this.availableVoices = [...englishVoices.filter(voice =>
      !Object.values(this.userVoices).includes(voice))];

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
    this.ttsQueue.unshift({ username, message });
    this.processQueue();
  }

  async processQueue() {
    if (this.queueInProgress) return;
    this.queueInProgress = true;
    while (this.ttsQueue.length > 0) {
      const { username, message } = this.ttsQueue.pop()!;
      let voice: string | undefined = this.userVoices[username];
      if (!voice) {
        voice = this.userVoices[username] = this.availableVoices.pop()!;
        if (this.availableVoices.length === 0) {
          this.fillAvailableVoices();
        }
      }
      const ttsMessage = username === this.currentUser || message.startsWith("ALEXA")
        ? message : `${this.enunciateUsername(username)} says ${message}`;
      const audioContent = await createAudio(ttsMessage, voice);
      await playAudio(this.discordChannelId, audioContent);
      this.currentUser = username;
      if (this.voiceContextTimeout) clearTimeout(this.voiceContextTimeout);
      this.voiceContextTimeout = setTimeout(() => this.currentUser = undefined, 45e3);
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