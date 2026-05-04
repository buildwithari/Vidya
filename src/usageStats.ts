import {NativeModules} from 'react-native';
const {VidyaMonitor} = NativeModules;

export const startMonitoring = (): void => {
  VidyaMonitor.startMonitoring();
};

export const stopMonitoring = (): void => {
  VidyaMonitor.stopMonitoring();
};

const {UsageStats} = NativeModules;

export const hasUsagePermission = (): Promise<boolean> => {
  return UsageStats.hasPermission();
};

export const requestUsagePermission = (): void => {
  UsageStats.requestPermission();
};

export const getForegroundApp = (): Promise<string | null> => {
  return UsageStats.getForegroundApp();
};

export const getUsageStats = (): Promise<
  Array<{packageName: string; totalMins: number}>
> => {
  return UsageStats.getUsageStats();
};

export const DISTRACTION_APPS: Record<string, string> = {
  'com.instagram.android': 'Instagram',
  'com.facebook.katana': 'Facebook',
  'com.google.android.youtube': 'YouTube',
  'com.zhiliaoapp.musically': 'TikTok',
  'com.twitter.android': 'Twitter/X',
  'com.snapchat.android': 'Snapchat',
};