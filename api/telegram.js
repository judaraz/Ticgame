// api/telegram.js
const BOT_TOKEN = '8636278924:AAEDEgWuKV41TWYTcQAgzJ_OMsV8PkQAC2E';
const MINIAPP_URL = 'https://tempmail44.com/app.html';
const API_KEY = 'j4yxeNxwQMiuK2guugffuBtcBylQYvb';

export default async function handler(req, res) {
    console.log('Request method:', req.method);
    console.log('Request body:', JSON.stringify(req.body));
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Handle GET request (webhook verification or status check)
    if (req.method === 'GET') {
        return res.status(200).json({ 
            ok: true, 
            message: 'TempMail44 Bot Webhook is active',
            bot: '@tempmailguru_bot',
            miniapp: MINIAPP_URL
        });
    }

    // Handle POST request (Telegram updates)
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
                
                // Handle /start command
                if (text === '/start' || text.startsWith('/start ')) {
                    const parts = text.split(' ');
                    const referralCode = parts[1] || '';
                    
                    const miniAppUrl = referralCode 
                        ? `${MINIAPP_URL}?startapp=${referralCode}`
                        : MINIAPP_URL;
                    
                    // Get real-time domain count
                    const domainCount = await getDomainCount();
                    
                    // Create keyboard with mini app button
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
                    
                    // Welcome message with real-time info
                    const welcomeMessage = `👋 Welcome ${firstName} to TempMail44!\n\n` +
                        `📧 Free Temporary Email Service\n\n` +
                        `✨ Features:\n` +
                        `• Instant email creation\n` +
                        `• Custom email addresses\n` +
                        `• ${domainCount} free domains available\n` +
                        `• Spam protection\n` +
                        `• No registration required\n\n` +
                        `🎯 Perfect for:\n` +
                        `• Free trials\n` +
                        `• Newsletter signups\n` +
                        `• Protecting your privacy\n` +
                        `• Avoiding spam\n\n` +
                        `👇 Tap below to get your temp mail!`;
                    
                    // Send welcome message
                    await sendMessage(chatId, welcomeMessage, keyboard);
                    
                    // Save user to database
                    try {
                        const userData = {
                            chatId: chatId,
                            firstName: firstName,
                            lastName: lastName,
                            username: username,
                            joinedAt: new Date().toISOString(),
                            lastActive: new Date().toISOString()
                        };
                        
                        await fetch('https://tempmail44.com/api/register-user.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(userData)
                        });
                        
                        console.log('User saved:', userData);
                    } catch (error) {
                        console.error('Failed to save user:', error);
                    }
                }
                
                // Handle /help command
                else if (text === '/help') {
                    const domainCount = await getDomainCount();
                    
                    const helpMessage = `📚 <b>TempMail44 Help</b>\n\n` +
                        `📧 <b>How to use:</b>\n` +
                        `1. Click "Get Temp Mail" button\n` +
                        `2. Generate random email or create custom\n` +
                        `3. Use email for signups\n` +
                        `4. Check inbox for messages\n\n` +
                        `🌐 <b>Domains:</b> ${domainCount} free domains\n\n` +
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
                    
                    await sendMessage(chatId, helpMessage);
                }
                
                // Handle /domains command
                else if (text === '/domains') {
                    const domainsMessage = await getDomainsMessage();
                    await sendMessage(chatId, domainsMessage);
                }
                
                // Handle /stats command
                else if (text === '/stats') {
                    const domainCount = await getDomainCount();
                    
                    const statsMessage = `📊 <b>TempMail44 Statistics</b>\n\n` +
                        `📧 <b>Service:</b> Active\n` +
                        `🌐 <b>Free Domains:</b> ${domainCount}\n` +
                        `⚡ <b>Speed:</b> Instant email creation\n` +
                        `🔒 <b>Privacy:</b> No registration required\n` +
                        `💰 <b>Cost:</b> 100% Free\n\n` +
                        `👇 Click below to start using!`;
                    
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
                
                // Handle any other message
                else {
                    const defaultMessage = `📧 Click the button below to get your temp mail!\n\n` +
                        `Or use /help for more information`;
                    
                    const keyboard = {
                        inline_keyboard: [[
                            {
                                text: '📧 Get Temp Mail',
                                web_app: { url: MINIAPP_URL }
                            }
                        ]]
                    };
                    
                    await sendMessage(chatId, defaultMessage, keyboard);
                }
            }
            
            // Handle callback queries (button clicks)
            if (body.callback_query) {
                const callbackData = body.callback_query.data;
                const chatId = body.callback_query.message.chat.id;
                
                console.log('Callback query:', { callbackData, chatId });
                
                // Handle view_domains button
                if (callbackData === 'view_domains') {
                    const domainsMessage = await getDomainsMessage();
                    await sendMessage(chatId, domainsMessage);
                }
                
                // Handle view_stats button
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
                
                // Answer callback query
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
    
    // Handle other methods
    return res.status(405).json({ error: 'Method not allowed' });
}

// Helper function to send Telegram message
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
        
        if (!result.ok) {
            console.error('Failed to send message:', result);
        }
        
        return result;
    } catch (error) {
        console.error('Error sending message:', error);
        return null;
    }
}

// Helper function to get domain count
async function getDomainCount() {
    try {
        // Try to get free domains first
        const response = await fetch(`https://tempmail44.com/api/domains/${API_KEY}/free`, {
            headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await response.json();
        
        if (data.status && data.data?.domains) {
            return data.data.domains.length;
        }
        
        // Fallback to all domains
        const fallbackResponse = await fetch(`https://tempmail44.com/api/domains/${API_KEY}/all`, {
            headers: { 'Cache-Control': 'no-cache' }
        });
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.status && fallbackData.data?.domains) {
            return fallbackData.data.domains.length;
        }
        
        return 0;
    } catch (error) {
        console.error('Failed to get domain count:', error);
        return 0;
    }
}

// Helper function to get domains list message
async function getDomainsMessage() {
    try {
        const response = await fetch(`https://tempmail44.com/api/domains/${API_KEY}/free`, {
            headers: { 'Cache-Control': 'no-cache' }
        });
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
