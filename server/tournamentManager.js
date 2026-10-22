// server/tournamentManager.js
// Authoritative State Machine for CLUTCH Battle Royale RPS Tournament

export const TournamentStatus = {
  REGISTRATION: 'REGISTRATION',
  MATCHMAKING: 'MATCHMAKING',
  COUNTDOWN: 'COUNTDOWN',
  LOCKED: 'LOCKED',
  EVALUATING: 'EVALUATING',
  ROUND_COMPLETE: 'ROUND_COMPLETE',
  PAUSED: 'PAUSED',
  FINALE_STAGE: 'FINALE_STAGE'
};

export const CountdownBeats = {
  READY: 'READY',
  ROCK: 'ROCK',
  PAPER: 'PAPER',
  SCISSOR: 'SCISSOR',
  CLUTCH: 'CLUTCH',
  DECISION: 'DECISION',
  LOCKED: 'LOCKED'
};

const BOT_USERNAMES = [
  'VoltSniper', 'ApexNova', 'ViperX', 'ShadowBlade', 'PixelFury',
  'CyberGhost', 'BlazeStrike', 'EchoStorm', 'MatrixRider', 'NeonPhantom',
  'PulseSurge', 'ZeroGravity', 'FrostBite', 'TitanRox', 'IronClaw', 'OmegaV'
];

const getLosingMoveAgainst = (move) => {
  const normalized = (move || 'rock').toLowerCase();
  if (normalized === 'rock') return 'scissors';
  if (normalized === 'paper') return 'rock';
  if (normalized === 'scissors') return 'paper';
  return 'scissors';
};

export class TournamentManager {
  constructor(io, options = {}) {
    this.io = io;
    this.serverLanIp = options.serverLanIp || 'localhost';
    this.status = TournamentStatus.REGISTRATION;
    this.round = 0;
    this.players = new Map(); // socketId -> Player
    this.matches = []; // current round matches
    this.countdownTimer = null;
    this.selectionInterval = null;
    this.selectionTimeLeft = 0;
    this.selectionDuration = 5000;
    this.selectionDeadline = null;
    this.currentBeat = CountdownBeats.READY;
    this.beatTimeRemaining = 0;
    this.isPaused = false;
    this.finalists = [];
    this.eliminations = [];
    this.champion = null;
    this.spectatorReactions = [];
    this.autoAdvance = false;
    this.roundHistory = [];
    this.adminSockets = new Set();
  }

  registerAdmin(socketId) {
    if (!socketId) return;
    this.adminSockets.add(socketId);
    const s = this.io?.sockets?.sockets?.get(socketId);
    if (s) {
      s.data = s.data || {};
      s.data.role = 'admin';
      s.join('admins');
    }
  }

  unregisterAdmin(socketId) {
    if (!socketId) return;
    this.adminSockets.delete(socketId);
  }

  isAdmin(socketId) {
    if (!socketId) return false;
    if (this.adminSockets.has(socketId)) return true;
    const s = this.io?.sockets?.sockets?.get(socketId);
    return s?.data?.role === 'admin' || s?.rooms?.has('admins');
  }

  // Helper to get all player objects as an array
  getAllPlayers() {
    return Array.from(this.players.values());
  }

  getActiveContenders() {
    return this.getAllPlayers().filter(p => p.status === 'active');
  }

  getSpectators() {
    return this.getAllPlayers().filter(p => p.status === 'spectator');
  }

