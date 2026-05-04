import React, {useState, useEffect, useRef} from 'react';
import CheckInScreen from './src/screens/CheckInScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ChatScreen from './src/screens/ChatScreen';
import TimerScreen from './src/screens/TimerScreen';
import {loadStore, saveCheckIn, logStudyMins, VidyaStore} from './src/storage';
import NotificationsScreen from './src/screens/NotificationsScreen';
import {hasUsagePermission, requestUsagePermission, startMonitoring} from './src/usageStats';
import {sendNudge, setupNotifications} from './src/notifications';
import RecapScreen from './src/screens/RecapScreen';
import {scheduleDailyAlarm} from './src/notifications';
import PlanningScreen from './src/screens/PlanningScreen';

type CheckInData = {
  energy: number;
  mood: number;
  sleep: number;
};

type Screen = 'checkin' | 'planning' | 'dashboard' | 'chat' | 'timer' | 'notifications' | 'recap';

export default function App() {
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [screen, setScreen] = useState<Screen>('checkin');
  const [store, setStore] = useState<VidyaStore | null>(null);
  const [initialised, setInitialised] = useState(false);

  const [sessionMins, setSessionMins] = useState(60);
  const [secsLeft, setSecsLeft] = useState(60 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const timerStartRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const init = async () => {
      const s = await loadStore();
      setStore(s);
      const today = new Date().toISOString().split('T')[0];
      const todayLog = s.logs.find(l => l.date === today);
      if (todayLog) {
        setCheckIn({
          energy: todayLog.energy,
          mood: todayLog.mood,
          sleep: todayLog.sleep,
        });
        if (s.scheduleDate === today && s.todaySchedule) {
          setScreen('dashboard');
        } else {
          setScreen('planning');
        }
      }
      setInitialised(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (checkIn) {
      const mins =
        checkIn.energy >= 7 ? 75 : checkIn.energy >= 5 ? 60 : 45;
      setSessionMins(mins);
      setSecsLeft(mins * 60);
    }
  }, [checkIn]);

  useEffect(() => {
    if (timerRunning && secsLeft > 0) {
      timerStartRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setSecsLeft(s => {
          if (s <= 1) {
            setTimerRunning(false);
            setTimerDone(true);
            if (timerStartRef.current) {
              const mins = Math.floor(
                (Date.now() - timerStartRef.current) / 60000,
              );
              logStudyMins(mins);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  useEffect(() => {
    if (!checkIn) return;
    const init = async () => {
      await setupNotifications();
      const hasPermission = await hasUsagePermission();
      if (!hasPermission) {
        requestUsagePermission();
        return;
      }
      startMonitoring();
    };
    init();
  }, [checkIn]);

  const handleCheckIn = async (data: CheckInData) => {
    setCheckIn(data);
    const updated = await saveCheckIn(data.energy, data.mood, data.sleep);
    setStore(updated);
    const today = new Date().toISOString().split('T')[0];
    if (updated.scheduleDate === today && updated.todaySchedule) {
      setScreen('dashboard');
    } else {
      setScreen('planning');
    }
  };

  if (!initialised) return null;

  if (screen === 'checkin' || !checkIn) {
    return <CheckInScreen onComplete={handleCheckIn} />;
  }

  if (screen === 'dashboard') {
    return (
      <DashboardScreen
        checkIn={checkIn}
        store={store!}
        onOpenChat={() => setScreen('chat')}
        onStartSession={() => setScreen('timer')}
        onOpenNotifications={() => setScreen('notifications')}
        onOpenRecap={() => setScreen('recap')}
        onReplan={() => setScreen('planning')}
      />
    );
  }

  if (screen === 'timer') {
    return (
      <TimerScreen
        checkIn={checkIn}
        sessionMins={sessionMins}
        secsLeft={secsLeft}
        timerRunning={timerRunning}
        timerDone={timerDone}
        onToggleTimer={() => setTimerRunning(r => !r)}
        onBack={() => setScreen('dashboard')}
        onOpenChat={() => setScreen('chat')}
        onProblemSolved={() => {
          loadStore().then(setStore);
        }}
      />
    );
  }

  if (screen === 'notifications') {
    return (
      <NotificationsScreen
        onBack={() => setScreen('dashboard')}
      />
    );
  }

  if (screen === 'recap') {
    return (
      <RecapScreen
        checkIn={checkIn}
        onBack={() => setScreen('dashboard')}
        onSleepLog={async (hour, minute) => {
          const wakeHour = hour + 7 < 24 ? hour + 7 : hour + 7 - 24;
          await scheduleDailyAlarm(
            'wake',
            'Vidya 🪔',
            'Time to get up. Your day starts now.',
            wakeHour,
            minute,
          );
        }}
      />
    );
  }

  if (screen === 'planning' && checkIn) {
    return (
      <PlanningScreen
        checkIn={checkIn}
        onBack={() => setScreen('dashboard')}
        onDone={async () => {
          const updated = await loadStore();
          setStore(updated);
          setScreen('dashboard');
        }}
      />
    );
  }

  return (
    <ChatScreen
      checkIn={checkIn}
      timerRunning={timerRunning}
      secsLeft={secsLeft}
      onBack={() => setScreen('dashboard')}
      onOpenTimer={() => setScreen('timer')}
    />
  );
}