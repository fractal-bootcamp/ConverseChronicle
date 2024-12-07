import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateSummary = async (transcript: string) => {
    const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 1000,
        messages: [{ role: "user", content: `Generate a short summary for the following transcript: ${transcript}` }],
    });
    // return the first text content if it exists, otherwise return empty string
    console.log(`llm summary response: `, response);
    return response.content[0].type === "text" ? response.content[0].text : "";
}

export const generateTitle = async (summary: string) => {
    const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 200,
        messages: [{ role: "user", content: `Generate a succinct title for the following conversation: ${summary}` }],
    }); 
    // return the first text content if it exists, otherwise return empty string
    console.log(`llm title response: `, response);
    return response.content[0].type === "text" ? response.content[0].text : "";
}