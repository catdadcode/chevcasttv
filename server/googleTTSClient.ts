import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import config from "config";

const { GOOGLE_API_KEY } = config;

const googleTTSClient = new TextToSpeechClient({ credentials: JSON.parse(GOOGLE_API_KEY) });

export const englishVoices: string[] = [];

export const initialize = async () => {
  const [{voices}] = await googleTTSClient.listVoices();
  if (!voices || voices.length === 0) throw new Error("Problem retrieving available Google TTS voices.");
  englishVoices.concat(
    voices
      .filter(voice => voice.languageCodes?.[0].match(/^en-/) && typeof voice.name === "string")
      .map(voice => voice.name!)
  );
  englishVoices.sort();
};

export const createAudio = async (text: string, voice?: string) => {
  const [{ audioContent }] = await googleTTSClient.synthesizeSpeech({
    input: { text },
    voice: { name: voice, languageCode: "en-US" },
    audioConfig: { audioEncoding: "MP3" }
  });
  return audioContent as Buffer;
};