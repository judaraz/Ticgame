// api/set-webhook.js
const BOT_TOKEN = '8636278924:AAEDEgWuKV41TWYTcQAgzJ_OMsV8PkQAC2E';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the deployment URL
        const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}`
            : 'https://tempmail44.com';
        
        const webhookUrl = `${baseUrl}/api/telegram`;
        
        // Set webhook
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: webhookUrl,
                allowed_updates: ['message', 'callback_query']
            })
        });
        
        const result = await response.json();
        
        // Get webhook info
        const infoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
        const info = await infoResponse.json();
        
        return res.status(200).json({
            success: true,
            webhookUrl: webhookUrl,
            setResult: result,
            webhookInfo: info
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
}
