import fetch from 'node-fetch';

export const sendPushNotification = async (expoPushToken: any, message: any) => {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title: message.title,
      body: message.body,
      data: message.data || {},
    }),
  });
};
