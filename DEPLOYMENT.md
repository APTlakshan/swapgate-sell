# Swap Gate - Deployment Guide

## Problem Fixed
The **400 error** was caused by CORS policy blocking direct browser requests to Telegram API. This has been fixed by creating a backend proxy server.

## Architecture Changes
- ✅ Created `server.js` - Node.js/Express backend to handle Telegram API calls
- ✅ Updated `script.js` - Frontend now calls `/api/send-message` and `/api/send-file` endpoints
- ✅ Updated `package.json` - Added required dependencies

## Files Structure
```
swapgate-selling/
├── server.js           # Backend server (handles Telegram)
├── index.html          # Frontend HTML
├── styles.css          # Styling
├── script.js           # Frontend JavaScript
├── package.json        # Node.js dependencies
└── package-lock.json
```

## How It Works Now
1. User submits order in the browser
2. Frontend calls local API endpoint (`/api/send-message`)
3. Backend server forwards request to Telegram API
4. Telegram API responds to backend (no CORS issues)
5. Backend returns response to frontend

## Local Testing (Before Deploying to Render)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the Server
```bash
npm start
```
Or for development with auto-reload:
```bash
npm run dev
```

### Step 3: Open in Browser
Navigate to: `http://localhost:3000`

## Deploying to Render

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add backend server for Telegram API"
git push -u origin main
```

### Step 2: Create New Service on Render
1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `swapgate-selling`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Deploy
- Click "Deploy"
- Render will automatically download dependencies and start the server
- Your app will be available at: `https://swapgate-selling.onrender.com`

## Troubleshooting

### If you still get 400 errors:
1. Check server logs on Render dashboard
2. Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `server.js`
3. Make sure all dependencies installed: `npm install`

### If frontend can't reach backend:
1. Update the API URLs in `script.js` to use full URL (if needed):
   ```javascript
   const API_BASE = window.location.hostname === 'localhost' 
     ? 'http://localhost:3000' 
     : 'https://swapgate-selling.onrender.com';
   ```

### If files not found:
1. Ensure `index.html`, `styles.css`, and `script.js` are in the root directory
2. Check that `server.js` has correct paths

## What Was Previously Broken
```javascript
// ❌ OLD (BROKEN) - Direct browser to Telegram
const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
fetch(url) // CORS blocks this
```

## What Works Now
```javascript
// ✅ NEW (WORKING) - Browser to Backend to Telegram
fetch('/api/send-message', {
    method: 'POST',
    body: JSON.stringify({ message })
}) // Backend proxy handles the Telegram API call
```

## API Endpoints

### Send Message
- **POST** `/api/send-message`
- Body: `{ "message": "Your message here" }`

### Send File
- **POST** `/api/send-file`
- Body: `{ "fileBase64": "data:image/png;base64,...", "fileName": "receipt.png", "caption": "Receipt" }`

### Health Check
- **GET** `/api/health`
- Returns: `{ "status": "Server is running" }`

## Important Notes
✅ Messages are now sent via backend (no CORS issues)
✅ Files are properly handled server-side
✅ No localStorage quota errors
✅ Deployment to Render is straightforward
✅ Auto-scaling and reliability

For issues, check the Render logs: Dashboard → Your Service → Logs
