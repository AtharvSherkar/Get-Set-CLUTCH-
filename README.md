# CLUTCH — Real-Time Battle Royale Rock-Paper-Scissors Tournament

![CLUTCH Logo](/assets/clutch-logo.png)

A full-stack, real-time multiplayer tournament web application titled **CLUTCH**, designed for live college gaming events, club competitions, and esports stages. Features automated pairing, synchronized 4-beat duels, 2D illustrated 5-finger hands, live spectator lobby with floating emojis, a master Admin Console, and the thrilling 2-player stage transition: **"Call from Clutch"**.

---

## 🎮 Key Features & Mechanics

### 1. Visual Identity & Brand Styling
- **Logo Integration:** Organizer's high-voltage fiery fox / origami flame logo displayed across navigation, registration, and incoming stage call modals (`/assets/clutch-logo.png`).
- **Esports Dark Palette:** Deep Matte Black (`#09090B`, `#0D0D11`, `#121212`), High-Voltage Orange (`#FF5500` / `#FF6B00`), Golden Amber (`#FF9F1C`), Neon Success Green (`#22C55E`), and Elimination Crimson (`#EF4444`).
- **Typography & Glow:** `Orbitron`, `Space Grotesk`, and `Outfit` with glowing border cards and glassmorphic panels.

### 2. Duel Arena & 4-Beat Synchronized Countdowns
- **Mirrored 2D Human Hands:** Accurately proportioned 5-finger hands (Thumb, Index, Middle, Ring, Pinky) facing each other across the combat line of fire:
  - Bottom hand: Local Player.
  - Top hand: Opponent / Bot.
- **Synchronized 4-Beat Countdown Sequence:**
  1. **"ROCK"** (Hands shake & bump vertically with deep sub-bass thud)
  2. **"PAPER"** (Hands shake & bump with mid-frequency snap)
  3. **"SCISSOR"** (Hands shake & bump with slicing treble chime)
  4. **"CLUTCH!"** (Lock-in beat: Electric power chord shockwave; hands simultaneously morph into chosen gestures: Rock Fist, Paper Open Palm, or Scissor V-cut!)
- **Thumb-Friendly Input Deck:** Floating cards (🪨 **Stone**, 📄 **Paper**, ✂️ **Scissor**) with instant lock indicator.

### 3. Tournament Progression & Rules
- **Sequential Knock-Out Elimination:** Round after round until only 2 players remain.
- **Draw Condition:** If both contenders in a pair make the same selection, **BOTH ADVANCE** to the next round waiting lobby!
- **Odd Player Edge Case:** If an odd number enters a round, the system automatically pairs the remaining player with `CLUTCH_BOT`. Win or draw to advance; lose and you're eliminated.
- **Disconnect Resilience:** 5-second grace period with auto-reconnect token matching before auto-forfeit.

### 4. The 2-Player Finale Sequence: "Call from Clutch"
When the alive contender count reaches strictly **2 finalists**:
1. Online duels halt immediately — finalists are **not** paired for an online match.
2. Both finalists' screens dim with a realistic smartphone OS incoming call screen.
3. Audio/haptic incoming call ringtone triggers with pulsing CLUTCH logo.
4. **Caller ID:** `CALL FROM CLUTCH` (*"Stage summons incoming..."*).
5. **Controls:** Exactly **ONE glowing green "ACCEPT" button** (no decline button).
6. Tapping **ACCEPT**:
   - Explosive gold/orange celebratory confetti shower.
   - Full-screen banner: **"CLUTCH IN THE ARENA"**.
   - Message: *"You have survived the digital gauntlet. Report to the main stage immediately for the physical showdown!"*
   - Holographic Digital VIP Stage Pass with Contender Name, Student ID, and Verification QR code to present to event anchors.

### 5. Live Waiting Lobby & Spectator Feed
- Real-time tournament bracket displaying active pairs and completed matches.
- Live gauge: **Contenders Alive** vs **Spectators**.
- **Floating Emoji Reaction Engine:** Audience taps 🔥, 💀, 👏, ⚡, 🤯, 🏆 to send real-time floating emojis across everyone's screens.
- **Live Shoutout Feed:** Instant quick-cheers and custom messages ticker.

### 6. Organizer Admin Console
- Accessible via the **ADMIN** button on the top-right navbar.
- Controls:
  - **Start Round / Next Round** (auto-detects 2 finalists to trigger finale).
  - **Pause / Resume** round.
  - **Test Bot Spawner:** Click `+4 Bots`, `+8 Bots`, or `+16 Bots` to immediately simulate 8, 16, or 32 contenders for rehearsals or solo demos!
  - **Manual Overrides:** Kick player, Revive/Force advance player, Trigger Finale manual override, and Reset Tournament.

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+) and npm.

### Quick Start (Single Command)
```bash
# 1. Clone repository
git clone https://github.com/AtharvSherkar/Get-Set-CLUTCH-.git
cd Get-Set-CLUTCH-

# 2. Start both Server & Client
npm run dev
```

### Alternatively, Run Server & Client Individually:
```bash
# Start Backend Server (Port 3001)
npm run server

# Start Client Vite Dev Server (Port 5173)
npm run client
```

### Accessing the App:
- **Player Join View:** [http://localhost:5173/join](http://localhost:5173/join)
- **Dedicated Admin Console (Passwordless):** [http://localhost:5173/admin](http://localhost:5173/admin)
- **Big Screen Projector View:** [http://localhost:5173/projector](http://localhost:5173/projector)
- **Local Network / Mobile Phones:** Open `http://<YOUR_LOCAL_IP>:5173/join` on any smartphone connected to the same Wi-Fi!

---

## ⚡ Deploying to Vercel

The frontend is fully configured for zero-configuration Vercel deployment with SPA route rewrites:

### 1. Deploy Frontend on Vercel:
1. Import this repository into your [Vercel Dashboard](https://vercel.com).
2. Vercel automatically detects the root `vercel.json` and runs `npm run build` (`client/dist`).
3. *(Optional)* In **Vercel Settings → Environment Variables**, add:
   ```
   VITE_SERVER_URL=https://your-backend.onrender.com
   ```
4. Deploy! All routes (`/join`, `/admin`, `/waiting-room`, `/projector`) are seamlessly rewritten to `index.html`.

### 2. Connect to Backend:
- **With Environment Variable:** Set `VITE_SERVER_URL` in Vercel project settings to your backend server (e.g. hosted on Render, Railway, Fly.io, or VPS).
- **On the Fly via Query Parameter:** You can also append `?server=https://your-backend-url` to your Vercel URL (e.g., `https://my-clutch.vercel.app/admin?server=https://my-backend.railway.app`). The app automatically stores and persists this server URL for you and seamlessly encodes it in the Kahoot QR code for mobile joiners!