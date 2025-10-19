const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv/config');

async function testGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not found in environment');
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  console.log('Testing Gemini API...\n');
  console.log('API Key length:', process.env.GEMINI_API_KEY.length);

  // Try to list available models
  try {
    console.log('\n=== Attempting to list models ===');
    const models = await genAI.listModels();
    console.log('Available models:');
    models.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`);
    });
  } catch (error) {
    console.error('Error listing models:', error.message);
  }

  // Test different model names
  const modelNamesToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'models/gemini-1.5-flash',
    'models/gemini-pro',
  ];

  for (const modelName of modelNamesToTest) {
    try {
      console.log(`\n=== Testing model: ${modelName} ===`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello');
      const response = await result.response;
      const text = response.text();
      console.log(`✅ SUCCESS with ${modelName}`);
      console.log(`Response: ${text.substring(0, 100)}...`);
      break; // If successful, we found a working model
    } catch (error) {
      console.log(`❌ FAILED with ${modelName}: ${error.message}`);
    }
  }
}

testGemini();
