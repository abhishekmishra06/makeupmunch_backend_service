// const admin = require('../config/firebase-admin');


// /**
//  * Send a structured push notification template with snooze options in data.
//  * @param {string} deviceToken - The device's FCM token.
//  * @param {string} activityName - The name of the activity.
//  * @param {string} event_Id - Event ID to handle snooze actions (optional).
//  */
// async function sendPushNotification(deviceToken, activityName, event_Id = '') {
//   const message = {
//     token: deviceToken,
     
//     data: {
//       event_Id: event_Id?.toString() || '',
//       activityName: activityName?.toString() || '',
//       actionType: 'REMINDER',
//       snoozeOptions: JSON.stringify(['5', '30']), 
//     },

//     android: {
//       notification: {
//         title: '⏰ Reminder',
//         body: activityName,
//         clickAction: 'FLUTTER_NOTIFICATION_CLICK',
//         channelId: 'reminder-channel',
//         priority: 'high',
//         visibility: 'public',
//       },
//       // priority:"high"
//     },
//     apns: {
//       payload: {
//         aps: {
//           alert: {
//             title: '⏰ Reminder',
//             body: activityName || 'evnt'
//           },
//           category: 'REMINDER_CATEGORY',
//           sound: 'default'
//         }
//       }
//     }
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     console.log('✅ Notification sent:', response);
//   } catch (error) {
//     console.error(' Error sending push notification:', error.message);
//   }
// }

// module.exports = sendPushNotification;



const admin = require('../config/firebase-admin');

/**
 * Send a dynamic push notification (supports Android and iOS).
 * @param {Object} options - Notification options.
 * @param {string} options.token - Device FCM token.
 * @param {string} options.title - Notification title.
 * @param {string} options.body - Notification body.
 * @param {string} [options.imageUrl] - Optional image URL.
 * @param {string} [options.clickAction] - What should happen when the user clicks the notification.
 * @param {string} [options.channelId] - Android notification channel ID.
 * @param {string} [options.actionType] - Optional custom action type for routing/tracking.
 */
async function sendPushNotification({
  token,
  title,
  body,
  imageUrl = '',
  clickAction = 'FLUTTER_NOTIFICATION_CLICK',
  channelId = 'default-channel',
  actionType = '',
}) {

  console.log(title);
  console.log(body);
  console.log("body");
  if (!token || token.trim() === '') {
    console.error('❌ FCM token is missing or invalid');
    throw new Error('FCM token is required');
  }

  const message = {
    token,
    data: {
      title,
      body,
      imageUrl,
      clickAction,
      channelId,
      actionType,
    },
    android: {
      notification: {
        title,
        body,
        imageUrl,
        clickAction,
        channelId,
        priority: 'high',
        visibility: 'public',
      },
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title,
            body,
          },
          sound: 'default',
          category: actionType || 'GENERAL',
        }
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending push notification:', error.message);
    throw error;
  }
}
 
module.exports = sendPushNotification;
