import notifee, {
  AndroidImportance,
  AndroidVisibility,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';

const CHANNEL_ID = 'vidya_main';

export const setupNotifications = async () => {
  await notifee.requestPermission();
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Vidya',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    vibration: true,
  });
};

export const sendNudge = async (title: string, body: string) => {
  await setupNotifications();
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: {id: 'default'},
    },
  });
};

export const scheduleAlarm = async (
  id: string,
  title: string,
  body: string,
  timestamp: number,
) => {
  await setupNotifications();
  await notifee.createTriggerNotification(
    {
      id,
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: {id: 'default'},
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp,
    },
  );
};

export const scheduleDailyAlarm = async (
  id: string,
  title: string,
  body: string,
  hour: number,
  minute: number,
) => {
  await setupNotifications();
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() < Date.now()) {
    date.setDate(date.getDate() + 1);
  }

  await notifee.createTriggerNotification(
    {
      id,
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: {id: 'default'},
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    },
  );
};

export const cancelNotification = async (id: string) => {
  await notifee.cancelNotification(id);
};

export const cancelAllNotifications = async () => {
  await notifee.cancelAllNotifications();
};