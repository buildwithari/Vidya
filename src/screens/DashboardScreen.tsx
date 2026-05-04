import React, {useState, useEffect} from 'react';
import {VidyaStore} from '../storage';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

type Props = {
  checkIn: {energy: number; mood: number; sleep: number};
  store: VidyaStore;
  onOpenChat: () => void;
  onStartSession: () => void;
  onOpenNotifications: () => void;
  onOpenRecap: () => void;
  onReplan: () => void;
};

export default function DashboardScreen({checkIn, store, onOpenChat, onStartSession, onOpenNotifications, onOpenRecap, onReplan}: Props) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const energyColor =
    checkIn.energy >= 7
      ? '#1D6A3A'
      : checkIn.energy >= 5
      ? '#8C5A00'
      : '#8C1A00';

  const energyBg =
    checkIn.energy >= 7
      ? '#E8F5EE'
      : checkIn.energy >= 5
      ? '#FFF3EC'
      : '#FFECEC';

  const blocks = store.todaySchedule ?? [
    {time: '8:00 – 10:00', label: 'Deep study', sub: 'DSA — DP problems', type: 'study'},
    {time: '10:00 – 10:15', label: 'Coffee break', sub: 'Away from screen', type: 'break'},
    {time: '12:30 – 1:30', label: 'Lunch', sub: '1 hour window', type: 'life'},
    {time: '9:00 PM', label: 'Wind down', sub: 'Recap + sleep log', type: 'sleep'},
  ];
  console.log('Schedule blocks:', store.todaySchedule?.length, store.scheduleDate);

  const blockColor = (type: string) => {
    switch (type) {
      case 'study': return '#C1440E';
      case 'break': return '#BA7517';
      case 'life': return '#1D6A3A';
      case 'sleep': return '#888780';
      default: return '#888780';
    }
  };

  const blockBg = (type: string) => {
    switch (type) {
      case 'study': return '#FFF3EC';
      case 'break': return '#FAEEDA';
      case 'life': return '#E8F5EE';
      case 'sleep': return '#F1EFE8';
      default: return '#F1EFE8';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF8F3" />
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, Mithi.</Text>
            <Text style={styles.time}>{formatTime(currentTime)}</Text>
          </View>
          <View style={styles.headerBtns}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={onOpenNotifications}>
              <Text style={styles.bellBtnText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatBtn} onPress={onOpenChat}>
              <Text style={styles.chatBtnText}>🪔 Talk to Vidya</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
        <View style={styles.statCard}>
            <Text style={styles.statValue}>
            {Math.round((store.logs.find(l => l.date === new Date().toISOString().split('T')[0])?.studyMins ?? 0) / 60 * 10) / 10}
            </Text>
            <Text style={styles.statLabel}>Hours today</Text>
        </View>
        <View style={styles.statCard}>
            <Text style={styles.statValue}>{store.streak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
        </View>
        <View style={styles.statCard}>
            <Text style={styles.statValue}>
            {store.logs.find(l => l.date === new Date().toISOString().split('T')[0])?.problemsSolved ?? 0}
            </Text>
            <Text style={styles.statLabel}>Problems solved</Text>
        </View>
        </View>

        <TouchableOpacity style={styles.startSessionBtn} onPress={onStartSession}>
          <Text style={styles.startSessionText}>Start focus session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.replanBtn} onPress={onReplan}>
          <Text style={styles.replanBtnText}>📅 Replan my day</Text>
        </TouchableOpacity>

        <View style={styles.checkinCard}>
          <Text style={styles.checkinTitle}>Today's check-in</Text>
          <View style={styles.checkinRow}>
            <View style={[styles.checkinPill, {backgroundColor: energyBg}]}>
              <Text style={[styles.checkinPillText, {color: energyColor}]}>
                Energy {checkIn.energy}/10
              </Text>
            </View>
            <View style={[styles.checkinPill, {backgroundColor: energyBg}]}>
              <Text style={[styles.checkinPillText, {color: energyColor}]}>
                Mood {checkIn.mood}/10
              </Text>
            </View>
            <View style={[styles.checkinPill, {backgroundColor: '#F1EFE8'}]}>
              <Text style={[styles.checkinPillText, {color: '#5F5E5A'}]}>
                {checkIn.sleep}h sleep
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Today's schedule</Text>
          <View style={styles.timeline}>
            {blocks.map((block, i) => (
              <View key={i} style={styles.blockRow}>
                <View style={styles.blockLeft}>
                  <View
                    style={[
                      styles.blockDot,
                      {backgroundColor: blockColor(block.type)},
                    ]}
                  />
                  {i < blocks.length - 1 && (
                    <View style={styles.blockLine} />
                  )}
                </View>
                <View
                  style={[
                    styles.blockCard,
                    {backgroundColor: blockBg(block.type)},
                  ]}>
                  <Text style={styles.blockTime}>{block.time}</Text>
                  <Text style={[styles.blockLabel, {color: blockColor(block.type)}]}>
                    {block.label}
                  </Text>
                  <Text style={styles.blockSub}>{block.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.recapBtn}
          onPress={onOpenRecap}>
          <Text style={styles.recapBtnText}>🌙 End of day recap</Text>
        </TouchableOpacity>


        <View style={styles.legend}>
          {[
            {color: '#C1440E', label: 'Study'},
            {color: '#BA7517', label: 'Break'},
            {color: '#1D6A3A', label: 'Life'},
            {color: '#888780', label: 'Rest'},
          ].map(l => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: l.color}]} />
              <Text style={styles.legendLabel}>{l.label}</Text>
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
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
  },
  greeting: {fontSize: 18, fontWeight: '500', color: '#1A0F0A'},
  time: {fontSize: 13, color: '#A0724A', marginTop: 2},
  chatBtn: {
    backgroundColor: '#C1440E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chatBtnText: {fontSize: 13, fontWeight: '500', color: '#FDF8F3'},
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    padding: 12,
    alignItems: 'center',
  },
  statValue: {fontSize: 24, fontWeight: '500', color: '#C1440E'},
  statLabel: {fontSize: 11, color: '#A0724A', marginTop: 2, textAlign: 'center'},
  startSessionBtn: {
    backgroundColor: '#C1440E',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  startSessionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FDF8F3',
  },
  checkinCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    padding: 14,
    marginBottom: 20,
  },
  checkinTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A0724A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  checkinRow: {flexDirection: 'row', gap: 6, flexWrap: 'wrap'},
  checkinPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  checkinPillText: {fontSize: 12, fontWeight: '500'},
  section: {marginBottom: 16},
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A0724A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  timeline: {flexDirection: 'column'},
  blockRow: {flexDirection: 'row', gap: 10, marginBottom: 0},
  blockLeft: {alignItems: 'center', width: 16},
  blockDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 12,
    flexShrink: 0,
  },
  blockLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#E8D5C0',
    marginTop: 2,
  },
  blockCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  blockTime: {fontSize: 10, color: '#A0724A', marginBottom: 2},
  blockLabel: {fontSize: 13, fontWeight: '500', marginBottom: 1},
  blockSub: {fontSize: 11, color: '#A0724A'},
  legend: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginTop: 4,
  },
  headerBtns: {flexDirection: 'row', gap: 8, alignItems: 'center'},
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF3EC',
    borderWidth: 0.5,
    borderColor: '#F0A050',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replanBtn: {
    backgroundColor: '#FFF3EC',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#F0A050',
  },
  replanBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#C1440E',
  },
  recapBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
  },
  recapBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A0F0A',
  },
  bellBtnText: {fontSize: 16},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 5},
  legendDot: {width: 8, height: 8, borderRadius: 4},
  legendLabel: {fontSize: 11, color: '#A0724A'},
});