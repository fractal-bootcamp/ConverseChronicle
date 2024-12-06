import { createClient, SyncPrerecordedResponse } from "@deepgram/sdk";
import dotenv from "dotenv";

dotenv.config();
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
const deepgram = createClient(deepgramApiKey);

export const transcribeUrl = async (url: string) => {
  const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
    { url: url },
    { smart_format: true, 
      diarize: true,  // identify speaker
      punctuate:true,
      paragraphs: true,
      intents: true,
      summarize: "v2",
      topics: true,
      model: 'nova-2', 
      language: 'en-US' 
  },
  );

  if (error) throw error;
  return processResult(result);
};

export const transcribeFile = async (audioBuffer: Buffer) => {
  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
      model: "nova-2",
      smart_format: true,
      }
  );
  if (error) throw error;
  return processResult(result);
}

export interface TranscribeResponse {
  transcript: string;
  shortSummary?: string;
  topics?: string[];
  intents?: string[]
}

const processResult = (result: SyncPrerecordedResponse) => {
  const transcript = result.results.channels[0].alternatives[0].paragraphs?.transcript || result.results.channels[0].alternatives[0].transcript;
  const {summary, topics, intents} = result.results
  const shortSummary = summary?.short || "";
  const allTopics = topics?.segments.flatMap(segment => 
    segment.topics?.map(topicObj => topicObj.topic) || []
  ) ?? [];
  const allIntents = intents?.segments.flatMap((segment) => 
    segment.intents?.map((intentObj)=> intentObj.intent) || []
  )?? [];
  console.log(`transcript`, transcript);
  return {
      transcript,
      shortSummary,
      allTopics,
      allIntents
  };
}