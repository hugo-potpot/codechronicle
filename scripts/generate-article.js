require('dotenv').config({path: '../.env'});
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate article content using OpenAI
 * @param {string} prompt - The prompt for content generation
 * @returns {Promise<string>} - The generated content
 */
async function generateContent(prompt) {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: `Create a well-structured article about "${prompt}" with YAML frontmatter. Include:
        - title: A catchy title
        - summary: A brief summary (1-2 sentences)
        - tags: 3-5 relevant tags`
      },
      {
        role: "user",
        content: `Write an article about "${prompt}".`
      }
    ],
    temperature: 0.7,
    max_tokens: 1500
  });

  return response.choices[0].message.content.trim();
}

/**
 * Save content to file
 * @param {string} filePath - Path to save the file
 * @param {string} content - Content to write
 */
function saveToFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Saved to ${filePath}`);
}

/**
 * Process a markdown file
 * @param {string} filePath - Path to the markdown file
 */
async function processFile(filePath) {
  try {
    // Extract prompt from filename
    const filename = path.basename(filePath, '.md');
    const prompt = filename.replace(/-/g, ' ');

    console.log(`Processing ${filePath} with prompt: "${prompt}"`);

    // Generate content
    const content = await generateContent(prompt);

    // Save to file
    saveToFile(filePath, content);

    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Define the blog directory
    const blogDir = path.join(__dirname, '../blog');

    // Read all files in the blog directory
    const files = fs.readdirSync(blogDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(blogDir, file));

    if (files.length === 0) {
      console.error('No markdown files found in the blog directory.');
      process.exit(1);
    }

    console.log(`Starting to process ${files.length} file(s)`);

    // Process each file
    let success = true;
    for (const file of files) {
      const result = await processFile(file);
      if (!result) success = false;
    }

    console.log('Processing complete');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the main function
main().then(r => console.log('Done')).catch(e => console.error(e));