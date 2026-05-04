import React, {useState, useEffect} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {loadStore, VidyaStore} from '../storage';
import {ANTHROPIC_API_KEY} from '../config';

type Props = {
  checkIn: {energy: number; mood: number; sleep: number};
  onBack: () => void;
  onSleepLog: (hour: number, minute: number) => void;
};

export default function RecapScreen({checkIn, onBack, onSleepLog}: Props) {
  const [recap, setRecap] = useState('');
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<VidyaStore | null>(null);
  const [sleepLogged, setSleepLogged] = useState(false);

  useEffect(() => {
    const init = async () => {
      const s = await loadStore();
      setStore(s);
      await generateRecap(s);
    };
    init();
  }, []);

  const generateRecap = async (s: VidyaStore) => {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = s.logs.find(l => l.date === today);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          system: `You are Vidya, a strict but caring coach. Give Mithi her nightly recap. Be brief, specific, direct. Acknowledge what she did well without over-praising. Note what needs to improve. End with one sentence that makes her want to do better tomorrow. Never be generic. Max 4 sentences.`,
          messages: [
            {
              role: 'user',
              content: `Today's data: ${todayLog?.studyMins ?? 0} mins studied, ${todayLog?.problemsSolved ?? 0} problems solved, energy was ${checkIn.energy}/10, mood ${checkIn.mood}/10, ${checkIn.sleep} hours sleep last night. Current streak: ${s.streak} days. Give me my nightly recap.`,
            },
          ],
        }),
      });
      const data = await response.json();
      setRecap(data.content?.[0]?.text ?? "Day's done. Show up tomorrow.");
    } catch {
      setRecap("Day's done. Show up tomorrow.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayLog = store?.logs.find(l => l.date === today);

  const sleepOptions = [
    {label: '9:30 PM', hour: 21, minute: 30},
    {label: '10:00 PM', hour: 22, minute: 0},
    {label: '10:30 PM', hour: 22, minute: 30},
    {label: '11:00 PM', hour: 23, minute: 0},
    {label: '11:30 PM', hour: 23, minute: 30},
    {label: '12:00 AM', hour: 0, minute: 0},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF8F3" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Icon name="chevron-back" size={28} color="#C1440E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>End of Day</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🪔</Text>
          </View>
          <Text style={styles.vidyaLabel}>Vidya</Text>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#C1440E" />
            <Text style={styles.loadingText}>Vidya is reviewing your day...</Text>
          </View>
        ) : (
          <View style={styles.recapCard}>
            <Text style={styles.recapText}>{recap}</Text>
          </View>
        )}

        {store && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {Math.round(((todayLog?.studyMins ?? 0) / 60) * 10) / 10}
              </Text>
              <Text style={styles.statLabel}>Hours studied</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {todayLog?.problemsSolved ?? 0}
              </Text>
              <Text style={styles.statLabel}>Problems solved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{store.streak}</Text>
              <Text style={styles.statLabel}>Day streak</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What time are you sleeping?</Text>
          <Text style={styles.sectionSub}>
            Vidya will set tomorrow's alarm based on this.
          </Text>
          {sleepLogged ? (
            <View style={styles.sleepConfirm}>
              <Text style={styles.sleepConfirmText}>
                ✓ Alarm set. Sleep well. Tomorrow starts early.
              </Text>
            </View>
          ) : (
            <View style={styles.sleepGrid}>
              {sleepOptions.map(opt => (
                <TouchableOpacity
                  key={opt.label}
                  style={styles.sleepBtn}
                  onPress={() => {
                    setSleepLogged(true);
                    onSleepLog(opt.hour, opt.minute);
                  }}>
                  <Text style={styles.sleepBtnText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  avatarWrap: {alignItems: 'center', marginTop: 24, marginBottom: 20},
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF3EC',
    borderWidth: 0.5,
    borderColor: '#F0A050',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {fontSize: 24},
  vidyaLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#C1440E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingWrap: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  loadingText: {fontSize: 13, color: '#A0724A'},
  recapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    padding: 20,
    marginBottom: 16,
  },
  recapText: {
    fontSize: 15,
    color: '#1A0F0A',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
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
  statValue: {fontSize: 22, fontWeight: '500', color: '#C1440E'},
  statLabel: {
    fontSize: 10,
    color: '#A0724A',
    marginTop: 2,
    textAlign: 'center',
  },
  section: {marginBottom: 16},
  sectionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A0F0A',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: '#A0724A',
    marginBottom: 14,
  },
  sleepGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sleepBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    backgroundColor: '#FFFFFF',
  },
  sleepBtnText: {fontSize: 13, color: '#1A0F0A', fontWeight: '500'},
  sleepConfirm: {
    backgroundColor: '#E8F5EE',
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#1D6A3A',
  },
  sleepConfirmText: {fontSize: 13, color: '#1D6A3A', fontWeight: '500'},
});