  registerPlayer(socketId, { name, studentId, avatar, isBot = false }) {
    const trimmedName = (name || (isBot ? `Bot_${Math.floor(1000 + Math.random() * 9000)}` : `Contender_${Math.floor(1000 + Math.random() * 9000)}`)).trim();
    if (!trimmedName) {
      return { error: 'Please enter a display name or gamer tag.' };
    }

    const nameLower = trimmedName.toLowerCase();
    const cleanStudentId = studentId ? String(studentId).trim() : null;
    const studentIdLower = cleanStudentId ? cleanStudentId.toLowerCase() : null;

    // Reject registration if another active player already uses this exact name (case-insensitive and trimmed)
    for (const [id, p] of this.players.entries()) {
      if (id !== socketId) {
        if (p.name && p.name.trim().toLowerCase() === nameLower) {
          return { error: 'This name is already taken. Please choose a different nickname!' };
        }
        if (studentIdLower && p.studentId && p.studentId.trim().toLowerCase() === studentIdLower) {
          return { error: 'This student ID is already registered. Please choose a different nickname!' };
        }
      }
    }

    const existing = this.players.get(socketId);
    if (existing) {
      existing.name = trimmedName;
      if (cleanStudentId) existing.studentId = cleanStudentId;
      if (avatar) existing.avatar = avatar;
      this.broadcastState();
      return existing;
    }

    const player = {
      id: socketId,
      name: trimmedName,
      studentId: cleanStudentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: avatar || '🔥',
      status: 'active', // 'active' | 'spectator'
      isBot: Boolean(isBot),
      score: 0,
      roundStreak: 0,
      currentMatchId: null,
      disconnectedAt: null,
      acceptedFinale: false,
      registeredAt: Date.now(),
      eliminatedRound: null,
      eliminatedBy: null,
      eliminatedAt: null,
      eliminationDetails: null
    };

    this.players.set(socketId, player);
    this.broadcastState();
    return player;
  }

  handleDisconnect(socketId) {
    const player = this.players.get(socketId);
    if (!player) return;

    if (player.isBot) {
      this.players.delete(socketId);
      this.broadcastState();
      return;
    }

    player.disconnectedAt = Date.now();

    // If still in registration lobby, KEEP player in lobby! (Mobile screen sleep won't delete them)
    if (this.status === TournamentStatus.REGISTRATION) {
      this.broadcastState();
      return;
    }

    // 15-second grace period before auto-forfeit if tournament match is active
    setTimeout(() => {
      const p = this.players.get(socketId);
      if (p && p.disconnectedAt) {
        if (this.status !== TournamentStatus.REGISTRATION && p.status === 'active') {
          // If in an active match, forfeit
          if (p.currentMatchId) {
            const match = this.matches.find(m => m.id === p.currentMatchId);
            if (match && match.status === 'IN_PROGRESS') {
              match.forfeitedBy = p.id;
            }
          }
          p.status = 'spectator';
        }
        this.broadcastState();
      }
    }, 15000);
  }

  handleReconnect(oldSocketId, newSocketId, playerName = null) {
    let player = oldSocketId ? this.players.get(oldSocketId) : null;
    if (!player && playerName) {
      player = this.getAllPlayers().find(p => !p.isBot && p.name.toLowerCase() === playerName.toLowerCase());
    }

    if (player) {
      const previousId = player.id;
      this.players.delete(previousId);
      player.id = newSocketId;
      player.disconnectedAt = null;
      this.players.set(newSocketId, player);

      // Re-link match if in progress
      if (player.currentMatchId) {
        const match = this.matches.find(m => m.id === player.currentMatchId);
        if (match) {
          if (match.player1 && match.player1.id === previousId) match.player1.id = newSocketId;
          if (match.player2 && match.player2.id === previousId) match.player2.id = newSocketId;
        }
      }
      this.broadcastState();
      return player;
    }
    return null;
  }

  addTestBots(count = 8) {
    for (let i = 0; i < count; i++) {
      const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      let baseName = BOT_USERNAMES[(this.players.size + i) % BOT_USERNAMES.length] || `Bot_${i + 1}`;
      let candidateName = baseName;
      let suffix = 1;
      while (Array.from(this.players.values()).some(p => p.name.toLowerCase() === candidateName.toLowerCase())) {
        candidateName = `${baseName}_${suffix++}`;
      }
      const avatars = ['🤖', '⚡', '🦊', '🔥', '🐺', '⚔️', '🦅', '🎯'];
      this.registerPlayer(botId, {
        name: candidateName,
        studentId: `BOT-${Math.floor(100 + Math.random() * 900)}`,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        isBot: true
      });
    }
  }

  clearBots() {
    for (const [id, player] of this.players.entries()) {
      if (player.isBot) {
        this.players.delete(id);
      }
    }
    this.broadcastState();
  }

