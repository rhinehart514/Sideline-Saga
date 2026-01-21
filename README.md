<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sideline Saga

**Immersive Football Coaching Career Simulator** powered by AI.

Start as a nobody in 1995 and climb the coaching ladder—or crash and burn trying.

## 🎮 Features

- **AI-Driven Narrative**: Every decision shapes your story
- **Full Career Simulation**: GA → Coordinator → Head Coach → Legend (or Fired)
- **Coaching Carousel**: Negotiate contracts, field offers, burn bridges
- **Era-Accurate Economics**: 1995 salaries ≠ 2025 salaries
- **Local Game Engine**: Fast, deterministic game simulations
- **Response Caching**: Reduced API calls for similar scenarios

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Set your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Get a Free API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy and add to `.env.local`

## 🌐 Deploy for Free

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full instructions.

**TL;DR:**
1. Deploy Cloudflare Worker (hides API key) → Free
2. Deploy to Vercel/Netlify → Free
3. Gemini API → Free tier (1,500 req/day)

**Total cost: $0/month**

## 📁 Project Structure

```
├── App.tsx                 # Main app component
├── components/             # UI components
│   ├── ActionPanel.tsx     # Player choices
│   ├── CareerWikibox.tsx   # Career history modal
│   ├── JobOfferDisplay.tsx # Contract negotiations
│   ├── SceneDisplay.tsx    # Narrative display
│   ├── Sidebar.tsx         # Game state dashboard
│   └── Timeline.tsx        # Season phase indicator
├── services/
│   ├── geminiService.ts    # AI integration (optimized)
│   ├── gameEngine.ts       # Local game logic
│   └── cache.ts            # Response caching
├── worker/
│   └── gemini-proxy.js     # Cloudflare Worker (API proxy)
├── types.ts                # TypeScript definitions
└── constants.ts            # Game prompts & config
```

## 🏗️ Architecture

```
Browser                    Cloudflare Worker           Gemini API
┌──────────────────┐      ┌─────────────────┐      ┌──────────────┐
│ React App        │      │ API Proxy       │      │ gemini-2.0-  │
│ ├─ Game Engine   │─────▶│ ├─ Hides key    │─────▶│ flash        │
│ ├─ Cache Layer   │      │ ├─ Rate limits  │      │ (Free tier)  │
│ └─ UI Components │◀─────│ └─ CORS         │◀─────│              │
└──────────────────┘      └─────────────────┘      └──────────────┘
```

**Optimizations:**
- Local game simulation (no API for W/L calculations)
- 50% smaller system prompts
- Response caching (localStorage)
- 2048 max tokens (down from 8192)

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Dev only | Direct API access for local dev |
| `VITE_PROXY_URL` | Production | Your Cloudflare Worker URL |

### Cloudflare Worker Setup

1. Create a Worker at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Paste code from `worker/gemini-proxy.js`
3. Add `GEMINI_API_KEY` as encrypted environment variable
4. Update `ALLOWED_ORIGINS` with your domain

## 📊 Free Tier Limits

| Service | Limit | Typical Usage |
|---------|-------|---------------|
| Gemini API | 1,500 req/day | ~500/day |
| Cloudflare Worker | 100k req/day | ~1k/day |
| Vercel/Netlify | 100GB bandwidth | ~1GB/month |

## 🤝 Contributing

PRs welcome! Please open an issue first to discuss major changes.

## 📄 License

MIT

---

Built with 🏈 and a healthy disrespect for job security.
