// api/broadcast.js
const BOT_TOKEN = '8636278924:AAEDEgWuKV41TWYTcQAgzJ_OMsV8PkQAC2E';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, chatIds } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        let users = chatIds || [];
        
        // If no specific chatIds, fetch all users from your database
        if (!users.length) {
            // Fetch from your cPanel API
            try {
                const response = await fetch('https://tempmail44.com/api/get-users.php');
                const data = await response.json();
                if (data.users) {
                    users = data.users.map(u => u.chatId);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        }
        
        let sentCount = 0;
        let failedCount = 0;
        
        for (const chatId of users) {
            try {
                const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });
                
                const result = await response.json();
                if (result.ok) {
                    sentCount++;
                } else {
                    failedCount++;
                }
            } catch (error) {
                failedCount++;
            }
            
            // Rate limiting - 30 messages per second
            await new Promise(resolve => setTimeout(resolve, 35));
        }
        
        return res.status(200).json({
            success: true,
            sent: sentCount,
            failed: failedCount,
            total: users.length
        });
    } catch (error) {
        console.error('Broadcast error:', error);
        return res.status(500).json({ error: error.message });
    }
}
