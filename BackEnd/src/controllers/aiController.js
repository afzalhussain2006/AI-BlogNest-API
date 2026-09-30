const {
  generateBlogContent,
  summarizeContent
} = require('../services/geminiService');

async function generateBlog(req, res) {
  try {
    const { topic, instructions } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        message: 'Blog topic is required.'
      });
    }

    const prompt = `
You are an AI assistant for BlogNest, a blogging platform.

Generate a high-quality blog post about the following topic:

Topic: ${topic}

Additional instructions:
${instructions || 'Write an informative and engaging blog post suitable for general readers.'}

Return the response with:
1. A suitable title
2. A short excerpt
3. The complete blog content
4. Suggested tags
5. Suggested category

Do not include unnecessary explanations outside the blog content.
`;

    const generatedContent = await generateBlogContent(prompt);

    return res.status(200).json({
      message: 'Blog content generated successfully.',
      topic,
      content: generatedContent
    });
  } catch (error) {
    console.error('AI blog generation error:', error.message);

    return res.status(500).json({
      message: 'Failed to generate blog content.',
      error: error.message
    });
  }
}

async function summarizeBlog(req, res) {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: 'Blog content is required.'
      });
    }

    const summary = await summarizeContent(content);

    return res.status(200).json({
      message: 'Blog summarized successfully.',
      summary
    });
  } catch (error) {
    console.error('AI summarization error:', error.message);

    return res.status(500).json({
      message: 'Failed to summarize blog.',
      error: error.message
    });
  }
}

module.exports = {
  generateBlog,
  summarizeBlog
};