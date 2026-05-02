import * as admin from 'firebase-admin';
import path from 'path';

let isInitialized = false;

export function initializeFirebase() {
  if (isInitialized) return;
  
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_JSON is not set. Push notifications will fail.');
    return;
  }

  const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });
    console.log('✅ Firebase Admin initialized securely.');
    isInitialized = true;
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
  }
}

export async function sendPushNotification(token: string, title: string, body: string, data?: Record<string, string>) {
  if (!isInitialized) {
    console.error('Push failed: Firebase Admin not configured.');
    return false;
  }

  try {
    const message = {
      notification: { title, body },
      data: data || {},
      token,
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}
