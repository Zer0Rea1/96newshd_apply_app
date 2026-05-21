const { Expo } = require('expo-server-sdk')
const expo = new Expo()

async function sendPush(token, title, body, data = {}) {
  if (!token || !Expo.isExpoPushToken(token)) {
    console.warn('Invalid or missing Expo push token:', token)
    return
  }

  const messages = [{ to: token, title, body, sound: 'default', data }]

  try {
    const chunks = expo.chunkPushNotifications(messages)
    for (const chunk of chunks) {
      const receipts = await expo.sendPushNotificationsAsync(chunk)
      console.log('Push receipts:', receipts)
    }
  } catch (err) {
    console.error('Push notification error:', err)
  }
}

module.exports = { sendPush }
