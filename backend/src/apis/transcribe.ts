import { createClient, SyncPrerecordedResponse } from "@deepgram/sdk";
import dotenv from "dotenv";
import { generateSummary, generateTitle } from "./llm";
import { TranscribeResponse } from "../types";

dotenv.config();
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
const deepgram = createClient(deepgramApiKey);

export const transcribeUrl = async (url: string) => {
  const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
    { url: url },
    { 
      smart_format: true, 
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
        diarize: true,  // identify speaker
        summarize: "v2",
        topics: true,
        language: 'en-US',
        intents: true,
      }
  );
  if (error) throw error;
  return await processResult(result);
}

const processResult = async (result: SyncPrerecordedResponse): Promise<TranscribeResponse> => {
  const transcript = result.results.channels[0].alternatives[0].paragraphs?.transcript || result.results.channels[0].alternatives[0].transcript;
  if (!transcript) throw new Error("No transcript found");
  const {summary, topics, intents} = result.results
  // deepgram provides a summary, or use LLM to generate summary if not provided
  const shortSummary = summary?.short || await generateSummary(transcript);

  const allTopics = topics?.segments.flatMap(segment => 
    segment.topics?.map(topicObj => topicObj.topic) || []
  ) ?? [];
  const allIntents = intents?.segments.flatMap((segment) => 
    segment.intents?.map((intentObj)=> intentObj.intent) || []
  )?? [];
  //console.log(`transcript`, transcript);
  // use LLM to generate title
  const title = await generateTitle(shortSummary ? shortSummary : transcript);

  return {
      transcript,
      title,
      shortSummary,
      allTopics,
      allIntents
  };
}