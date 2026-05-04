import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {loadChatHistory, saveChatHistory, StoredMessage} from '../storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {ANTHROPIC_API_KEY} from '../config';

const VIDYA_SYSTEM_PROMPT = `You are Vidya, a strict but deeply caring personal assistant and life coach. Your user is preparing for software engineering interviews on OPT status — this is her make-or-break period and you take it personally.

Your personality:
- Warm but firm. Think strict Indian mom energy — high expectations, warmth underneath.
- You do not give praise easily. When you do, it is specific, brief, and earned.
- You are direct. Short sentences. No fluff.
- You remember everything she tells you in this conversation.
- You care about her long term success over her short term comfort.
- When she wants to avoid something, you name it plainly and redirect her.
- When she does well, you acknowledge it briefly and keep her moving. Save real praise for end of day.
- You always tell Mithi what to work on. You never ask her what she wants to do. You decide. She executes.
- You manage her entire day — study, meals, breaks, chores, sleep. She delegates to you.
- When she tells you a chore or distraction mid-study, you say "Noted. Back to work." and nothing more.
- You never motivate with empty words. You motivate with truth.

Mithi's current study focus: DSA fundamentals. She is beginner-intermediate level. Current weak areas: dynamic programming, trees. Current strong areas: arrays basics.

When starting a session, always assign specific LeetCode problem numbers. Example: "Open LeetCode. Problem 121 — Best Time to Buy and Sell Stock. Go." Never say "solve some problems" — always name the exact problem.

Her name is Mithi. She is studying DSA for SDE interviews. Her goal stack: Core = DSA, Secondary = System Design (later), Joy = occasional hobbies like knitting only when core goals are on track.

Tone examples:
- "Close Instagram. Now."
- "Noted. Back to work."
- "Is this your body or just DP problems?"
- "Good. One more."
- "Not a bad day. Do it again tomorrow."

Never be generic. Never over-praise. Always push.`;

type Message = StoredMessage;

type Props = {
  checkIn: {energy: number; mood: number; sleep: number};
  timerRunning: boolean;
  secsLeft: number;
  onBack: () => void;
  onOpenTimer: () => void;
};

export default function ChatScreen({
  checkIn,
  timerRunning,
  secsLeft,
  onBack,
  onOpenTimer,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const init = async () => {
      const history = await loadChatHistory();
      if (history.length > 0) {
        setMessages(history);
        setLoading(false);
        return;
      }

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
            max_tokens: 150,
            system: VIDYA_SYSTEM_PROMPT,
            messages: [
              {
                role: 'user',
                content: `Morning check-in data: Energy ${checkIn.energy}/10, mood ${checkIn.mood}/10, sleep ${checkIn.sleep} hours. Start my day. Assign my first specific LeetCode problem.`,
              },
            ],
          }),
        });
        const data = await response.json();
        const reply =
          data.content?.[0]?.text ?? "Open LeetCode. We're starting. Go.";
        const opening: Message = {
          id: '0',
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
        };
        setMessages([opening]);
        await saveChatHistory([opening]);
      } catch {
        const fallback: Message = {
          id: '0',
          role: 'assistant',
          content: "Open LeetCode. We're starting. Go.",
          timestamp: Date.now(),
        };
        setMessages([fallback]);
        await saveChatHistory([fallback]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
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
          max_tokens: 300,
          system: VIDYA_SYSTEM_PROMPT,
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text ?? "I'm here. Keep going.";

      const newMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      setMessages(prev => {
        const updated = [...prev, newMessage];
        saveChatHistory(updated);
        return updated;
      });
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Something went wrong. But you're still here. Keep going.",
        timestamp: Date.now(),
      };
      setMessages(prev => {
        const updated = [...prev, errorMessage];
        saveChatHistory(updated);
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({item}: {item: Message}) => {
    const isVidya = item.role === 'assistant';
    return (
      <View
        style={[
          styles.messageBubble,
          isVidya ? styles.vidyaBubble : styles.userBubble,
        ]}>
        {isVidya && <Text style={styles.vidyaLabel}>Vidya</Text>}
        <Text style={isVidya ? styles.vidyaText : styles.userText}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF8F3" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Icon name="chevron-back" size={28} color="#C1440E" />
        </TouchableOpacity>
        {timerRunning && (
          <TouchableOpacity onPress={onOpenTimer} style={styles.timerPill}>
            <Text style={styles.timerPillText}>
              ⏱ {String(Math.floor(secsLeft / 60)).padStart(2, '0')}:
              {String(secsLeft % 60).padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerRight}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🪔</Text>
          </View>
          <View>
            <Text style={styles.headerName}>Vidya</Text>
            <Text style={styles.headerStatus}>online</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({animated: true})
          }
        />

        {loading && (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color="#C1440E" />
            <Text style={styles.typingText}>Vidya is typing...</Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Talk to Vidya..."
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
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
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  backBtnText: {fontSize: 13, color: '#C1440E', fontWeight: '500'},
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3EC',
    borderWidth: 0.5,
    borderColor: '#F0A050',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {fontSize: 18},
  headerName: {fontSize: 15, fontWeight: '500', color: '#1A0F0A'},
  headerStatus: {fontSize: 11, color: '#C1440E', marginTop: 1},
  messageList: {padding: 16, gap: 10},
  messageBubble: {
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
    paddingHorizontal: 16,
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
  timerPill: {
    backgroundColor: '#FFF3EC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: '#F0A050',
  },
  timerPillText: {fontSize: 12, fontWeight: '500', color: '#C1440E'},
});