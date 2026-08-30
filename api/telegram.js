// api/telegram.js
const BOT_TOKEN = '8636278924:AAEDEgWuKV41TWYTcQAgzJ_OMsV8PkQAC2E';
const MINIAPP_URL = 'https://tempmail44.com/app.html';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            const body = req.body;
            console.log('Received update:', JSON.stringify(body));
            
            // Handle messages
            if (body.message && body.message.text) {
                const text = body.message.text;
                const chatId = body.message.chat.id;
                const firstName = body.message.from?.first_name || 'User';
                const username = body.message.from?.username || '';
                
                console.log('Message received:', { chatId, firstName, text });
                
                // Handle /start command
                if (text.startsWith('/start')) {
                    const parts = text.split(' ');
                    const referralCode = parts[1] || '';
                    
                    const miniAppUrl = referralCode 
                        ? `${MINIAPP_URL}?startapp=${referralCode}`
                        : MINIAPP_URL;
                    
                    // Create keyboard with mini app button
                    const keyboard = {
                        inline_keyboard: [[
                            {
                                text: '📧 Open TempMail44',
                                web_app: { url: miniAppUrl }
                            }
                        ]]
                    };
                    
                    // Welcome message with all info
                    const welcomeMessage = `👋 <b>Welcome ${firstName} to TempMail44!</b>\n\n` +
                        `📧 <b>Free Temporary Email Service</b>\n\n` +
                        `✨ <b>Features:</b>\n` +
                        `• Instant email creation\n` +
                        `• Custom email addresses\n` +
                        `• Multiple domains available\n` +
                        `• Spam protection\n` +
                        `• No registration required\n\n` +
                        `🎯 <b>Perfect for:</b>\n` +
                        `• Free trials\n` +
                        `• Newsletter signups\n` +
                        `• Protecting your privacy\n` +
                        `• Avoiding spam\n\n` +
                        `📊 <b>Stats:</b>\n` +
                        `• 5+ Free domains\n` +
                        `• 100% Free service\n` +
                        `• Instant setup\n\n` +
                        `👇 Tap below to start using TempMail44!`;
                    
                    // Send welcome message
                    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: welcomeMessage,
                            parse_mode: 'HTML',
                            reply_markup: keyboard
                        })
                    });
                    
                    const result = await response.json();
                    console.log('Welcome message sent:', result);
                    
                    // Save user to database
                    await saveUser({
                        chatId: chatId,
                        username: username,
                        firstName: firstName,
                        joinedAt: new Date().toISOString()
                    });
                }
                
                // Handle /help command
                if (text === '/help') {
                    const helpMessage = `📚 <b>TempMail44 Help</b>\n\n` +
                        `📧 <b>How to use:</b>\n` +
                        `1. Open the mini app\n` +
                        `2. Generate random email or create custom\n` +
                        `3. Use email for signups\n` +
                        `4. Check inbox for messages\n\n` +
                        `🔄 <b>Commands:</b>\n` +
                        `/start - Open TempMail44\n` +
                        `/help - Show this help\n` +
                        `/domains - Show available domains\n` +
                        `/stats - Show statistics\n\n` +
                        `💡 <b>Tips:</b>\n` +
                        `• Emails auto-refresh every 8 seconds\n` +
                        `• You can change domains anytime\n` +
                        `• Delete email when done\n\n` +
                        `🔒 <b>Privacy:</b>\n` +
                        `• No registration required\n` +
                        `• Emails auto-delete\n` +
                        `• No personal data stored`;
                    
                    await sendTelegramMessage(chatId, helpMessage);
                }
                
                // Handle /domains command
                if (text === '/domains') {
                    const domainsMessage = await getDomainsMessage();
                    await sendTelegramMessage(chatId, domainsMessage);
                }
                
                // Handle /stats command
                if (text === '/stats') {
                    const statsMessage = `📊 <b>TempMail44 Statistics</b>\n\n` +
                        `📧 <b>Service:</b> Active\n` +
                        `🌐 <b>Domains:</b> Multiple free domains\n` +
                        `⚡ <b>Speed:</b> Instant email creation\n` +
                        `🔒 <b>Privacy:</b> No registration required\n\n` +
                        `👇 Open TempMail44 to start using!`;
                    
                    await sendTelegramMessage(chatId, statsMessage);
                }
            }
            
            // Handle callback queries (button clicks)
            if (body.callback_query) {
                const callbackData = body.callback_query.data;
                const chatId = body.callback_query.message.chat.id;
                
                if (callbackData === 'open_miniapp') {
                    const keyboard = {
                        inline_keyboard: [[
                            {
                                text: '📧 Open TempMail44',
                                web_app: { url: MINIAPP_URL }
                            }
                        ]]
                    };
                    
                    await sendTelegramMessage(chatId, '👇 Tap below to open TempMail44:', keyboard);
                }
            }
            
            res.status(200).json({ ok: true });
        } catch(e) {
            console.error('Error:', e);
            res.status(500).json({ error: e.message });
        }
    } else {
        // GET request - webhook verification or status
        res.status(200).json({ 
            ok: true, 
            message: 'TempMail44 Bot Webhook is active',
            bot: '@tempmailguru_bot',
            miniapp: MINIAPP_URL
        });
    }
}

// Helper function to send Telegram message
async function sendTelegramMessage(chatId, text, keyboard = null) {
    try {
        const body = {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        };
        
        if (keyboard) {
            body.reply_markup = keyboard;
        }
        
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Failed to send message:', error);
        return null;
    }
}

// Helper function to get domains message
async function getDomainsMessage() {
    try {
        const response = await fetch('https://tempmail44.com/api/domains/j4yxeNxwQMiuK2guugffuBtcBylQYvb/free');
        const data = await response.json();
        
        if (data.status && data.data?.domains) {
            const domains = data.data.domains;
            const domainList = domains.slice(0, 10).map((d, i) => {
                const domainName = d.domain || d.name || d;
                return `${i + 1}. @${domainName}`;
            }).join('\n');
            
            return `🌐 <b>Available Domains (${domains.length})</b>\n\n${domainList}\n\n📧 Use these domains in TempMail44!`;
        }
    } catch (error) {
        console.error('Failed to fetch domains:', error);
    }
    
    return `🌐 <b>Available Domains</b>\n\n📧 Open TempMail44 to see all available domains!`;
}

// Helper function to save user
async function saveUser(userData) {
    try {
        // Log user for now - integrate with your database later
        console.log('User saved:', userData);
        
        // You can also send to your cPanel API
        try {
            await fetch('https://tempmail44.com/api/register-user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        } catch (error) {
            console.error('Failed to save to cPanel:', error);
        }
    } catch (error) {
        console.error('Failed to save user:', error);
    }
}
