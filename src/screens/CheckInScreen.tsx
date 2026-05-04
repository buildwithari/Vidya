import React, {useState} from 'react';
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
  onComplete: (data: {energy: number; mood: number; sleep: number}) => void;
};

export default function CheckInScreen({onComplete}: Props) {
  const [energy, setEnergy] = useState(0);
  const [mood, setMood] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [step, setStep] = useState(0);

  const allDone = energy > 0 && mood > 0 && sleep > 0;

  const ScaleRow = ({
    value,
    onSelect,
    low,
    high,
  }: {
    value: number;
    onSelect: (n: number) => void;
    low: string;
    high: string;
  }) => (
    <View>
      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <TouchableOpacity
            key={n}
            style={[styles.scaleBtn, value === n && styles.scaleBtnActive]}
            onPress={() => onSelect(n)}>
            <Text
              style={[
                styles.scaleBtnText,
                value === n && styles.scaleBtnTextActive,
              ]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabel}>{low}</Text>
        <Text style={styles.scaleLabel}>{high}</Text>
      </View>
    </View>
  );

  const SleepRow = ({
    value,
    onSelect,
  }: {
    value: number;
    onSelect: (n: number) => void;
  }) => (
    <View style={styles.sleepRow}>
      {[4, 5, 6, 7, 8, 9].map(n => (
        <TouchableOpacity
          key={n}
          style={[styles.sleepBtn, value === n && styles.scaleBtnActive]}
          onPress={() => onSelect(n)}>
          <Text
            style={[
              styles.sleepBtnText,
              value === n && styles.scaleBtnTextActive,
            ]}>
            {n}h
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF8F3" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🪔</Text>
          </View>
          <Text style={styles.greeting}>{greeting()}, Mithi.</Text>
          <Text style={styles.subGreeting}>
            Tell me where you are and I'll take it from here.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.questionLabel}>01</Text>
          <Text style={styles.question}>Energy level</Text>
          <Text style={styles.questionSub}>How much fuel do you have right now?</Text>
          <ScaleRow
            value={energy}
            onSelect={n => {setEnergy(n); if(step < 1) setStep(1);}}
            low="running on empty"
            high="fully charged"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.questionLabel}>02</Text>
          <Text style={styles.question}>Mood</Text>
          <Text style={styles.questionSub}>How are you actually feeling?</Text>
          <ScaleRow
            value={mood}
            onSelect={n => {setMood(n); if(step < 2) setStep(2);}}
            low="struggling"
            high="sharp & focused"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.questionLabel}>03</Text>
          <Text style={styles.question}>Sleep last night</Text>
          <Text style={styles.questionSub}>Approximately how many hours?</Text>
          <SleepRow
            value={sleep}
            onSelect={n => {setSleep(n); if(step < 3) setStep(3);}}
          />
        </View>

        {allDone && (
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => onComplete({energy, mood, sleep})}>
            <Text style={styles.submitText}>Vidya, take it from here</Text>
          </TouchableOpacity>
        )}

        {!allDone && (
          <View style={styles.submitBtnDisabled}>
            <Text style={styles.submitTextDisabled}>
              Answer all three to continue
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FDF8F3'},
  scroll: {padding: 20, paddingBottom: 40},
  header: {alignItems: 'center', marginBottom: 28, marginTop: 8},
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF3EC',
    borderWidth: 0.5,
    borderColor: '#F0A050',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {fontSize: 24},
  greeting: {
    fontSize: 22,
    fontWeight: '500',
    color: '#1A0F0A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subGreeting: {
    fontSize: 14,
    color: '#A0724A',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    padding: 18,
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#C1440E',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  question: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1A0F0A',
    marginBottom: 4,
  },
  questionSub: {
    fontSize: 13,
    color: '#A0724A',
    marginBottom: 16,
  },
  scaleRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  scaleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    backgroundColor: '#FDF8F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleBtnActive: {
    backgroundColor: '#C1440E',
    borderColor: '#C1440E',
  },
  scaleBtnText: {
    fontSize: 12,
    color: '#A0724A',
    fontWeight: '500',
  },
  scaleBtnTextActive: {
    color: '#FDF8F3',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleLabel: {
    fontSize: 10,
    color: '#C4A882',
  },
  sleepRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sleepBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    backgroundColor: '#FDF8F3',
  },
  sleepBtnText: {
    fontSize: 13,
    color: '#A0724A',
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#C1440E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FDF8F3',
  },
  submitBtnDisabled: {
    backgroundColor: '#F0E4D4',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitTextDisabled: {
    fontSize: 15,
    color: '#C4A882',
  },
});