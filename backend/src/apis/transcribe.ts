import { createClient } from "@deepgram/sdk";
import dotenv from "dotenv";

export const transcribeUrl = async (url: string) => {
    dotenv.config();
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    const deepgram = createClient(deepgramApiKey);
    // const myurl ="https://duepoyzorxhnardfmlsr.supabase.co/storage/v1/object/sign/recordings/New%20Recording%2033.m4a?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJyZWNvcmRpbmdzL05ldyBSZWNvcmRpbmcgMzMubTRhIiwiaWF0IjoxNzMzMjYxMzE5LCJleHAiOjE3NjQ3OTczMTl9.igWx3jHcBLxUb38K9DYLcrjJ0PwTuCVicrgfgKY_8oY&t=2024-12-03T21%3A28%3A39.422Z"
    // deepgram placeholder
    // const url = "https://static.deepgram.com/examples/Bueller-Life-moves-pretty-fast.wav";
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
    // in case we are transcribing from buffer
    //  const response = await deepgram.transcription.preRecorded(
    //     { buffer: audioBuffer, mimetype: 'audio/wav' },
    //     { punctuate: true, model: 'nova' }
    //   );
    if (error) throw error;
    const transcript = result.results.channels[0].alternatives[0].paragraphs?.transcript;
    const {summary, topics, intents} = result.results
    const shortSummary = summary?.short;
    const allTopics = topics?.segments.map((segment) => {
        const topics = segment?.topics?.map((topicObj)=> topicObj.topic);
        return topics
    });
    const allIntents = intents?.segments.map((segment) => {
        const intents = segment?.intents?.map((intentObj)=> intentObj.intent);
        return intents;
    });
    return {
        transcript,
        shortSummary,
        allTopics,
        allIntents
    };
  };
