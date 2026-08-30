// api/telegram.js
const BOT_TOKEN = '8636278924:AAEDEgWuKV41TWYTcQAgzJ_OMsV8PkQAC2E';
const MINIAPP_URL = 'https://tempmail44.com/app.html';
const API_KEY = 'j4yxeNxwQMiuK2guugffuBtcBylQYvb';

export default async function handler(req, res) {
    console.log('Request method:', req.method);
    console.log('Request body:', JSON.stringify(req.body));
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).json({ 
            ok: true, 
            message: 'TempMail44 Bot Webhook is active',
            bot: '@tempmailguru_bot',
            miniapp: MINIAPP_URL
        });
    }

    if (req.method === 'POST') {
        try {
            const body = req.body;
            
            // Handle message updates
            if (body.message) {
                const message = body.message;
                const chatId = message.chat.id;
                const text = message.text || '';
                const firstName = message.from?.first_name || 'User';
                const lastName = message.from?.last_name || '';
                const username = message.from?.username || '';
                
                console.log('Processing message:', { chatId, firstName, text });
                
                // Save user immediately for ANY interaction
                await saveUser(chatId, firstName, lastName, username);
                
                // Handle /start command
                if (text === '/start' || text.startsWith('/start ')) {
                    const parts = text.split(' ');
                    const referralCode = parts[1] || '';
                    
                    const miniAppUrl = referralCode 
                        ? `${MINIAPP_URL}?startapp=${referralCode}`
                        : MINIAPP_URL;
                    
                    const domainCount = await getDomainCount();
                    
                    const keyboard = {
                        inline_keyboard: [
                            [
                                {
                                    text: '📧 Get Temp Mail',
                                    web_app: { url: miniAppUrl }
                                }
                            ],
                            [
                                {
                                    text: '🌐 View Domains',
                                    callback_data: 'view_domains'
                                },
                                {
                                    text: '📊 Stats',
                                    callback_data: 'view_stats'
                                }
                            ]
                        ]
                    };
                    
                    const welcomeMessage = `👋 Welcome ${firstName} to TempMail44!\n\n` +
                        `📧 Free Temporary Email Service\n\n` +
                        `✨ Features:\n` +
                        `• Instant email creation\n` +
                        `• Custom email addresses\n` +
                        `• ${domainCount} free domains available\n` +
                        `• Spam protection\n` +
                        `• No registration required\n\n` +
                        `👇 Tap below to get your temp mail!`;
                    
                    await sendMessage(chatId, welcomeMessage, keyboard);
                }
                
                // Handle /help command
                else if (text === '/help') {
                    const helpMessage = `📚 <b>TempMail44 Help</b>\n\n` +
                        `📧 <b>How to use:</b>\n` +
                        `1. Click "Get Temp Mail" button\n` +
                        `2. Generate random email or create custom\n` +
                        `3. Use email for signups\n` +
                        `4. Check inbox for messages\n\n` +
                        `🔄 <b>Commands:</b>\n` +
                        `/start - Open TempMail44\n` +
                        `/help - Show this help\n` +
                        `/domains - Show available domains\n\n` +
                        `💡 <b>Tip:</b> Use the menu button for quick access!`;
                    
                    await sendMessage(chatId, helpMessage);
                }
                
                // Handle /domains command
                else if (text === '/domains') {
                    const domainsMessage = await getDomainsMessage();
                    await sendMessage(chatId, domainsMessage);
                }
                
                // Handle any other message (including menu button clicks)
                else {
                    const keyboard = {
                        inline_keyboard: [[
                            {
                                text: '📧 Get Temp Mail',
                                web_app: { url: MINIAPP_URL }
                            }
                        ]]
                    };
                    
                    const defaultMessage = `📧 Click the button below to get your temp mail!`;
                    
                    await sendMessage(chatId, defaultMessage, keyboard);
                }
            }
            
            // Handle callback queries (button clicks)
            if (body.callback_query) {
                const callbackData = body.callback_query.data;
                const chatId = body.callback_query.message.chat.id;
                
                console.log('Callback query:', { callbackData, chatId });
                
                if (callbackData === 'view_domains') {
                    const domainsMessage = await getDomainsMessage();
                    await sendMessage(chatId, domainsMessage);
                }
                
                if (callbackData === 'view_stats') {
                    const domainCount = await getDomainCount();
                    
                    const statsMessage = `📊 <b>TempMail44 Statistics</b>\n\n` +
                        `🌐 <b>Free Domains:</b> ${domainCount}\n` +
                        `⚡ <b>Speed:</b> Instant\n` +
                        `🔒 <b>Privacy:</b> No registration\n\n` +
                        `👇 Click below to get your temp mail!`;
                    
                    const keyboard = {
                        inline_keyboard: [[
                            {
                                text: '📧 Get Temp Mail',
                                web_app: { url: MINIAPP_URL }
                            }
                        ]]
                    };
                    
                    await sendMessage(chatId, statsMessage, keyboard);
                }
                
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        callback_query_id: body.callback_query.id
                    })
                });
            }
            
            return res.status(200).json({ ok: true });
            
        } catch (error) {
            console.error('Error processing webhook:', error);
            return res.status(500).json({ 
                ok: false,
                error: error.message 
            });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}

// Helper function to save user
async function saveUser(chatId, firstName, lastName, username) {
    try {
        const userData = {
            chatId: chatId,
            firstName: firstName,
            lastName: lastName,
            username: username,
            lastActive: new Date().toISOString()
        };
        
        const response = await fetch('https://tempmail44.com/api/register-user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        console.log('User saved:', result);
        
        return result;
    } catch (error) {
        console.error('Failed to save user:', error);
        return null;
    }
}

// Helper function to send message
async function sendMessage(chatId, text, keyboard = null) {
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
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending message:', error);
        return null;
    }
}

// Helper function to get domain count
async function getDomainCount() {
    try {
        const response = await fetch(`https://tempmail44.com/api/domains/${API_KEY}/free`);
        const data = await response.json();
        
        if (data.status && data.data?.domains) {
            return data.data.domains.length;
        }
        
        return 0;
    } catch (error) {
        return 0;
    }
}

// Helper function to get domains message
async function getDomainsMessage() {
    try {
        const response = await fetch(`https://tempmail44.com/api/domains/${API_KEY}/free`);
        const data = await response.json();
        
        if (data.status && data.data?.domains) {
            const domains = data.data.domains;
            const domainList = domains.slice(0, 20).map((d, i) => {
                const domainName = d.domain || d.name || d;
                return `${i + 1}. @${domainName}`;
            }).join('\n');
            
            const moreText = domains.length > 20 ? `\n...and ${domains.length - 20} more!` : '';
            
            return `🌐 <b>Available Domains (${domains.length})</b>\n\n${domainList}${moreText}\n\n📧 Click "Get Temp Mail" to use these domains!`;
        }
    } catch (error) {
        console.error('Failed to fetch domains:', error);
    }
    
    return `🌐 <b>Available Domains</b>\n\n📧 Click "Get Temp Mail" to see all available domains!`;
}
