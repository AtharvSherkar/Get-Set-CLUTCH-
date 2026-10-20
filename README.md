# CLUTCH — Real-Time Battle Royale Rock-Paper-Scissors Tournament

![CLUTCH Logo](/assets/clutch-logo.png)

A full-stack, real-time multiplayer tournament web application titled **CLUTCH**, designed for live college gaming events, club competitions, and esports stages. Features Kahoot-style QR code mobile joining, automated pairing, synchronized 4-beat duels with haptic feedback, 2D illustrated 5-finger hands, live spectator lounge with floating emojis, a PIN-secured master Admin Console, and the thrilling 2-player stage transition: **"Call from Clutch"**.

---

## 🎮 Key Features & Mechanics

### 1. Kahoot-Style QR Code & Player Join Flow
- **Big Screen & Stage Feed:** The host/projector view displays a prominent live scannable **QR Code** alongside a bold **GAME PIN** (e.g., `742910`).
- **Mobile Camera Scan:** When contenders scan the QR code with any smartphone camera, they are routed directly to the mobile pre-game lobby (`/#player?pin=742910`) with their Game PIN pre-filled.
- **Pre-Game Waiting Room:** Once players enter their nickname and student ID, they enter the waiting room where they see their verified contender card, live tournament dials, and interactive reaction bar.
- **Instant Match Transition:** As soon as the host initiates Round 1, all waiting room contenders seamlessly transition into their active duel arenas!

### 2. Guarded & Secured Admin Console
- **PIN Gatekeeper:** The Organizer Admin Console is moved behind strict authentication. Standard player navigation links **do not expose** the admin console.
- **Organizer Authentication:** Accessing `/#admin` prompts for the Organizer Security PIN (Default: `CLUTCH2026`).
- **Backend Authorization Guard:** All backend orchestrations (`admin_start_round`, `admin_add_bots`, `admin_kick_player`, `admin_trigger_finale`, etc.) verify the authenticated socket before execution.
- **One-Click Console Lock:** Organizers can lock and logout of the director desk at any time when stepping away from their laptop.

### 3. Audio & Haptic Sync Engine
- **Preloaded Audio Cues:**
  - `beat_tick.mp3`: Sharp percussive tick on visual cues **"ROCK"**, **"PAPER"**, **"SCISSOR"**.
  - `clutch_lock.mp3`: Heavy impact sub-bass sound upon gesture reveal.
  - `stage_call_ring.mp3`: Continuous phone ringtone looping during the Final 2 "Call from Clutch" screen.
- **Graceful Unlocking:** Audio stems unlock on initial user tap/registration to handle browser autoplay policies.
- **Mobile Haptics (`navigator.vibrate`):**
  - **CLUTCH Beat:** Triggers `navigator.vibrate(120)` on mobile devices at the exact frame the "CLUTCH" beat hits.
  - **Finalist Stage Call:** Executes a continuous phone buzz sequence `navigator.vibrate([400, 200, 400, 1000])` synced to the ringing audio until the green **"ACCEPT"** button is tapped!

### 4. Duel Arena & 4-Beat Synchronized Countdowns
- **Mirrored 2D Human Hands:** Accurately proportioned 5-finger hands (Thumb, Index, Middle, Ring, Pinky) facing each other across the combat line of fire:
  - Bottom hand: Local Player.
  - Top hand: Opponent / Bot.
- **Synchronized 4-Beat Countdown Sequence:**
  1. **"ROCK"** (Hands shake & bump vertically with deep tick)
  2. **"PAPER"** (Hands shake & bump with mid snap)
  3. **"SCISSOR"** (Hands shake & bump with slicing chime)
  4. **"CLUTCH!"** (Lock-in beat: Electric power chord + heavy bass drop + 120ms haptic vibration; hands simultaneously morph into chosen gestures: Rock Fist, Paper Open Palm, or Scissor V-cut!)
- **Thumb-Friendly Input Deck:** Floating cards (🪨 **Stone**, 📄 **Paper**, ✂️ **Scissor**) with instant lock indicator.

### 5. Tournament Progression & Rules
- **Sequential Knock-Out Elimination:** Round after round until only 2 players remain.
- **Draw Condition:** If both contenders in a pair make the same selection, **BOTH ADVANCE** to the next round waiting lobby!
- **Odd Player Edge Case:** If an odd number enters a round, the system automatically pairs the remaining player with `CLUTCH_BOT`. Win or draw to advance; lose and you're eliminated.
- **Disconnect Resilience:** 5-second grace period with auto-reconnect token matching before auto-forfeit.

### 6. The 2-Player Finale Sequence: "Call from Clutch"
When the alive contender count reaches strictly **2 finalists**:
1. Online duels halt immediately — finalists are **not** paired for an online match.
2. Both finalists' screens dim with a realistic smartphone OS incoming call screen.
3. Looping ringtone and continuous phone vibration `[400, 200, 400, 1000]` engage with a pulsating CLUTCH logo.
4. **Caller ID:** `CALL FROM CLUTCH` (*"Stage summons incoming..."*).
5. **Controls:** Exactly **ONE glowing green "ACCEPT" button** (no decline button).
6. Tapping **ACCEPT**:
   - Explosive gold/orange celebratory confetti shower.
   - Vibration and ringtone immediately cease.
   - Full-screen banner: **"CLUTCH IN THE ARENA"**.
   - Message: *"You have survived the digital gauntlet. Report to the main stage immediately for the physical showdown!"*
   - Holographic Digital VIP Stage Pass with Contender Name, Student ID, and Verification QR code to present to event anchors.

---

## 🚀 Running Locally

### Start Both Server & Client
```powershell
npm run dev
```

### URLs:
* **Vite Development Server (with HMR):** [http://localhost:5173](http://localhost:5173)
* **Mobile / LAN Join URL:** `http://192.168.0.37:5173/#player?pin=742910`
* **Auditorium Big Screen / Projector:** `http://localhost:5173/#projector`
* **Secured Organizer Admin Desk:** `http://localhost:5173/#admin` (PIN: `CLUTCH2026`)