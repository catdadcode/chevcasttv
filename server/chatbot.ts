import { playAudio } from "./api-clients/discordClient";
import { createAudio, englishVoices } from "./api-clients/googleTTSClient";
import { onMessage } from "./api-clients/twitchClient";
import logger from "./logger";

const createChatbot = async (name: string, twitchChannels: string[], discordChannelId: string) => {

  const log = logger.extend(`CHATBOT:${name}`);

  // Hard-coded values for pre-reserved voices.
  const userVoice: Record<string, string> = {
    "ChevCast": "en-US-Wavenet-J",
    "Codemanis": "en-AU-Standard-B",
    "Ember_Stone": "en-US-Wavenet-H",
    "harlequindollface": "en-US-Wavenet-F",
    "noobpieces": "en-IN-Wavenet-D"
  };

  log("Filling available voices...");
  let availableVoices: string[] = [];
  const fillAvailableVoices = () => { 
    availableVoices = [...englishVoices.filter(voice => !Object.values(userVoice).includes(voice))]; 
    shuffle(availableVoices);
  }
  fillAvailableVoices();
  log(`${availableVoices.length} voices available.`);

  log("Configuring TTS queue function...");
  let currentUser: string | undefined;
  let timeoutId: NodeJS.Timeout | undefined;
  availableVoices = availableVoices.filter(voice => Object.values(userVoice).includes(voice));
  const ttsQueue: { username: string, message: string }[] = [];
  let queueInProgress = false;
  const processQueue = async () => {
    if (queueInProgress) return;
    queueInProgress = true;
    while (ttsQueue.length > 0) {
      const { username, message } = ttsQueue.pop()!;
      let voice: string | undefined = userVoice[username];
      if (!voice) {
        voice = userVoice[username] = availableVoices.pop()!;
        if (availableVoices.length === 0) {
          fillAvailableVoices();
        }
      }
      const ttsMessage = username === currentUser || message.startsWith("ALEXA") ? message : `${enunciateUsername(username)} says ${message}`;
      const audioContent = await createAudio(ttsMessage, voice);
      await playAudio(discordChannelId, audioContent);
      currentUser = username;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => currentUser = undefined, 45e3);
    }
    queueInProgress = false;
  };
  log("TTS queue function created.");

  log("Subscribing to Twitch channels...");
  await Promise.all(twitchChannels.map(channel => 
    onMessage(channel, (username, message, self) => {
      ttsQueue.unshift({ username, message });
      processQueue();
    })
  ));

  log("Joining Discord voice channel...");
  const readyMsg = (channels: any) => `Chevbot is now listening to Twitch chat for ${channels}!`;
  log(readyMsg(twitchChannels.join(", ")));
  const audioContent = await createAudio(readyMsg(twitchChannels.map(cleanUsername).join(", ")));
  await playAudio(discordChannelId, audioContent);
  
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

// async function keypress() {
//   process.stdin.setRawMode(true);
//   return new Promise<void>(resolve => process.stdin.once('data', () => {
//     process.stdin.setRawMode(false);
//     resolve();
//   }));
// }

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
};

export default createChatbot;