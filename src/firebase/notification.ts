// src/notifications/sendNotification.ts

import admin from "../firebase/firebase";

interface NotificationPayload {
  title: string;
  message: string;
}

export async function sendPushNotification(
  fcmToken: string,
  payload: NotificationPayload
) {
  try {
    const message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.message,
      },

      android: {
        notification: {
          icon: "ic_stat_notification", // Android drawable resource name
          color: "#FF0000", // Optional: icon background color
        },
      },

      apns: {
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.message,
            },
            sound: "default",
            badge: 1,
          },
        },
      },
      data: {
        // Optional: custom key-value data
        screen: "chat",
        userId: "123",
      },
    };
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    throw error;
  }
}
