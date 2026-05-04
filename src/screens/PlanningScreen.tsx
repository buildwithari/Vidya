import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {saveSchedule, ScheduleBlock} from '../storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {ANTHROPIC_API_KEY} from '../config';

type Props = {
  checkIn: {energy: number; mood: number; sleep: number};
  onDone: () => void;
  onBack: () => void;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const PLANNING_SYSTEM = `You are Vidya, a strict life coach. You are building Mithi's schedule for today.

Your job right now:
1. Ask her ONE question at a time — do not ask multiple questions at once
2. Find out: any fixed commitments today (appointments, calls, errands), what time she wants to start studying, anything else affecting her day
3. You MUST ask at least 2 questions before generating the schedule. Never generate after just one user message.
4. Only generate the schedule after you have confirmed: (a) any fixed commitments, (b) preferred start time or availability
5. When you have enough info, say exactly this and nothing else: SCHEDULE_READY`;

export default function PlanningScreen({checkIn, onDone, onBack}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Energy ${checkIn.energy}/10, sleep ${checkIn.sleep} hours. Before I build your schedule — any fixed commitments today? Appointments, calls, anything blocking your time?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const buildSchedule = async (convo: Message[]) => {
    try {
      const summary = convo
        .map(m => `${m.role === 'user' ? 'Mithi' : 'Vidya'}: ${m.content}`)
        .join('\n');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are Vidya. Based on the planning conversation below, generate a daily schedule as a JSON array.

Rules:
- type must be exactly one of: study, break, life, sleep
- Cover from when she can start until 10-11pm
- Respect ALL commitments she mentioned — block those times out completely
- DSA is always the priority for free time
- Be specific in sub field — name exact DSA topics (e.g. "DP — climbing stairs, coin change")
- Include meals, exercise, breaks, wind down
- Energy ${checkIn.energy}/10 — adjust block lengths accordingly (high energy = longer blocks)
- Return ONLY a valid JSON array, no other text, no backticks, no explanation

Example:
[{"time":"6:00 – 8:00","label":"Deep study","sub":"DSA — dynamic programming","type":"study"},{"time":"8:00 – 9:00","label":"Dinner","sub":"1 hour window","type":"life"}]`,
          messages: [
            {
              role: 'user',
              content: `Planning conversation:\n${summary}\n\nGenerate the schedule JSON now.`,
            },
          ],
        }),
      });

      const data = await response.json();
      const raw = data.content?.[0]?.text ?? '[]';
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const blocks: ScheduleBlock[] = JSON.parse(clean);
      await saveSchedule(blocks);
      onDone();
    } catch (e) {
      console.log('Build schedule error:', e);
      onDone();
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

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
          system: PLANNING_SYSTEM,
          messages: updated.map(m => ({role: m.role, content: m.content})),
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text ?? '';

      if (reply.includes('SCHEDULE_READY')) {
        setLoading(false);
        setBuilding(true);
        await buildSchedule(updated);
        return;
      }

      setMessages(prev => [
        ...prev,
        {id: (Date.now() + 1).toString(), role: 'assistant', content: reply},
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Something went wrong. Let's just get started.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (building) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.buildingWrap}>
          <Text style={styles.avatarEmoji}>🪔</Text>
          <ActivityIndicator size="large" color="#C1440E" style={{marginTop: 16}} />
          <Text style={styles.buildingText}>Vidya is building your schedule...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF8F3" />
      <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
    <Icon name="chevron-back" size={28} color="#C1440E" />
    </TouchableOpacity>
    <View style={styles.avatar}>
        <Text style={styles.avatarText}>🪔</Text>
    </View>
    <View>
        <Text style={styles.headerName}>Vidya</Text>
        <Text style={styles.headerSub}>Planning your day</Text>
    </View>
    </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({animated: true})
        }>
        {messages.map(m => {
          const isVidya = m.role === 'assistant';
          return (
            <View
              key={m.id}
              style={[
                styles.bubble,
                isVidya ? styles.vidyaBubble : styles.userBubble,
              ]}>
              {isVidya && <Text style={styles.vidyaLabel}>Vidya</Text>}
              <Text style={isVidya ? styles.vidyaText : styles.userText}>
                {m.content}
              </Text>
            </View>
          );
        })}
        {loading && (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color="#C1440E" />
            <Text style={styles.typingText}>Vidya is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Tell Vidya..."
          placeholderTextColor="#C4A882"
          multiline
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={loading}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FDF8F3'},
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF3EC',
    borderWidth: 0.5,
    borderColor: '#F0A050',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {fontSize: 16},
  headerName: {fontSize: 14, fontWeight: '500', color: '#1A0F0A'},
  headerSub: {fontSize: 11, color: '#C1440E'},
  messages: {padding: 16, gap: 10, paddingBottom: 8},
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  vidyaBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#C1440E',
    borderBottomRightRadius: 4,
  },
  vidyaLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#C1440E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  vidyaText: {fontSize: 14, color: '#1A0F0A', lineHeight: 20},
  userText: {fontSize: 14, color: '#FDF8F3', lineHeight: 20},
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  typingText: {fontSize: 12, color: '#A0724A'},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#E8D5C0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#FDF8F3',
    borderWidth: 0.5,
    borderColor: '#E8D5C0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A0F0A',
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#C1440E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendBtnDisabled: {backgroundColor: '#E8D5C0'},
  sendBtnText: {fontSize: 14, fontWeight: '500', color: '#FDF8F3'},
  buildingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {fontSize: 40},
  buildingText: {
    fontSize: 15,
    color: '#A0724A',
    marginTop: 16,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
    },
    backBtnText: {fontSize: 13, color: '#C1440E', fontWeight: '500'},
});