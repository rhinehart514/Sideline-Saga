# Sideline Saga - Zero-Cost Deployment Guide

This guide walks you through deploying Sideline Saga for **$0/month**.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ React App (Vercel/Netlify - FREE)                       ││
│  │   ├─ Local Game Engine (deterministic logic)            ││
│  │   ├─ LocalStorage Cache (reduces API calls)             ││
│  │   └─ Calls Proxy for AI narrative                       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Cloudflare Worker (FREE - 100k req/day)                     │
│   ├─ Hides API key                                          │
│   ├─ Rate limiting                                          │
│   └─ CORS protection                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Google Gemini API (FREE TIER)                               │
│   ├─ 1,500 requests/day                                     │
│   ├─ 15 requests/minute                                     │
│   └─ gemini-2.0-flash model                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

**Free tier limits:**
- 1,500 requests per day
- 15 requests per minute  
- 1 million tokens per minute

---

## Step 2: Deploy the Cloudflare Worker (API Proxy)

This keeps your API key secure (not exposed in browser).

### 2.1 Create a Cloudflare account
Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up (free).

### 2.2 Create a Worker
1. Click **Workers & Pages** → **Create**
2. Select **"Create Worker"**
3. Give it a name like `sideline-saga-proxy`
4. Click **Deploy** (ignore the hello world code for now)

### 2.3 Add your code
1. Click **Edit Code**
2. Delete everything and paste the contents of `worker/gemini-proxy.js`
3. Click **Deploy**

### 2.4 Add your API key
1. Go to your Worker → **Settings** → **Variables**
2. Click **Add Variable**
3. Name: `GEMINI_API_KEY`
4. Value: Your API key from Step 1
5. Click **Encrypt** (important!)
6. Click **Deploy**

### 2.5 Get your Worker URL
Copy the URL like: `https://sideline-saga-proxy.your-username.workers.dev`

---

## Step 3: Deploy the Frontend

### Option A: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add environment variable:
   - Name: `VITE_PROXY_URL`
   - Value: Your Cloudflare Worker URL from Step 2.5
4. Deploy!

### Option B: Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) → Import your repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable:
   - Name: `VITE_PROXY_URL`
   - Value: Your Cloudflare Worker URL
6. Deploy!

### Option C: Cloudflare Pages

1. In Cloudflare dashboard → **Workers & Pages** → **Create**
2. Select **Pages** → Connect to Git
3. Build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output: `dist`
4. Add environment variable: `VITE_PROXY_URL`
5. Deploy!

---

## Step 4: Update CORS (Important!)

After deploying your frontend, update the Worker to allow your domain:

1. Go to your Worker → **Edit Code**
2. Find `ALLOWED_ORIGINS` at the top
3. Add your production URL:

```javascript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://your-app.vercel.app',      // ← Add your URL
  'https://your-custom-domain.com',   // ← Optional
];
```

4. Click **Deploy**

---

## Local Development

For local dev, you can skip the proxy:

1. Copy `.env.example` to `.env.local`
2. Add your API key:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Run `npm run dev`

⚠️ **Never commit `.env.local`** - it's gitignored.

---

## Cost Breakdown

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| Vercel/Netlify | 100GB bandwidth | ~1GB/mo | **$0** |
| Cloudflare Worker | 100k req/day | ~1k/day max | **$0** |
| Gemini API | 1,500 req/day | ~500/day typical | **$0** |

**Monthly cost: $0**

---

## Optimizations Included

### 1. Local Game Engine
- Game simulations (W/L) calculated client-side
- Phase transitions handled locally
- Only narrative generation hits the API

### 2. Response Caching
- Similar scenarios return cached responses
- 24-hour TTL, 50 response limit
- Uses localStorage (persists across sessions)

### 3. Token Reduction
- System prompt: 50% smaller
- Max output: 2048 tokens (vs 8192)
- Minimal context sent per request

### 4. Rate Limiting
- Worker limits to 30 req/min per IP
- Prevents abuse and protects quota

---

## Scaling Beyond Free Tier

If you exceed limits:

### More API calls needed?
- Gemini paid: $0.075 per 1M input tokens
- Or self-host Llama/Mistral

### More users?
- Vercel Pro: $20/mo (unlimited bandwidth)
- Add Redis/KV caching at Worker level

### Custom domain?
- Cloudflare: Free SSL + DNS
- Or use Vercel/Netlify domains

---

## Troubleshooting

### "API key not configured"
- Check Worker environment variables
- Make sure key is set as `GEMINI_API_KEY`

### "Origin not allowed" 
- Add your frontend URL to `ALLOWED_ORIGINS` in Worker

### "Rate limit exceeded"
- Wait 60 seconds, or
- Check if you've exceeded daily Gemini quota

### Game stuck in "Offline Mode"
- Check browser console for errors
- Verify `VITE_PROXY_URL` is set correctly
- Test Worker URL directly in browser

---

## Questions?

Open an issue on GitHub or check the console for detailed error messages.
