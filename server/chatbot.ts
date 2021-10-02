import tts from "@google-cloud/text-to-speech";
import config from "config";
import wav from "wav";
import dgram from "dgram";

const { GOOGLE_API_KEY } = config;

export default async function () {
  
  const client = new tts.TextToSpeechClient({
    credentials: JSON.parse(GOOGLE_API_KEY)
  });

  const [response] = await client.synthesizeSpeech({
    input: {text: "Hello, world!"},
    voice: {languageCode: "en-US", ssmlGender: "NEUTRAL"},
    audioConfig: {audioEncoding: "LINEAR16"},
  });

  const reader = new wav.Reader();

  reader.on("format", format => {

  });


  //response.audioContent


};