const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateBlogContent(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from the .env file.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt
  });

  return response.text;
}

async function summarizeContent(content) {
  const prompt = `
Summarize the following blog content in a clear and concise way.
Keep the important technical or factual information.

Blog content:
${content}
`;

  return generateBlogContent(prompt);
}
async function generateEmbedding(text) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from the .env file.');
  }

  const response = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text,
    config: {
      outputDimensionality: 768
    }
  });

  return response.embeddings[0].values;
}

module.exports = {
  generateBlogContent,
  summarizeContent,
  generateEmbedding
};