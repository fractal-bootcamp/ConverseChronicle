import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateSummary = async (transcript: string) => {
    const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 1000,
        messages: [{ role: "user", content: transcript }],
    });
}

export const generateTitle = async (summary: string) => {
    const response = await anthropic.messages.create({
        model: "claude-3-5-haiku-latest",
        max_tokens: 200,
        messages: [{ role: "user", content: `Generate a title for the following summary: ${summary}` }],
    }); 
    // return the first text content if it exists, otherwise return empty string
    return response.content[0].type === "text" ? response.content[0].text : "";
}