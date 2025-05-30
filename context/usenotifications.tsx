import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.warn('Must use physical device for Push Notifications');
    return null;
  }

  // Configure notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Check and request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return null;
  }
  
  // Get the push token
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo push token:', token);
  
  return token;
};

const setupNotificationHandlers = () => {
  // Notification received handler
  const notificationReceivedListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
    // Handle notification while app is in foreground
  });

  // Notification response handler
  const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('User tapped notification:', response);
    // Handle user interaction with notification
  });

  return () => {
    // Cleanup function to remove listeners
    notificationReceivedListener.remove();
    notificationResponseListener.remove();
  };
};

export { registerForPushNotifications, setupNotificationHandlers };
