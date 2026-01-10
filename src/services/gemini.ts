const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Models to try in order (fallback chain)
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-pro-vision'
];

export interface ReceiptAnalysis {
  total: number;
  merchant: string;
  date: string;
  category: string;
  items: Array<{ name: string; price: number }>;
}

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function analyzeReceipt(imageBase64: string, retryCount = 0): Promise<ReceiptAnalysis> {
  // Extract mime type and base64 data
  const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
  
  let mimeType = 'image/jpeg';
  let base64Data = imageBase64;
  
  if (matches) {
    mimeType = matches[1];
    base64Data = matches[2];
  } else if (imageBase64.includes(',')) {
    // Fallback: just split by comma
    base64Data = imageBase64.split(',')[1];
  }

  const requestBody = {
    contents: [{
      parts: [
        {
          text: `Analyze this receipt image and extract purchase details.

IMPORTANT: Return ONLY a valid JSON object, no other text, no markdown formatting.

Required JSON format:
{"total":0,"merchant":"","date":"","category":"","items":[]}

Instructions:
- total: Find the TOTAL, AMOUNT DUE, BALANCE DUE, or GRAND TOTAL - this is the final amount paid as a number (e.g., 12.99 not "$12.99")
- merchant: The store or restaurant name at the top of the receipt
- date: The date on the receipt in MM/DD/YYYY format, or "Unknown" if not visible
- category: Classify as exactly one of: "Food & Dining", "Groceries", "Shopping", "Entertainment", "Transportation", "Health", "Utilities", "Other"
- items: List of purchased items with name and price as number

Example response:
{"total":24.57,"merchant":"Trader Joe's","date":"01/10/2026","category":"Groceries","items":[{"name":"Milk","price":4.99},{"name":"Bread","price":3.49}]}`
        },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
    }
  };

  // Try each model in the fallback chain
  for (const model of GEMINI_MODELS) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
    try {
      console.log(`Trying model: ${model}...`);
      
      const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      // Handle rate limiting with retry
      if (response.status === 429) {
        const errorData = await response.json();
        console.warn(`Rate limited on ${model}:`, errorData.error?.message);
        
        // If we've retried 3 times, try next model
        if (retryCount < 2) {
          const waitTime = 5000 * (retryCount + 1); // 5s, 10s
          console.log(`Waiting ${waitTime/1000}s before retry...`);
          await delay(waitTime);
          return analyzeReceipt(imageBase64, retryCount + 1);
        }
        // Continue to next model
        continue;
      }

      // Handle model not found - try next model
      if (response.status === 404) {
        console.warn(`Model ${model} not found, trying next...`);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error (${model}):`, response.status, errorText);
        continue;
      }

      const data = await response.json();
      
      // Check for API errors
      if (data.error) {
        console.error(`Gemini API error (${model}):`, data.error);
        continue;
      }

      // Extract text from response
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        console.error('No text in Gemini response:', data);
        continue;
      }

      console.log(`Success with ${model}! Raw response:`, text);

      // Parse the JSON from the response
      const result = parseGeminiResponse(text);
      console.log('Parsed receipt data:', result);
      
      return result;
    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      continue;
    }
  }

  // All models failed - return default
  console.error('All Gemini models failed, returning default data');
  return {
    total: 0,
    merchant: 'Unknown',
    date: 'Unknown', 
    category: 'Other',
    items: []
  };
}

function parseGeminiResponse(text: string): ReceiptAnalysis {
  // Remove any markdown code blocks
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();
  
  // Try to find JSON object in the text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(cleaned);
    
    return {
      total: toNumber(parsed.total),
      merchant: String(parsed.merchant || 'Unknown'),
      date: String(parsed.date || 'Unknown'),
      category: validateCategory(parsed.category),
      items: parseItems(parsed.items)
    };
  } catch (e) {
    console.error('JSON parse error:', e, 'Text was:', cleaned);
    
    // Try to extract total from text if JSON fails
    const totalMatch = text.match(/total["\s:]+(\d+\.?\d*)/i);
    const merchantMatch = text.match(/merchant["\s:]+["']?([^"',\n}]+)/i);
    
    return {
      total: totalMatch ? parseFloat(totalMatch[1]) : 0,
      merchant: merchantMatch ? merchantMatch[1].trim() : 'Unknown',
      date: 'Unknown',
      category: 'Other',
      items: []
    };
  }
}

function toNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove currency symbols and parse
    const num = parseFloat(value.replace(/[$,]/g, ''));
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function validateCategory(category: string): string {
  const validCategories = [
    'Food & Dining',
    'Groceries', 
    'Shopping',
    'Entertainment',
    'Transportation',
    'Health',
    'Utilities',
    'Other'
  ];
  
  if (validCategories.includes(category)) {
    return category;
  }
  
  // Try to match partial
  const lower = (category || '').toLowerCase();
  if (lower.includes('food') || lower.includes('dining') || lower.includes('restaurant')) {
    return 'Food & Dining';
  }
  if (lower.includes('grocer')) return 'Groceries';
  if (lower.includes('shop')) return 'Shopping';
  if (lower.includes('entertain')) return 'Entertainment';
  if (lower.includes('transport') || lower.includes('gas') || lower.includes('fuel')) {
    return 'Transportation';
  }
  if (lower.includes('health') || lower.includes('pharm')) return 'Health';
  if (lower.includes('util')) return 'Utilities';
  
  return 'Other';
}

function parseItems(items: any): Array<{ name: string; price: number }> {
  if (!Array.isArray(items)) return [];
  
  return items.map(item => ({
    name: String(item?.name || 'Item'),
    price: toNumber(item?.price)
  })).filter(item => item.name && item.name !== 'Item');
}
