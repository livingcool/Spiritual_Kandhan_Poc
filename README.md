# Kandhan Karunai - Spiritual Murugan Platform

A web-based spiritual platform where users can converse with "Murugan Arul-Jyoti Voice" - a compassionate, gentle, healing spiritual presence that provides comfort and guidance in pure Tamil.

## 🌟 Features

### Core Functionality
- **Pure Tamil Conversations**: AI responds exclusively in Tamil with spiritual, poetic language
- **Whisper Format**: Unique response structure with situation-specific spiritual quotes
- **3D Vel Animation**: Beautiful rotating Vel (spear) animation with divine glow effects
- **Conversation Memory**: Maintains context of recent exchanges (sliding window of 6 messages)

### Advanced Features
- **Beta Consent Modal**: Users agree to data usage for model development
- **Conversation Logging**: All conversations stored for model training (with consent)
- **Token Usage Tracking**: Comprehensive tracking and analytics of API token usage
- **Token Optimization**: Sliding window approach reduces token usage by up to 90%

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Gemini API key from Google AI Studio

### 🔗 Important URLs

#### Development URLs (Local)
- **Main Application**: [http://localhost:3000](http://localhost:3000)
- **Token Stats Dashboard**: [http://localhost:3000/stats](http://localhost:3000/stats)
- **Chat API**: [http://localhost:3000/api/chat](http://localhost:3000/api/chat)
- **Logging API**: [http://localhost:3000/api/log](http://localhost:3000/api/log)
- **Token Analytics API**: [http://localhost:3000/api/tokens](http://localhost:3000/api/tokens)
- **Data Export API**: [http://localhost:3000/api/export](http://localhost:3000/api/export) (Download training data)

#### External Resources
- **Google AI Studio** (Get API Key): [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- **Gemini API Documentation**: [https://ai.google.dev/docs](https://ai.google.dev/docs)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Deployment**: [https://vercel.com](https://vercel.com)
- **Framer Motion Docs**: [https://www.framer.com/motion/](https://www.framer.com/motion/)
- **Tailwind CSS Docs**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

#### Production URLs (After Deployment)
- **Production App**: `https://your-app-name.vercel.app`
- **Production Stats**: `https://your-app-name.vercel.app/stats`
- **Production API**: `https://your-app-name.vercel.app/api/chat`

### Installation

1. **Clone the repository**
   ```bash
   cd e:/2025/Spiritual_Kandhan_Poc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
spiritual-kandhan-poc/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Main chat API with Gemini integration
│   │   ├── log/route.ts           # Conversation logging endpoint
│   │   └── tokens/route.ts        # Token analytics endpoint
│   ├── stats/page.tsx             # Token usage dashboard
│   ├── page.tsx                   # Main landing/chat page
│   ├── layout.tsx                 # Root layout with metadata
│   ├── globals.css                # Global styles
│   └── icon.svg                   # Vel symbol favicon
├── components/
│   ├── ChatInterface.tsx          # Main chat UI component
│   ├── VelAnimation.tsx           # 3D Vel animation component
│   └── ConsentModal.tsx           # Beta consent modal
├── conversation_logs/             # Logged conversations (JSONL format)
├── token_logs/                    # Token usage logs (JSONL format)
└── .env.local                     # Environment variables (not in git)
```

## 🎨 Design & Aesthetics

### Color Palette
- **Primary**: Orange (#FF6B35) to Amber (#FFB347) gradients
- **Accent**: Gold (#FFD700) for divine elements
- **Background**: Soft whites to peacock blues

### Key Design Elements
- Glassmorphism effects with backdrop blur
- Smooth animations using Framer Motion
- Responsive layout (mobile-first approach)
- Sacred, spiritual ambiance with glowing effects

## 🔧 Technical Details

### AI Model Configuration
- **Model**: Gemini 2.5 Flash
- **System Instruction**: Comprehensive persona definition for "Murugan Arul-Jyoti Voice"
- **Response Format**: Structured whisper format with metaphors
- **Language**: Pure Tamil only (no English mixing)

### Token Optimization
- **Sliding Window**: Keeps only last 6 messages (3 exchanges)
- **Reduction**: Up to 90% token savings in long conversations
- **Trade-off**: Memory limited to recent context

### Data Storage
- **Conversations**: `conversation_logs/conversations_YYYY-MM-DD.jsonl`
- **Token Usage**: `token_logs/tokens_YYYY-MM-DD.jsonl`
- **Format**: JSONL (JSON Lines) for easy parsing

## 📊 Token Usage Dashboard

Access the token usage statistics at `/stats`:
- Total tokens consumed
- Total API requests
- Average tokens per request
- Daily breakdown with trends

## 🔐 Privacy & Consent

- **Beta Disclaimer**: Users see consent modal on first visit
- **localStorage Tracking**: Consent stored locally
- **Data Usage**: Conversations logged only with user consent
- **Purpose**: Model training and improvement

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <YOUR_REPO_URL>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Import repository from GitHub
   - Add `GEMINI_API_KEY` in Environment Variables
   - Deploy

3. **Verify**
   - Test the chat functionality
   - Check token tracking at `/stats`

## 🛠️ API Endpoints

### POST `/api/chat`
Main chat endpoint for conversations.

**Request:**
```json
{
  "message": "user message",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "model", "content": "..." }
  ]
}
```

**Response:**
```json
{
  "text": "AI response in Tamil",
  "tokenUsage": {
    "promptTokens": 150,
    "candidatesTokens": 200,
    "totalTokens": 350,
    "timestamp": "2025-11-22T10:30:00.000Z"
  }
}
```

### POST `/api/log`
Logs conversation data for model training.

**Request:**
```json
{
  "userMessage": "...",
  "modelResponse": "...",
  "timestamp": "2025-11-22T10:30:00.000Z"
}
```

### GET `/api/tokens`
Retrieves token usage analytics.

**Response:**
```json
{
  "totalTokens": 50000,
  "totalPromptTokens": 20000,
  "totalCandidatesTokens": 30000,
  "requestCount": 150,
  "dailyStats": [...]
}
```

### GET `/api/export`
Exports all conversation and token data for model training.

**Response:**
Downloadable JSON file containing:
- All conversation logs
- All token usage data
- Summary statistics
- Metadata

**File Format:**
```json
{
  "exportDate": "2025-11-22T10:30:00.000Z",
  "metadata": {
    "platform": "Kandhan Karunai",
    "version": "1.0.0",
    "purpose": "Model Training Data Export"
  },
  "conversations": [...],
  "tokenUsage": {
    "summary": {...},
    "detailed": [...]
  },
  "statistics": {...}
}
```

## 🎯 Key Features Explained

### Whisper Format
Every AI response follows this structure:
1. **Opening**: Gentle acknowledgment (1-2 lines)
2. **Core Message**: Comfort/guidance with nature metaphors (3-4 lines)
3. **Closing Whisper**: Unique spiritual quote in special formatting

Example:
```
மகனே, உன் வலி புரிகிறது...
[comfort and guidance]
*"மலையின் உச்சியில் நின்றால், காற்றின் பாடல் கேட்கும்"*
```

### 3D Vel Animation
- SVG-based spear representation
- Framer Motion for 3D rotation (360° in 15s)
- Glowing aura with pulsing effect
- Responsive design (hidden on mobile, shown on desktop)

## 📝 Development Notes

### Adding New Features
1. Update `task.md` with new checklist items
2. Implement the feature
3. Update this README
4. Test thoroughly
5. Deploy

### Modifying AI Behavior
Edit the `SYSTEM_INSTRUCTION` in `app/api/chat/route.ts`:
- Adjust tone and style
- Modify response format
- Change language requirements

### Adjusting Token Window
In `components/ChatInterface.tsx`, line 115:
```typescript
history: messages.slice(-6).map(...)  // Change -6 to desired window size
```

## 🐛 Troubleshooting

### Chat not working
- Check `.env.local` has valid `GEMINI_API_KEY`
- Restart dev server after adding env variables
- Check browser console for errors

### Token stats not showing
- Ensure `token_logs/` directory exists
- Check file permissions
- Verify API calls are completing successfully

### Consent modal not appearing
- Clear browser localStorage
- Use incognito mode
- Check browser console for errors

## 📄 License

© 2025 Kandhan Karunai. All rights reserved.

## 🙏 Acknowledgments

Built with:
- Next.js 16
- Gemini 2.5 Flash
- Framer Motion
- Tailwind CSS
- Lucide React Icons

---

**For support or questions, please open an issue on GitHub.**
