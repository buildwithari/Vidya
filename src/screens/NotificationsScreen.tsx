import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import {
  scheduleDailyAlarm,
  cancelNotification,
  sendNudge,
} from '../notifications';

type Props = {
  onBack: () => void;
};

type Alarm = {
  id: string;
  label: string;
  time: string;
  message: string;
  enabled: boolean;
};

const DEFAULT_ALARMS: Alarm[] = [
  {
    id: 'wake',
    label: 'Wake up',
    time: '7:00 AM',
    message: 'Time to get up. Your day starts now.',
    enabled: false,
  },
  {
    id: 'study_morning',
    label: 'Morning study',
    time: '8:00 AM',
    message: 'Open LeetCode. No excuses.',
    enabled: false,
  },
  {
    id: 'lunch',
    label: 'Lunch break',
    time: '12:30 PM',
    message: 'Lunch. 1 hour. Back by 1:30.',
    enabled: false,
  },
  {
    id: 'study_afternoon',
    label: 'Afternoon study',
    time: '2:00 PM',
    message: 'Break is over. Back to work.',
    enabled: false,
  },
  {
    id: 'dinner',
    label: 'Dinner',
    time: '6:30 PM',
    message: 'Dinner. 1 hour. Then one more session.',
    enabled: false,
  },
  {
    id: 'wind_down',
    label: 'Wind down',
    time: '9:00 PM',
    message: 'Close the laptop. Log your sleep. I\'ll set tomorrow\'s alarm.',
    enabled: false,
  },
];

const parseTime = (time: string): {hour: number; minute: number} => {
  const [timePart, period] = time.split(' ');
  const [h, m] = timePart.split(':').map(Number);
  const hour =
    period === 'PM' && h !== 12
      ? h + 12
      : period === 'AM' && h === 12
      ? 0
      : h;
  return {hour, minute: m};
};

export default function NotificationsScreen({onBack}: Props) {
  const [alarms, setAlarms] = useState<Alarm[]>(DEFAULT_ALARMS);
  const [testSent, setTestSent] = useState(false);

  const toggleAlarm = async (id: string, value: boolean) => {
    const alarm = alarms.find(a => a.id === id);
    if (!alarm) return;

    if (value) {
      const {hour, minute} = parseTime(alarm.time);
      await scheduleDailyAlarm(id, 'Vidya 🪔', alarm.message, hour, minute);
    } else {
      await cancelNotification(id);
    }

    setAlarms(prev =>
      prev.map(a => (a.id === id ? {...a, enabled: value} : a)),
    );
  };

  const sendTest = async () => {
    await sendNudge('Vidya 🪔', 'This is what my notifications look like. You\'ll be seeing more of these.');
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF8F3" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Icon name="chevron-back" size={28} color="#C1440E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vidya's Alarms</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            Turn these on and Vidya will run your day. She fires at these times every day — no exceptions.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.testBtn, testSent && styles.testBtnSent]}
          onPress={sendTest}>
          <Text style={styles.testBtnText}>
            {testSent ? '✓ Sent — check your notifications' : 'Send a test notification'}
          </Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Daily alarms</Text>
          {alarms.map(alarm => (
            <View key={alarm.id} style={styles.alarmRow}>
              <View style={styles.alarmLeft}>
                <Text style={styles.alarmTime}>{alarm.time}</Text>
                <Text style={styles.alarmLabel}>{alarm.label}</Text>
                <Text style={styles.alarmMsg}>{alarm.message}</Text>
              </View>
              <Switch
                value={alarm.enabled}
                onValueChange={v => toggleAlarm(alarm.id, v)}
                trackColor={{false: '#E8D5C0', true: '#F0A050'}}
                thumbColor={alarm.enabled ? '#C1440E' : '#FDF8F3'}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FDF8F3'},
  scroll: {padding: 16, paddingBottom: 40},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E8D5C0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
    },
  backBtnText: {fontSize: 13, color: '#C1440E', fontWeight: '500'},
  headerTitle: {fontSize: 15, fontWeight: '500', color: '#1A0F0A'},
  introCard: {
    backgroundColor: '#FFF3EC',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#F0A050',
    padding: 14,
    marginBottom: 12,
  },
  introText: {fontSize: 13, color: '#1A0F0A', lineHeight: 20},
  testBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  testBtnSent: {
    borderColor: '#1D6A3A',
    backgroundColor: '#E8F5EE',
  },
  testBtnText: {fontSize: 13, fontWeight: '500', color: '#C1440E'},
  section: {marginBottom: 16},
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A0724A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    padding: 14,
    marginBottom: 8,
  },
  alarmLeft: {flex: 1},
  alarmTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#C1440E',
    marginBottom: 2,
  },
  alarmLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A0F0A',
    marginBottom: 3,
  },
  alarmMsg: {fontSize: 12, color: '#A0724A', lineHeight: 16},
});