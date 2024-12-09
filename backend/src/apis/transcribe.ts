import { createClient, SyncPrerecordedResponse } from "@deepgram/sdk";
import { BatchClient } from '@speechmatics/batch-client';
import dotenv from "dotenv";
import { generateSummary, generateTitle } from "./llm";
import { TranscribeResponse, Utterance } from "../types";

dotenv.config();
// using deepgram
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
const deepgram = createClient(deepgramApiKey);

// using speechmatics
const speechmaticsApiKey = process.env.SPEECHMATICS_API_KEY;
if (!speechmaticsApiKey) throw new Error("SPEECHMATICS_API_KEY is not set");
const speechmaticsClient = new BatchClient({apiKey: speechmaticsApiKey, appId: "converse-chronicle"});

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

export const transcribeSpeechmatics = async (file: Buffer) => {
  const blob = new Blob([file], { type: 'audio/m4a' });
  const input = {
    data: blob,
    fileName: `audio-${Date.now()}.m4a`
  };
  
  const response = await speechmaticsClient.transcribe(
    input,
    {
      "transcription_config": {
        "diarization": "speaker",
        "speaker_diarization_config": {
          //"max_speakers": 3
        },
        "enable_entities": true,
        "language": "en",
        "operating_point": "enhanced",
        "audio_filtering_config": {
          "volume_threshold": 1
        },
      },
      "summarization_config": {
        "content_type": "conversational",
        "summary_length": "detailed",
        "summary_type": "bullets"
      },
      "topic_detection_config": {},
    }
  );
  return processSpeechmaticsResult(response);
};

const processSpeechmaticsResult = async (result: any) => {
  const transcript = result.results;
  console.log(`transcript: `, transcript);
  
  // Build conversation array
  const conversation = [];
  let currentSpeaker = '';
  let currentMessage = '';
  
  for (const item of transcript) {
    if (item.alternatives && item.alternatives[0]) {
      const { content, speaker } = item.alternatives[0];
      
      // Start new message when speaker changes
      if (speaker !== currentSpeaker && currentMessage) {
        conversation.push({
          speaker: currentSpeaker,
          message: currentMessage.trim()
        });
        currentMessage = '';
      }
      
      currentSpeaker = speaker;
      
      // Handle punctuation
      if (item.type === 'punctuation') {
        currentMessage += content;
      } else {
        currentMessage += (currentMessage ? ' ' : '') + content;
      }
    }
  }
  
  // Add final message
  if (currentMessage) {
    conversation.push({
      speaker: currentSpeaker,
      message: currentMessage.trim()
    });
  }

  const summary = result.summary.content;
  // use LLM to generate title
  const title = await generateTitle(summary ? summary : transcript);
  console.log(`summary: `, summary);
  
  return {
    conversation,
    summary,
    title
  };
}

export const transcribeFile = async (audioBuffer: Buffer) => {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: "nova-2",
        smart_format: true,
        diarize: true,  // identify speaker
        utterances: true,
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
  const {summary, topics, intents, utterances} = result.results
  // deepgram provides a summary, or use LLM to generate summary if not provided
  const shortSummary = summary?.short || await generateSummary(transcript);

  const allTopics = topics?.segments.flatMap(segment => 
    segment.topics?.map(topicObj => topicObj.topic) || []
  ) ?? [];
  const allIntents = intents?.segments.flatMap((segment) => 
    segment.intents?.map((intentObj)=> intentObj.intent) || []
  )?? [];
  const allUtterances: Utterance[] = utterances?.map(utterance => ({
    speaker: utterance.speaker?.toString() || "",
    transcript: utterance.transcript,
    start: utterance.start,
    end: utterance.end
  } as Utterance)) || [];
  //console.log(`transcript`, transcript);
  // use LLM to generate title
  const title = await generateTitle(shortSummary ? shortSummary : transcript);

  return {
      transcript,
      title,
      shortSummary,
      allTopics,
      allIntents,
      allUtterances
  };
}