const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv/config');

async function testModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const modelsToTest = [
    'models/gemini-1.5-flash-latest',
    'models/gemini-1.5-flash',
    'models/gemini-1.5-pro-latest',
    'models/gemini-1.5-pro',
    'models/gemini-pro',
    'gemini-1.5-flash-latest',
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`\nTesting: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello');
      const text = result.response.text();
      console.log(`✅ SUCCESS: ${modelName}`);
      console.log(`Response: ${text.substring(0, 50)}...`);
      return; // Exit after first success
    } catch (error) {
      console.log(`❌ Failed: ${error.message.substring(0, 100)}`);
    }
  }

  console.log('\n❌ All models failed!');
}

testModels();
