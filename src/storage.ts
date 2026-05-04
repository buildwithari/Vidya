import AsyncStorage from '@react-native-async-storage/async-storage';

export type DayLog = {
  date: string;
  energy: number;
  mood: number;
  sleep: number;
  problemsSolved: number;
  studyMins: number;
};

export type ScheduleBlock = {
  time: string;
  label: string;
  sub: string;
  type: 'study' | 'break' | 'life' | 'sleep';
};

export type VidyaStore = {
  streak: number;
  lastActiveDate: string;
  totalProblems: number;
  totalStudyMins: number;
  logs: DayLog[];
  todaySchedule?: ScheduleBlock[];
  scheduleDate?: string;
};

const KEY = 'vidya_store';

const today = () => new Date().toISOString().split('T')[0];

export const loadStore = async (): Promise<VidyaStore> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    streak: 0,
    lastActiveDate: '',
    totalProblems: 0,
    totalStudyMins: 0,
    logs: [],
  };
};

export const saveCheckIn = async (
  energy: number,
  mood: number,
  sleep: number,
): Promise<VidyaStore> => {
  const store = await loadStore();
  const t = today();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];

  const newStreak =
    store.lastActiveDate === yStr || store.lastActiveDate === t
      ? store.lastActiveDate === t
        ? store.streak
        : store.streak + 1
      : 1;

  const existingLog = store.logs.find(l => l.date === t);
  const updatedLogs = existingLog
    ? store.logs.map(l =>
        l.date === t ? {...l, energy, mood, sleep} : l,
      )
    : [...store.logs, {date: t, energy, mood, sleep, problemsSolved: 0, studyMins: 0}];

  const updated: VidyaStore = {
    ...store,
    streak: newStreak,
    lastActiveDate: t,
    logs: updatedLogs,
  };

  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
};

export const logProblemSolved = async (): Promise<void> => {
  const store = await loadStore();
  const t = today();
  const updated = {
    ...store,
    totalProblems: store.totalProblems + 1,
    logs: store.logs.map(l =>
      l.date === t
        ? {...l, problemsSolved: l.problemsSolved + 1}
        : l,
    ),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
};

export const logStudyMins = async (mins: number): Promise<void> => {
  const store = await loadStore();
  const t = today();
  const updated = {
    ...store,
    totalStudyMins: store.totalStudyMins + mins,
    logs: store.logs.map(l =>
      l.date === t
        ? {...l, studyMins: l.studyMins + mins}
        : l,
    ),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
};

export type StoredMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

const CHAT_KEY = 'vidya_chat';

export const loadChatHistory = async (): Promise<StoredMessage[]> => {
  try {
    const raw = await AsyncStorage.getItem(CHAT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

export const saveChatHistory = async (messages: StoredMessage[]): Promise<void> => {
  try {
    const last100 = messages.slice(-100);
    await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(last100));
  } catch {}
};

export const clearChatHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CHAT_KEY);
  } catch {}
};

export const saveSchedule = async (blocks: ScheduleBlock[]): Promise<void> => {
  const store = await loadStore();
  const updated = {
    ...store,
    todaySchedule: blocks,
    scheduleDate: today(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
};