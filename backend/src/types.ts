export interface TranscribeResponse {
  transcript: string;
  shortSummary?: string;
  allTopics?: string[];
  allIntents?: string[];
  title: string;
  allUtterances: Utterance[];
}

export interface Utterance {
  speaker: string;
  transcript: string;
  start: number;
  end: number;
}