  kickPlayer(socketId, reason = 'You were removed from the tournament by the host.') {
    // Admin sockets are strictly protected from being kicked
    if (this.isAdmin(socketId)) {
      return false;
    }

    const p = this.players.get(socketId);
    if (p) {
      this.players.delete(socketId);
      this.eliminations = this.eliminations.filter(e => e.playerId !== socketId);
      this.finalists = this.finalists.filter(f => f.id !== socketId);
      if (this.champion && this.champion.id === socketId) this.champion = null;

      // Real-time socket event notifying the specific kicked player
      this.io.to(socketId).emit('player_kicked', { reason, socketId });
      this.io.to(socketId).emit('player-kicked', { reason, socketId });

      // Update any active match involving the kicked player
      for (const m of this.matches) {
        if ((m.player1.id === socketId || m.player2.id === socketId) && m.status === 'IN_PROGRESS') {
          m.status = 'COMPLETED';
          if (m.player1.id === socketId) {
            m.result = 'P2_WIN';
            m.winnerId = m.player2.id;
            m.loserId = socketId;
          } else {
            m.result = 'P1_WIN';
            m.winnerId = m.player1.id;
            m.loserId = socketId;
          }
        }
      }

      this.broadcastState();
      return true;
    }
    return false;
  }

  kickAllPlayers(reason = 'The room was cleared by the host.') {
    // 1. Gather all target player sockets (strictly excluding admin sockets)
    const targetPlayerSocketIds = new Set();

    // From registered tournament contenders
    for (const [id, player] of this.players.entries()) {
      if (!player.isBot && !this.isAdmin(id)) {
        targetPlayerSocketIds.add(id);
      }
    }

    // From connected sockets (players in /join, /waiting-room, /game)
    if (this.io?.sockets?.sockets) {
      for (const [sId, s] of this.io.sockets.sockets.entries()) {
        if (this.isAdmin(sId) || s.data?.role === 'admin' || s.rooms?.has('admins')) {
          continue; // STRICTLY EXCLUDE ADMIN SOCKETS
        }
        if (s.data?.role === 'player' || s.rooms?.has('players') || targetPlayerSocketIds.has(sId)) {
          targetPlayerSocketIds.add(sId);
        } else {
          // Connected non-admin sockets are treated as players
          targetPlayerSocketIds.add(sId);
        }
      }
    }

    // 2. Broadcast kick event ONLY to targeted player sockets
    for (const sId of targetPlayerSocketIds) {
      if (!this.isAdmin(sId)) {
        this.io.to(sId).emit('all_players_kicked', { reason });
        this.io.to(sId).emit('all-players-kicked', { reason });
        this.io.to(sId).emit('player_kicked', { reason });
        this.io.to(sId).emit('player-kicked', { reason });
        this.io.to(sId).emit('game-reset', { reason });
        this.io.to(sId).emit('redirect-to-join', { reason });
      }
    }

    // 3. Clean up all player registrations and tournament brackets
    this.players.clear();
    this.eliminations = [];
    this.finalists = [];
    this.matches = [];
    this.champion = null;
    this.round = 0;
    this.status = TournamentStatus.REGISTRATION;
    this.currentBeat = CountdownBeats.READY;
    this.isPaused = false;
    this.roundHistory = [];

    if (this.countdownTimer) {
      clearTimeout(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.selectionInterval) {
      clearInterval(this.selectionInterval);
      this.selectionInterval = null;
    }
    this.selectionTimeLeft = 0;
    this.selectionDeadline = null;

    this.broadcastState();
    return true;
  }

  forceAdvance(socketId) {
    const p = this.players.get(socketId);
    if (p) {
      p.status = 'active';
      p.eliminatedRound = null;
      p.eliminatedBy = null;
      p.eliminatedAt = null;
      p.eliminationDetails = null;
      this.eliminations = this.eliminations.filter(e => e.playerId !== socketId);
      this.broadcastState();
      return true;
    }
    return false;
  }

  declareChampion(championId) {
    const winner = this.players.get(championId);
    if (!winner) return false;
    this.champion = winner;
    this.io.emit('champion_crowned', {
      champion: {
        id: winner.id,
        name: winner.name,
        studentId: winner.studentId,
        avatar: winner.avatar,
        score: winner.score
      }
    });
    this.broadcastState();
    return true;
  }

  checkFinaleCondition() {
    const activeContenders = this.getActiveContenders();
    if (activeContenders.length === 2 && this.round >= 1) {
      this.triggerFinaleStage(activeContenders);
      return true;
    }
    return false;
  }

  triggerFinaleStage(finalists = null) {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    const finalTwo = finalists || this.getActiveContenders().slice(0, 2);
    this.finalists = finalTwo;
    this.status = TournamentStatus.FINALE_STAGE;
    this.currentBeat = CountdownBeats.READY;

    // Reset current matches
    this.matches = [];

    // Notify finalists specifically and everyone generally
    this.io.emit('finale_summons', {
      finalists: this.finalists.map(f => ({ id: f.id, name: f.name, studentId: f.studentId, avatar: f.avatar }))
    });

    this.broadcastState();
  }

  acceptFinaleCall(socketId) {
    const player = this.players.get(socketId);
    if (player) {
      player.acceptedFinale = true;
      this.broadcastState();
      this.io.emit('finale_accepted', { playerId: player.id, name: player.name });
    }
  }

  startRound() {
    if (this.status === TournamentStatus.FINALE_STAGE) return;

    const activeContenders = this.getActiveContenders();

    // Check if we hit the 2-player finale requirement
    if (activeContenders.length === 2) {
      this.triggerFinaleStage(activeContenders);
      return;
    }

    if (activeContenders.length < 2) {
      return { error: 'Need at least 2 active players to start a round!' };
    }

    this.round += 1;
    this.status = TournamentStatus.MATCHMAKING;
    this.currentBeat = CountdownBeats.READY;
    this.matches = [];

    // Shuffle active players randomly for fair pairing
    const shuffled = [...activeContenders].sort(() => Math.random() - 0.5);

    // Check Odd Player Edge Case
    let botPartner = null;
    if (shuffled.length % 2 !== 0) {
      // Create automated system bot `CLUTCH_BOT`
      botPartner = {
        id: `clutch_bot_${this.round}`,
        name: 'CLUTCH_BOT',
        studentId: 'AI-CORE',
        avatar: '🤖',
        status: 'active',
        isBot: true,
        isSystemBot: true
      };
      shuffled.push(botPartner);
    }

    // Pair up
    for (let i = 0; i < shuffled.length; i += 2) {
      const p1 = shuffled[i];
      const p2 = shuffled[i + 1];
      const matchId = `m_${this.round}_${i / 2}`;

      p1.currentMatchId = matchId;
      p2.currentMatchId = matchId;

      this.matches.push({
        id: matchId,
        round: this.round,
        timestamp: Date.now(),
        completedAt: null,
        player1: { id: p1.id, name: p1.name, avatar: p1.avatar, studentId: p1.studentId, isBot: p1.isBot, isSystemBot: Boolean(p1.isSystemBot) },
        player2: { id: p2.id, name: p2.name, avatar: p2.avatar, studentId: p2.studentId, isBot: p2.isBot, isSystemBot: Boolean(p2.isSystemBot) },
        p1Move: null,
        p2Move: null,
        status: 'IN_PROGRESS',
        result: null, // 'P1_WIN' | 'P2_WIN' | 'DRAW'
        winnerId: null,
        loserId: null
      });
    }

    this.broadcastState();

    // Fast 800ms transition into synchronized countdown beats
    setTimeout(() => {
      this.beginCountdown();
    }, 800);
  }

  submitMove(socketId, move) {
    if (!['rock', 'paper', 'scissors'].includes(move?.toLowerCase())) return;
    if (this.currentBeat === CountdownBeats.LOCKED || this.status === TournamentStatus.EVALUATING || this.status === TournamentStatus.ROUND_COMPLETE) return;

    const normalizedMove = move.toLowerCase();
    const match = this.matches.find(m => m.player1.id === socketId || m.player2.id === socketId);
    if (!match || match.status !== 'IN_PROGRESS') return;

    if (match.player1.id === socketId) {
      match.p1Move = normalizedMove;
    } else if (match.player2.id === socketId) {
      match.p2Move = normalizedMove;
    }

    // Acknowledge move lock to the user (without revealing opponent's move)
    this.io.to(socketId).emit('move_locked', { move: normalizedMove });
    this.broadcastState();
  }

  beginCountdown() {
    this.status = TournamentStatus.COUNTDOWN;
    this.currentBeat = CountdownBeats.ROCK;
    this.selectionTimeLeft = 0;
    this.selectionDeadline = null;
    this.broadcastState();

    // Synchronized 4-beat "Rock, Paper, Scissor, Clutch!" sequence
    const beats = [
      { beat: CountdownBeats.ROCK, duration: 800 },
      { beat: CountdownBeats.PAPER, duration: 800 },
      { beat: CountdownBeats.SCISSOR, duration: 800 },
      { beat: CountdownBeats.CLUTCH, duration: 1100 }
    ];

    // Shared round start timestamp for client-side sync
    const roundStartTimestamp = Date.now();
    let currentStep = 0;

    const executeStep = () => {
      if (this.isPaused) return;

      if (currentStep < beats.length) {
        const { beat, duration } = beats[currentStep];
        this.currentBeat = beat;
        const beatStartTimestamp = Date.now();

        // Broadcast beat event for audio/visual sync with shared timestamp
        this.io.emit('countdown_beat', {
          beat,
          round: this.round,
          step: currentStep + 1,
          totalSteps: beats.length,
          duration,
          roundStartTimestamp,
          beatStartTimestamp,
          isSelectionLocked: false // Input unlocked so players can pre-select or prepare
        });

        // Real-time state synchronization broadcast on EVERY single beat
        this.broadcastState();

        currentStep++;
        this.countdownTimer = setTimeout(executeStep, duration);
      } else {
        // Countdown (ROCK -> PAPER -> SCISSOR -> CLUTCH!) completed!
        // Launch guaranteed 5-second post-countdown selection window
        this.startSelectionWindow();
      }
    };

    executeStep();
  }

  startSelectionWindow() {
    if (this.countdownTimer) {
      clearTimeout(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.selectionInterval) {
      clearInterval(this.selectionInterval);
      this.selectionInterval = null;
    }

    this.currentBeat = CountdownBeats.DECISION;
    this.selectionDuration = 5000;
    this.selectionDeadline = Date.now() + 5000;
    this.selectionTimeLeft = 5;

    // Broadcast selection window open
    this.io.emit('selection_window_start', {
      duration: 5000,
      deadline: this.selectionDeadline,
      seconds: 5,
      round: this.round
    });

    this.broadcastState();

    let remaining = 5;
    this.selectionInterval = setInterval(() => {
      if (this.isPaused) return;

      remaining -= 1;
      this.selectionTimeLeft = Math.max(0, remaining);

      this.io.emit('selection_tick', {
        remaining: this.selectionTimeLeft,
        duration: 5000,
        deadline: this.selectionDeadline
      });

      this.broadcastState();

      if (remaining <= 0) {
        if (this.selectionInterval) {
          clearInterval(this.selectionInterval);
          this.selectionInterval = null;
        }
        this.completeSelectionWindow();
      }
    }, 1000);
  }

  completeSelectionWindow() {
    if (this.selectionInterval) {
      clearInterval(this.selectionInterval);
      this.selectionInterval = null;
    }

    this.currentBeat = CountdownBeats.LOCKED;
    this.selectionTimeLeft = 0;
    this.selectionDeadline = null;

    this.io.emit('selection_window_end', {
      round: this.round
    });

    // Execute bot moves and timeout default selections
    this.executeBotMovesAndLocks();
    this.broadcastState();

    // Brief delay to display LOCKED state visually before revealing outcomes
    setTimeout(() => {
      this.evaluateRoundResults();
    }, 300);
  }

  executeBotMovesAndLocks() {
    const choices = ['rock', 'paper', 'scissors'];
    for (const match of this.matches) {
      const isP1SystemBot = match.player1.isSystemBot || match.player1.id.startsWith('clutch_bot_');
      const isP2SystemBot = match.player2.isSystemBot || match.player2.id.startsWith('clutch_bot_');

      // Human timeout fallback: if human didn't select, default random so game isn't stalled
      if (!isP1SystemBot && !match.p1Move) {
        match.p1Move = choices[Math.floor(Math.random() * choices.length)];
      }
      if (!isP2SystemBot && !match.p2Move) {
        match.p2Move = choices[Math.floor(Math.random() * choices.length)];
      }

      // If matched with CLUTCH_BOT (system bot for odd player edge case):
      // The system bot MUST deliberately pick the losing move so the human player ALWAYS advances!
      if (isP2SystemBot) {
        match.p2Move = getLosingMoveAgainst(match.p1Move);
      } else if (isP1SystemBot) {
        match.p1Move = getLosingMoveAgainst(match.p2Move);
      } else {
        // Standard AI bots:
        if (match.player1.isBot && !match.p1Move) {
          match.p1Move = choices[Math.floor(Math.random() * choices.length)];
        }
        if (match.player2.isBot && !match.p2Move) {
          match.p2Move = choices[Math.floor(Math.random() * choices.length)];
        }
      }
    }
  }

  evaluateRoundResults() {
    this.status = TournamentStatus.EVALUATING;

    for (const match of this.matches) {
      const p1 = this.players.get(match.player1.id);
      const p2 = this.players.get(match.player2.id);

      const isP1SystemBot = match.player1.isSystemBot || match.player1.id.startsWith('clutch_bot_');
      const isP2SystemBot = match.player2.isSystemBot || match.player2.id.startsWith('clutch_bot_');

      // System bot (CLUTCH_BOT) is a sparring partner for odd players and NEVER eliminates a human!
      if (isP2SystemBot) {
        // Player 1 (human) always beats system bot and advances!
        match.result = 'P1_WIN';
        match.winnerId = match.player1.id;
        match.loserId = match.player2.id;
        match.status = 'COMPLETED';
        if (p1) {
          p1.status = 'active';
          p1.score += 10;
          p1.roundStreak += 1;
        }
        continue;
      } else if (isP1SystemBot) {
        // Player 2 (human) always beats system bot and advances!
        match.result = 'P2_WIN';
        match.winnerId = match.player2.id;
        match.loserId = match.player1.id;
        match.status = 'COMPLETED';
        if (p2) {
          p2.status = 'active';
          p2.score += 10;
          p2.roundStreak += 1;
        }
        continue;
      }

      const m1 = match.p1Move;
      const m2 = match.p2Move;

      if (m1 === m2) {
        // DRAW CONDITION:
        // "If both players in a pair make the same selection, both players advance to the next round
        // (they are marked as qualified and placed into the waiting lobby for the next round)."
        match.result = 'DRAW';
        match.status = 'COMPLETED';

        if (p1) {
          p1.status = 'active';
          p1.roundStreak += 1;
        }
        if (p2) {
          p2.status = 'active';
          p2.roundStreak += 1;
        }
      } else {
        const p1Wins =
          (m1 === 'rock' && m2 === 'scissors') ||
          (m1 === 'paper' && m2 === 'rock') ||
          (m1 === 'scissors' && m2 === 'paper');

        if (p1Wins) {
          match.result = 'P1_WIN';
          match.winnerId = match.player1.id;
          match.loserId = match.player2.id;
          match.status = 'COMPLETED';

          if (p1) {
            p1.status = 'active';
            p1.score += 10;
            p1.roundStreak += 1;
          }
          if (p2) {
            p2.status = 'spectator'; // ELIMINATED!
            p2.roundStreak = 0;
            p2.eliminatedRound = this.round;
            p2.eliminatedBy = p1?.name || match.player1.name;
            p2.eliminatedAt = Date.now();
            p2.eliminationDetails = {
              round: this.round,
              defeatedBy: p1?.name || match.player1.name,
              defeatedByAvatar: p1?.avatar || match.player1.avatar,
              loserMove: m2,
              winnerMove: m1,
              timestamp: Date.now()
            };
            this.eliminations.unshift({
              id: `elim_${p2.id}_${this.round}`,
              playerId: p2.id,
              name: p2.name,
              studentId: p2.studentId,
              avatar: p2.avatar,
              isBot: Boolean(p2.isBot),
              round: this.round,
              defeatedBy: p1?.name || match.player1.name,
              defeatedByAvatar: p1?.avatar || match.player1.avatar,
              loserMove: m2,
              winnerMove: m1,
              timestamp: Date.now()
            });
          }
        } else {
          match.result = 'P2_WIN';
          match.winnerId = match.player2.id;
          match.loserId = match.player1.id;
          match.status = 'COMPLETED';

          if (p2) {
            p2.status = 'active';
            p2.score += 10;
            p2.roundStreak += 1;
          }
          if (p1) {
            p1.status = 'spectator'; // ELIMINATED!
            p1.roundStreak = 0;
            p1.eliminatedRound = this.round;
            p1.eliminatedBy = p2?.name || match.player2.name;
            p1.eliminatedAt = Date.now();
            p1.eliminationDetails = {
              round: this.round,
              defeatedBy: p2?.name || match.player2.name,
              defeatedByAvatar: p2?.avatar || match.player2.avatar,
              loserMove: m1,
              winnerMove: m2,
              timestamp: Date.now()
            };
            this.eliminations.unshift({
              id: `elim_${p1.id}_${this.round}`,
              playerId: p1.id,
              name: p1.name,
              studentId: p1.studentId,
              avatar: p1.avatar,
              isBot: Boolean(p1.isBot),
              round: this.round,
              defeatedBy: p2?.name || match.player2.name,
              defeatedByAvatar: p2?.avatar || match.player2.avatar,
              loserMove: m1,
              winnerMove: m2,
              timestamp: Date.now()
            });
          }
        }
      }
    }

    // Mark completed timestamp on all matches
    const completedAt = Date.now();
    for (const match of this.matches) {
      match.completedAt = completedAt;
    }

    // Save history with timestamp
    const roundRecord = {
      round: this.round,
      timestamp: completedAt,
      matches: JSON.parse(JSON.stringify(this.matches)),
      activeCount: this.getActiveContenders().length,
      spectatorCount: this.getSpectators().length
    };
    this.roundHistory.push(roundRecord);

    this.io.emit('match_results_evaluated', roundRecord);
    this.broadcastState();

    // Give players 4 seconds to experience the dramatic win/loss/draw outcome
    setTimeout(() => {
      this.finalizeRound();
    }, 4500);
  }

  finalizeRound() {
    this.status = TournamentStatus.ROUND_COMPLETE;

    // Check how many active contenders remain!
    let activeContenders = this.getActiveContenders();

    // Critical Safeguard: If down to 1 player, restore the top runner-up so the tournament ALWAYS has 2 finalists!
    if (activeContenders.length === 1 && this.eliminations.length > 0) {
      const lastElim = this.eliminations[0];
      const runnerUp = this.players.get(lastElim.playerId);
      if (runnerUp) {
        runnerUp.status = 'active';
        this.eliminations = this.eliminations.filter(e => e.playerId !== runnerUp.id);
        activeContenders = this.getActiveContenders();
      }
    }

    if (activeContenders.length === 2) {
      // Strictly 2 finalists! Trigger the "Call from Clutch" stage transition!
      this.triggerFinaleStage(activeContenders);
      return;
    }

    if (activeContenders.length <= 1) {
      // Edge case: exactly 1 player or 0 players left (e.g. if odd draw/bot eliminated everyone)
      // If 1 remains, they are champion.
      this.broadcastState();
      return;
    }

    // Still > 2 contenders:
    this.broadcastState();

    if (this.autoAdvance) {
      setTimeout(() => {
        if (this.status === TournamentStatus.ROUND_COMPLETE) {
          this.startRound();
        }
      }, 5000);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.broadcastState();
    return this.isPaused;
  }

  resetTournament() {
    if (this.countdownTimer) {
      clearTimeout(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.selectionInterval) {
      clearInterval(this.selectionInterval);
      this.selectionInterval = null;
    }
    this.selectionTimeLeft = 0;
    this.selectionDeadline = null;
    this.status = TournamentStatus.REGISTRATION;
    this.round = 0;
    this.currentBeat = CountdownBeats.READY;
    this.matches = [];
    this.finalists = [];
    this.eliminations = [];
    this.champion = null;
    this.isPaused = false;
    this.roundHistory = [];

    // Reset all players to active, preserve their registration
    for (const player of this.players.values()) {
      player.status = 'active';
      player.score = 0;
      player.roundStreak = 0;
      player.currentMatchId = null;
      player.acceptedFinale = false;
      player.eliminatedRound = null;
      player.eliminatedBy = null;
      player.eliminatedAt = null;
      player.eliminationDetails = null;
    }

    this.broadcastState();
  }

  addReaction(emoji, senderName = 'Contender') {
    if (!emoji || typeof emoji !== 'string') return;
    const reaction = {
      id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      emoji: emoji.slice(0, 4),
      senderName: (senderName || 'Contender').slice(0, 20),
      x: Math.floor(15 + Math.random() * 70), // bounded horizontal percentage
      timestamp: Date.now()
    };
    this.io.emit('new_reaction', reaction);
  }

  getPublicState() {
    const activeContenders = this.getActiveContenders();
    const spectators = this.getSpectators();

    // Determine the Last 2 Players:
    // If finalists array has 2 players, or activeContenders has exactly 2 players:
    const lastTwoSource = this.finalists.length === 2
      ? this.finalists
      : (activeContenders.length === 2 ? activeContenders : []);

    const lastTwoPlayers = lastTwoSource.map(f => {
      const p = this.players.get(f.id) || f;
      return {
        id: p.id,
        name: p.name,
        studentId: p.studentId,
        avatar: p.avatar,
        score: p.score || 0,
        roundStreak: p.roundStreak || 0,
        isBot: Boolean(p.isBot),
        status: p.status,
        acceptedFinale: Boolean(p.acceptedFinale)
      };
    });

    // Waiting list: all active contenders waiting in the lobby (during REGISTRATION or between rounds)
    // Strictly actual human players (do NOT show bots in lobby)
    const waitingPlayers = activeContenders
      .filter(p => !p.isBot)
      .map(p => ({
        id: p.id,
        name: p.name,
        studentId: p.studentId,
        avatar: p.avatar,
        isBot: false,
        score: p.score || 0,
        roundStreak: p.roundStreak || 0,
        registeredAt: p.registeredAt || Date.now()
      }));

    return {
      status: this.status,
      round: this.round,
      currentBeat: this.currentBeat,
      selectionTimeLeft: this.selectionTimeLeft || 0,
      selectionDuration: this.selectionDuration || 5000,
      selectionDeadline: this.selectionDeadline || null,
      isPaused: this.isPaused,
      autoAdvance: this.autoAdvance,
      serverLanIp: this.serverLanIp,
      champion: this.champion ? {
        id: this.champion.id,
        name: this.champion.name,
        studentId: this.champion.studentId,
        avatar: this.champion.avatar,
        score: this.champion.score || 0
      } : null,
      stats: {
        totalPlayers: this.players.size,
        activeCount: activeContenders.length,
        spectatorCount: spectators.length,
        eliminatedCount: this.eliminations.length,
        waitingCount: waitingPlayers.length,
        humanCount: this.getAllPlayers().filter(p => !p.isBot).length,
        botCount: this.getAllPlayers().filter(p => p.isBot).length
      },
      matches: this.matches.map(m => ({
        id: m.id,
        round: m.round,
        timestamp: m.timestamp || Date.now(),
        completedAt: m.completedAt || null,
        player1: m.player1,
        player2: m.player2,
        status: m.status,
        result: m.result,
        p1Move: this.status === TournamentStatus.EVALUATING || this.status === TournamentStatus.ROUND_COMPLETE ? m.p1Move : (m.p1Move ? 'LOCKED' : null),
        p2Move: this.status === TournamentStatus.EVALUATING || this.status === TournamentStatus.ROUND_COMPLETE ? m.p2Move : (m.p2Move ? 'LOCKED' : null),
        winnerId: m.winnerId,
        loserId: m.loserId
      })),
      roundHistory: this.roundHistory,
      finalists: this.finalists.map(f => ({
        id: f.id,
        name: f.name,
        studentId: f.studentId,
        avatar: f.avatar,
        score: f.score || 0,
        roundStreak: f.roundStreak || 0,
        acceptedFinale: Boolean(f.acceptedFinale)
      })),
      lastTwoPlayers,
      waitingPlayers,
      eliminations: this.eliminations,
      players: this.getAllPlayers().map(p => ({
        id: p.id,
        name: p.name,
        studentId: p.studentId,
        avatar: p.avatar,
        status: p.status,
        isBot: Boolean(p.isBot),
        score: p.score || 0,
        roundStreak: p.roundStreak || 0,
        currentMatchId: p.currentMatchId,
        registeredAt: p.registeredAt,
        eliminatedRound: p.eliminatedRound,
        eliminatedBy: p.eliminatedBy,
        eliminatedAt: p.eliminatedAt,
        eliminationDetails: p.eliminationDetails
      }))
    };
  }

  broadcastState() {
    this.io.emit('tournament_state', this.getPublicState());
  }
}
