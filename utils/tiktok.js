const axios = require('axios');
const crypto = require('crypto');

async function sendTikTokPurchaseEvent({ email, value, packName, orderId }) {
  const TIKTOK_PIXEL_ID = '7516272278687023121';
  const ACCESS_TOKEN = '1b020e08e4cde8ea9a7790680871a71b454c9903';

  const hashEmail = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');

  const eventPayload = {
    pixel_code: TIKTOK_PIXEL_ID,
    event: {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: orderId,
      action_source: 'website',
      user: {
        external_id: hashEmail,
        email: hashEmail
      },
      properties: {
        value,
        currency: 'EUR',
        content_name: packName
      }
    }
  };

  try {
    const response = await axios.post(
      'https://business-api.tiktok.com/open_api/v1.2/pixel/track/',
      eventPayload,
      {
        headers: {
          'Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ TikTok event sent:', response.data);
  } catch (error) {
    console.error('❌ TikTok event failed:', error.response?.data || error.message);
  }
}

module.exports = { sendTikTokPurchaseEvent };
