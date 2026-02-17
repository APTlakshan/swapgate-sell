const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configuration
const TELEGRAM_BOT_TOKEN = "8549260649:AAG5h9hHumxEpvhCXuiGMrhAwx-cMrgp_ak";
const TELEGRAM_CHAT_ID = "8434905389";

// ========== TELEGRAM MESSAGE ENDPOINT ==========
app.post('/api/send-message', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ ok: false, error: 'Message is required' });
        }
        
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        console.log('Telegram API response:', data);
        
        res.json(data);
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

// ========== TELEGRAM FILE ENDPOINT ==========
app.post('/api/send-file', async (req, res) => {
    try {
        const { fileBase64, fileName, caption } = req.body;
        
        if (!fileBase64 || !fileName) {
            return res.status(400).json({ ok: false, error: 'File data and name are required' });
        }
        
        // Convert base64 to buffer
        const base64Data = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
        const buffer = Buffer.from(base64Data, 'base64');
        
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
        
        // Create FormData using form-data package
        const FormData = require('form-data');
        const form = new FormData();
        form.append('chat_id', TELEGRAM_CHAT_ID);
        form.append('document', buffer, fileName);
        if (caption) {
            form.append('caption', caption);
        }
        
        const response = await fetch(telegramUrl, {
            method: 'POST',
            body: form
        });
        
        const data = await response.json();
        console.log('Telegram file API response:', data);
        
        res.json(data);
    } catch (error) {
        console.error('Error sending file to Telegram:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

// ========== SERVE HTML ==========
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT}`);
});
