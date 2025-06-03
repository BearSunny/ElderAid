import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Medication } from '@/types';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

// Configure notifications
export const configureNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

// Schedule a medication reminder
export const scheduleMedicationReminder = async (
  medication: Medication,
  scheduleTime: string,
  scheduleDays: string[]
): Promise<string> => {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return 'web-not-supported';
  }

  // Parse time from HH:MM format
  const [hours, minutes] = scheduleTime.split(':').map(Number);

  let trigger: Notifications.DailyTriggerInput = {
    hour: hours,
    minute: minutes,
    type: SchedulableTriggerInputTypes.DAILY
  };

  // Create a trigger for each day of the week the medication is scheduled
  const now = new Date();
  const dayIndices: { [key: string]: number } = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
  };

  // Schedule for the next occurrence
  const nextTriggerDate = new Date();
  nextTriggerDate.setHours(hours, minutes, 0, 0);

  // If the time has passed for today, set it for tomorrow
  if (nextTriggerDate.getTime() <= now.getTime()) {
    nextTriggerDate.setDate(nextTriggerDate.getDate() + 1);
  }

  // Schedule the notification
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Medication Reminder',
      body: `Time to take ${medication.name} (${medication.dosage})`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { medicationId: medication.id },
    },
    trigger,
  });

  return identifier;
};

// Cancel a scheduled notification
export const cancelNotification = async (identifier: string): Promise<void> => {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return;
  }
  
  await Notifications.cancelScheduledNotificationAsync(identifier);
};

// Cancel all notifications
export const cancelAllNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return;
  }
  
  await Notifications.cancelAllScheduledNotificationsAsync();
};