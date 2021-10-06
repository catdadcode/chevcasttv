import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import config from "config";
import logger from "../logger";

const log = logger.extend("GOOGLE_TTS_CLIENT");

const { GOOGLE_API_KEY } = config;

const googleTTSClient = new TextToSpeechClient({ credentials: JSON.parse(GOOGLE_API_KEY) });

export const englishVoices: string[] = [];

export const initialize = async () => {
  log("Initializing Google text to speech client...");
  const [{voices}] = await googleTTSClient.listVoices();
  if (!voices || voices.length === 0) throw new Error("Problem retrieving available Google TTS voices.");
  englishVoices.concat(
    voices
      .filter(voice => voice.languageCodes?.[0].match(/^en-/) && typeof voice.name === "string")
      .map(voice => voice.name!)
  );
  englishVoices.sort();
  log("Google text to speech client ready.");
};

export const createAudio = async (text: string, voice?: string) => {
  log(`Creating audio with for "${text}"...`);
  const [{ audioContent }] = await googleTTSClient.synthesizeSpeech({
    input: { text },
    voice: { name: voice, languageCode: "en-US" },
    audioConfig: { audioEncoding: "MP3" }
  });
  log(`Audio content generated using voice ${voice}.`);
  return audioContent as Buffer;
};