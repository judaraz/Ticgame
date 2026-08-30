
const BOT_TOKEN = '8636278924:AAEDEgWuKV41TWYTcQAgzJ_OMsV8PkQAC2E';
const MINIAPP_URL = 'https://tempmail44.com/app.html';
const API_KEY = 'j4yxeNxwQMiuK2guugffuBtcBylQYvb';

export default async function handler(req, res) {
    console.log('Request method:', req.method);
    
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
            
            if (body.message) {
                const message = body.message;
                const chatId = message.chat.id;
                const text = message.text || '';
                const firstName = message.from?.first_name || 'User';
                const username = message.from?.username || '';
                
                console.log('Processing:', { chatId, firstName, text });
                
                // Handle /start command
                if (text === '/start' || text.startsWith('/start ')) {
                    const parts = text.split(' ');
                    const referralCode = parts[1] || '';
                    
                    const miniAppUrl = referralCode 
                        ? `${MINIAPP_URL}?startapp=${referralCode}`
                        : MINIAPP_URL;
                    
                    // Get real-time domain count
                    const domainCount = await getDomainCount();
                    
                    const keyboard = {
                        inline_keyboard: [
                            [
                                {
                                    text: '📧 Open TempMail44',
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
                        `🎯 Perfect for:\n` +
                        `• Free trials\n` +
                        `• Newsletter signups\n` +
                        `• Protecting your privacy\n` +
                        `• Avoiding spam\n\n` +
                        `👇 Tap below to start using TempMail44!`;
                    
                    await sendMessage(chatId, welcomeMessage, keyboard);
                    
                    // Save user
                    try {
                        await fetch('https://tempmail44.com/api/register-user.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chatId: chatId,
                                username: username,
                                firstName: firstName,
                                joinedAt: new Date().toISOString()
                            })
                        });
                    } catch (error) {
                        console.error('Failed to save user:', error);
                    }
                }
                
                // Handle /help command
                else if (text === '/help') {
                    const domainCount = await getDomainCount();
                    
                    const helpMessage = `📚 <b>TempMail44 Help</b>\n\n` +
                        `📧 <b>How to use:</b>\n` +
                        `1. Open the mini app\n` +
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
                        `• Delete email when done`;
                    
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
                        `👇 Open TempMail44 to start using!`;
                    
                    const keyboard = {
                        inline_keyboard: [[
                            {
                                text: '📧 Open TempMail44',
                                web_app: { url: MINIAPP_URL }
                            }
                        ]]
                    };
                    
                    await sendMessage(chatId, statsMessage, keyboard);
                }
                
                // Handle any other message
                else {
                    const defaultMessage = `📧 Use /start to open TempMail44\n` +
                        `Or /help for more information`;
                    
                    await sendMessage(chatId, defaultMessage);
                }
            }
            
            // Handle callback queries (button clicks)
            if (body.callback_query) {
                const callbackData = body.callback_query.data;
                const chatId = body.callback_query.message.chat.id;
                
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
                        `👇 Open TempMail44 to start!`;
                    
                    await sendMessage(chatId, statsMessage);
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
        
        return await response.json();
    } catch (error) {
        console.error('Failed to send message:', error);
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
        
        // Try fallback
        const fallbackResponse = await fetch(`https://tempmail44.com/api/domains/${API_KEY}/all`);
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
            
            return `🌐 <b>Available Domains (${domains.length})</b>\n\n${domainList}${moreText}\n\n📧 Use these domains in TempMail44!`;
        }
    } catch (error) {
        console.error('Failed to fetch domains:', error);
    }
    
    return `🌐 <b>Available Domains</b>\n\n📧 Open TempMail44 to see all available domains!`;
}
