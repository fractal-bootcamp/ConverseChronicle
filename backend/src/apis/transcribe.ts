import { createClient } from "@deepgram/sdk";

export const transcribeUrl = async (url: string) => {
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    const deepgram = createClient(deepgramApiKey);

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
