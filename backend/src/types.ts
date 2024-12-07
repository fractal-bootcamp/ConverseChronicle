export interface TranscribeResponse {
  transcript: string;
  shortSummary?: string;
  allTopics?: string[];
  allIntents?: string[];
  title: string;
}