const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Service for generating loan insights using Google Gemini API.
 */
const AI_TIMEOUT_MS = 30000;

const withTimeout = (promise, timeoutMs) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`AI request timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);

const generateLoanInsights = async (userData) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY is not set. Returning fallback AI response.');
      return getFallbackResponse('Missing GEMINI_API_KEY');
    }

    // Initialize inside the function to guarantee process.env is populated
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: {
        responseMimeType: 'application/json', // Force JSON output
      },
    });

    const prompt = `You are a financial risk analyst AI.

Analyze the following user data:

Income: ${userData.income}
Credit Score: ${userData.creditScore}
Existing EMI: ${userData.existingEMI}
Loan Amount: ${userData.loanAmount}
Tenure: ${userData.tenure}
Employment: ${userData.employment}

Tasks:
1. Explain loan eligibility in simple terms
2. Provide detailed risk analysis
3. Suggest improvements to increase approval chances
4. Generate a short summary

IMPORTANT:
Return ONLY valid JSON in this format:
{
  "summary": "",
  "explanation": "",
  "riskAnalysis": "",
  "suggestions": []
}`;

    let result;
    try {
      result = await withTimeout(model.generateContent(prompt), AI_TIMEOUT_MS);
    } catch (apiError) {
      if (apiError.message.includes('503') || apiError.message.includes('500')) {
        console.log('⚠️ Gemini API 503 error, retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        result = await withTimeout(model.generateContent(prompt), AI_TIMEOUT_MS);
      } else {
        throw apiError;
      }
    }

    const response = result.response;
    let text = response.text();
    
    // Strip markdown code blocks if present
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    // Parse the JSON string
    return JSON.parse(text);

  } catch (error) {
    console.error('❌ AI Generation Error:', error.message);
    console.error('Stack:', error.stack);
    // Return fallback response gracefully
    return getFallbackResponse(error.message);
  }
};

/**
 * Fallback response if API fails or key is missing.
 */
const getFallbackResponse = (errMessage) => {
  return {
    summary: `AI insights are currently unavailable due to an API error. ${errMessage ? '(' + errMessage + ')' : ''}`,
    explanation: "Our AI engine couldn't process your request at this moment. Please rely on the standard eligibility metrics provided.",
    riskAnalysis: "Standard risk assessment applies based on your credit score and income-to-debt ratio.",
    suggestions: ["Please ensure all your details are correct.", "Try again later for AI-powered insights."]
  };
};

module.exports = { generateLoanInsights };
