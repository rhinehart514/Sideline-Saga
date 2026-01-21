/**
 * CLOUDFLARE WORKER - GEMINI API PROXY
 * 
 * Deploy this to Cloudflare Workers (free tier: 100k requests/day)
 * This keeps your API key server-side and adds rate limiting.
 * 
 * SETUP:
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create
 * 2. Paste this code
 * 3. Add environment variable: GEMINI_API_KEY = your key
 * 4. Deploy and copy the worker URL
 * 5. Update PROXY_URL in your app
 */

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://sideline-saga.vercel.app', // Update with your actual domain
  'https://sideline-saga.netlify.app',
];

// Rate limiting (per IP, stored in Cloudflare KV or in-memory)
const RATE_LIMIT = {
  requests: 30,      // Max requests
  windowMs: 60000,   // Per minute
};

// In-memory rate limit store (resets on worker restart - use KV for persistence)
const rateLimitStore = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { count: 0, resetAt: now + RATE_LIMIT.windowMs };
  
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + RATE_LIMIT.windowMs;
  }
  
  record.count++;
  rateLimitStore.set(ip, record);
  
  return {
    allowed: record.count <= RATE_LIMIT.requests,
    remaining: Math.max(0, RATE_LIMIT.requests - record.count),
    resetAt: record.resetAt,
  };
}

function corsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }
    
    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    
    // Check origin
    if (!ALLOWED_ORIGINS.includes(origin) && origin !== '') {
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
        status: 403,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    
    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateCheck = checkRateLimit(clientIP);
    
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1000),
      }), {
        status: 429,
        headers: { 
          ...cors, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateCheck.resetAt),
          'Retry-After': String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
        },
      });
    }
    
    try {
      const body = await request.json();
      const { prompt, systemInstruction, schema, isInit } = body;
      
      if (!prompt) {
        return new Response(JSON.stringify({ error: 'Missing prompt' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      
      // Get API key from environment
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      
      // Call Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const geminiBody = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          maxOutputTokens: 2048, // Reduced from 8192!
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      };
      
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      });
      
      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API error:', errorText);
        
        // Handle rate limiting from Gemini
        if (geminiResponse.status === 429) {
          return new Response(JSON.stringify({ 
            error: 'Gemini rate limit hit',
            retryAfter: 60,
          }), {
            status: 429,
            headers: { ...cors, 'Content-Type': 'application/json', 'Retry-After': '60' },
          });
        }
        
        return new Response(JSON.stringify({ error: 'Gemini API error', details: errorText }), {
          status: geminiResponse.status,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      
      const geminiData = await geminiResponse.json();
      
      // Extract the text content
      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return new Response(JSON.stringify({ error: 'No response from Gemini' }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ text, cached: false }), {
        status: 200,
        headers: { 
          ...cors, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateCheck.remaining),
        },
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal error', message: error.message }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  },
};
