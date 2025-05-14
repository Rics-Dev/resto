// utils/NotificationService.js
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './api';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return true;
  }
  console.log('User declined push notification permissions');
  return false;
}

export async function getFCMToken() {
  let fcmToken = await AsyncStorage.getItem('fcmToken');
  
  if (!fcmToken) {
    try {
      fcmToken = await messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  }
  
  return fcmToken;
}

export async function registerFCMToken(userId, userRole) {
  try {
    const fcmToken = await getFCMToken();
    if (fcmToken) {
      await notificationService.registerToken(userId, userRole, fcmToken);
      console.log('FCM Token registered with server');
    }
  } catch (error) {
    console.error('Error registering FCM token:', error);
  }
}

export function setupFCMListeners(navigation) {
  // Handle background/quit state notifications
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened app:', remoteMessage);
    handleNotificationNavigation(remoteMessage, navigation);
  });

  // Check if app was opened from a notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from notification:', remoteMessage);
        handleNotificationNavigation(remoteMessage, navigation);
      }
    });

  // Foreground notification handler
  return messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification received:', remoteMessage);
    // You can show a local notification here
    return remoteMessage;
  });
}

function handleNotificationNavigation(remoteMessage, navigation) {
  // Handle navigation based on notification data
  const { data } = remoteMessage;
  
  if (data) {
    if (data.id_commande) {
      navigation.navigate('OrderDetails', { id: data.id_commande });
    } else if (data.type === 'rating') {
      navigation.navigate('RatingScreen');
    }
  }
}
