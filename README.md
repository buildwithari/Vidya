# Vidya 🪔
### Your AI Life Coach. You focus — she thinks.

Vidya is a personal Android app built for one person on a mission. She runs your entire day — study sessions, meals, breaks, chores, sleep — so you never have to decide what to do next. You just execute.

Built for: **Mithi**, preparing for SDE interviews on OPT.

---

## What Vidya Does

### 🌅 Morning Check-In
Every morning Vidya asks three questions: energy, mood, sleep. She uses your answers to calibrate the entire day — how long your study blocks are, how hard she pushes you, when to give you a break.

### 📅 Daily Planning
After check-in, Vidya asks about your commitments for the day — appointments, calls, errands. She builds a personalized schedule around them. DSA is always the priority. Everything else fits around it.

### 💬 Talk to Vidya
A persistent chat interface powered by Claude. She remembers your entire conversation history. She assigns specific LeetCode problems by number, redirects you when you're avoiding hard topics, and never gives empty motivation. She tells you the truth.

### ⏱ Focus Timer
Vidya sets the timer — not you. The block length is based on your energy level from check-in. She sets the session goals (specific LeetCode problems), you check them off as you finish. She records completion timestamps silently and uses them to calibrate future sessions.

### 📵 Distraction Monitoring
Vidya runs as a background service. The moment you open Instagram, Facebook, YouTube, or TikTok, she fires a notification. She doesn't block the app — she makes it very hard to ignore that you're supposed to be somewhere else.

### 🔔 Daily Alarms
Real Android system notifications — not in-app pings. Wake up alarm, study blocks, meal timers, wind down. Set them once in the notifications screen. They fire every day.

### 🌙 Nightly Recap
At the end of the day, Vidya reviews what you did. She notes your study hours, problems solved, and streak. Her feedback is brief, specific, and earned. She never over-praises. She closes with one line that makes you want to do better tomorrow.

### 📊 Dashboard
A home screen with your live streak, today's study hours, problems solved, and full day schedule. Everything real — pulled from your actual data.

---

## Vidya's Personality

She is warm underneath. She is strict on the surface. Think strict Indian mom energy — high expectations because she believes in you, not because she wants to break you.

- She never asks what you want to do. She tells you.
- She never gives praise mid-session. She saves it.
- When you tell her a chore, she says "Noted. Back to work."
- When you try to skip, she says "Is this your body or just DP problems?"
- When you earn it: "Not a bad day. Do it again tomorrow."

---

## Tech Stack

| Layer | Technology |
|---|---|
| App framework | React Native 0.73 (Android) |
| AI brain | Claude API (claude-sonnet-4) |
| Storage | AsyncStorage (on-device) |
| Notifications | Notifee |
| Screen monitoring | Android UsageStatsManager (native Kotlin module) |
| Background service | Android Foreground Service (native Kotlin) |
| Icons | React Native Vector Icons |

---

## Project Structure

```
Vidya/
├── src/
│   ├── screens/
│   │   ├── CheckInScreen.tsx       # Morning check-in
│   │   ├── PlanningScreen.tsx      # Daily planning chat with Vidya
│   │   ├── DashboardScreen.tsx     # Home screen
│   │   ├── ChatScreen.tsx          # Talk to Vidya
│   │   ├── TimerScreen.tsx         # Focus session
│   │   ├── NotificationsScreen.tsx # Alarm settings
│   │   └── RecapScreen.tsx         # Nightly recap
│   ├── storage.ts                  # AsyncStorage — all persistent data
│   ├── notifications.ts            # Notifee notification helpers
│   ├── usageStats.ts               # JS bridge to native usage monitor
│   └── schedule.ts                 # Schedule generation helpers
├── android/
│   └── app/src/main/java/com/vidya/
│       ├── UsageStatsModule.kt     # Native: reads foreground app
│       ├── UsageStatsPackage.kt    # Native: registers UsageStats module
│       ├── VidyaMonitorService.kt  # Native: background distraction monitor
│       ├── MonitorModule.kt        # Native: start/stop monitor from JS
│       └── MonitorPackage.kt       # Native: registers Monitor module
└── App.tsx                         # Root — screen state, timer state
```

---

## Running Locally

**Requirements:**
- macOS with Homebrew
- Node.js v18+
- JDK 17 (Temurin)
- Android Studio with SDK
- Samsung Android phone with USB debugging enabled

**Setup:**
```bash
git clone <repo>
cd Vidya
npm install
```

Add your Anthropic API key in:
- `src/screens/ChatScreen.tsx`
- `src/screens/RecapScreen.tsx`
- `src/screens/PlanningScreen.tsx`

**Run in development:**
```bash
# Terminal 1
npx react-native start

# Terminal 2 (with phone connected via USB)
npx react-native run-android
```

**Build release APK:**
```bash
cd android && ./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

---

## Data & Privacy

All data lives on your device. Nothing is sent to any server except the Claude API for AI responses. No analytics, no tracking, no accounts. Vidya is yours alone.

---

## What's Coming (Phase 4)

- Weekly review — Vidya shows you patterns across the week
- Smarter memory — your progress fed back into Vidya's context so she knows where you are without being told
- Adaptive goal stack — she manages DSA → System Design progression automatically

---

*Built in one day. May 4, 2026.*