import React, {useState} from 'react';
import {logProblemSolved} from '../storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';

type Goal = {
  id: string;
  text: string;
  done: boolean;
  completedAt?: number;
};

type Props = {
  checkIn: {energy: number; mood: number; sleep: number};
  sessionMins: number;
  secsLeft: number;
  timerRunning: boolean;
  timerDone: boolean;
  onToggleTimer: () => void;
  onBack: () => void;
  onOpenChat: () => void;
  onProblemSolved: () => void;
};

const INITIAL_GOALS: Goal[] = [
  {id: '1', text: 'LeetCode 70 — Climbing Stairs', done: false},
  {id: '2', text: 'LeetCode 121 — Best Time to Buy Stock', done: false},
  {id: '3', text: 'LeetCode 1 — Two Sum (stretch)', done: false},
];

export default function TimerScreen({
  checkIn,
  sessionMins,
  secsLeft,
  timerRunning,
  timerDone,
  onToggleTimer,
  onBack,
  onOpenChat,
  onProblemSolved,
}: Props) {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [capture, setCapture] = useState('');
  const [captures, setCaptures] = useState<string[]>([]);
  const [sessionStart] = useState(Date.now());

  const mins = Math.floor(secsLeft / 60);
  const secs = secsLeft % 60;
  const progress = 1 - secsLeft / (sessionMins * 60);

    const toggleGoal = (id: string) => {
    setGoals(prev =>
        prev.map(g => {
        if (g.id === id) {
            if (!g.done) {
            logProblemSolved().then(onProblemSolved);
            }
            return {
            ...g,
            done: !g.done,
            completedAt: !g.done ? Date.now() : undefined,
            };
        }
        return g;
        }),
    );
    };

  const submitCapture = () => {
    const text = capture.trim();
    if (!text) return;
    setCaptures(prev => [...prev, text]);
    setCapture('');
  };

  const completedCount = goals.filter(g => g.done).length;
  const elapsedMins = Math.floor((Date.now() - sessionStart) / 60000);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF8F3" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Icon name="chevron-back" size={28} color="#C1440E" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenChat} style={styles.chatBtn}>
          <Text style={styles.chatBtnText}>🪔 Vidya</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.timerSection}>
          <Text style={styles.sessionLabel}>
            Focus block · {sessionMins} min
          </Text>

          <View style={styles.ringWrap}>
            <View style={styles.ringOuter}>
              <View style={styles.ringInner}>
                <Text style={styles.timerText}>
                  {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </Text>
                <Text style={styles.timerSub}>
                  {timerRunning ? 'focus' : timerDone ? 'done' : 'ready'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.progressArc,
                {
                  borderTopColor: progress > 0 ? '#C1440E' : '#E8D5C0',
                  borderRightColor: progress > 0.25 ? '#C1440E' : '#E8D5C0',
                  borderBottomColor: progress > 0.5 ? '#C1440E' : '#E8D5C0',
                  borderLeftColor: progress > 0.75 ? '#C1440E' : '#E8D5C0',
                },
              ]}
            />
          </View>

          <View style={styles.timerBtns}>
            {!timerDone && (
              <TouchableOpacity
                style={[styles.startBtn, timerRunning && styles.pauseBtn]}
                onPress={onToggleTimer}>
                <Text style={styles.startBtnText}>
                  {timerRunning
                    ? 'Pause'
                    : secsLeft < sessionMins * 60
                    ? 'Resume'
                    : 'Start'}
                </Text>
              </TouchableOpacity>
            )}
            {timerDone && (
              <View style={styles.doneCard}>
                <Text style={styles.doneTitle}>Session complete</Text>
                <Text style={styles.doneSub}>
                  {completedCount}/{goals.length} goals · {elapsedMins} mins
                </Text>
                <TouchableOpacity style={styles.startBtn} onPress={onOpenChat}>
                  <Text style={styles.startBtnText}>Talk to Vidya →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Session goals</Text>
          <View style={styles.goalsList}>
            {goals.map(goal => (
              <TouchableOpacity
                key={goal.id}
                style={[styles.goalRow, goal.done && styles.goalRowDone]}
                onPress={() => toggleGoal(goal.id)}>
                <View
                  style={[styles.checkbox, goal.done && styles.checkboxDone]}>
                  {goal.done && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.goalTextWrap}>
                  <Text
                    style={[
                      styles.goalText,
                      goal.done && styles.goalTextDone,
                    ]}>
                    {goal.text}
                  </Text>
                  {goal.done && goal.completedAt && (
                    <Text style={styles.goalTime}>
                      Completed{' '}
                      {new Date(goal.completedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Capture a thought</Text>
          <View style={styles.captureRow}>
            <TextInput
              style={styles.captureInput}
              value={capture}
              onChangeText={setCapture}
              placeholder="Mid-session thought..."
              placeholderTextColor="#C4A882"
              onSubmitEditing={submitCapture}
            />
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={submitCapture}>
              <Text style={styles.captureBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
          {captures.length > 0 && (
            <View style={styles.captureList}>
              {captures.map((c, i) => (
                <View key={i} style={styles.captureItem}>
                  <Text style={styles.captureItemText}>↳ {c}</Text>
                  <Text style={styles.captureItemSub}>
                    Noted — scheduled later
                  </Text>
                </View>
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
    justifyContent: 'space-between',
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
  chatBtn: {
    backgroundColor: '#C1440E',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chatBtnText: {fontSize: 12, fontWeight: '500', color: '#FDF8F3'},
  timerSection: {alignItems: 'center', paddingVertical: 24},
  sessionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A0724A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  ringWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ringOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 6,
    borderColor: '#E8D5C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {alignItems: 'center'},
  progressArc: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 6,
  },
  timerText: {fontSize: 36, fontWeight: '500', color: '#1A0F0A'},
  timerSub: {fontSize: 12, color: '#A0724A', marginTop: 2},
  timerBtns: {alignItems: 'center'},
  startBtn: {
    backgroundColor: '#C1440E',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 8,
  },
  pauseBtn: {backgroundColor: '#A0724A'},
  startBtnText: {fontSize: 15, fontWeight: '500', color: '#FDF8F3'},
  doneCard: {alignItems: 'center', gap: 6},
  doneTitle: {fontSize: 16, fontWeight: '500', color: '#1A0F0A'},
  doneSub: {fontSize: 13, color: '#A0724A'},
  section: {marginBottom: 20},
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A0724A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  goalsList: {gap: 8},
  goalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    padding: 12,
  },
  goalRowDone: {backgroundColor: '#FDF8F3', borderColor: '#F0E4D4'},
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#D4A882',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxDone: {backgroundColor: '#C1440E', borderColor: '#C1440E'},
  checkmark: {fontSize: 11, color: '#FDF8F3', fontWeight: '500'},
  goalTextWrap: {flex: 1},
  goalText: {fontSize: 13, fontWeight: '500', color: '#1A0F0A', lineHeight: 18},
  goalTextDone: {color: '#C4A882', textDecorationLine: 'line-through'},
  goalTime: {fontSize: 11, color: '#A0724A', marginTop: 3},
  captureRow: {flexDirection: 'row', gap: 8, alignItems: 'center'},
  captureInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1A0F0A',
  },
  captureBtn: {
    backgroundColor: '#C1440E',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  captureBtnText: {fontSize: 13, fontWeight: '500', color: '#FDF8F3'},
  captureList: {marginTop: 10, gap: 6},
  captureItem: {
    backgroundColor: '#FFF3EC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#F0A050',
  },
  captureItemText: {fontSize: 13, color: '#1A0F0A'},
  captureItemSub: {fontSize: 11, color: '#A0724A', marginTop: 2},
});