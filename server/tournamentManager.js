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
  CLUTCH: 'CLUTCH'
};

const BOT_USERNAMES = [
  'VoltSniper', 'ApexNova', 'ViperX', 'ShadowBlade', 'PixelFury',
  'CyberGhost', 'BlazeStrike', 'EchoStorm', 'MatrixRider', 'NeonPhantom',
  'PulseSurge', 'ZeroGravity', 'FrostBite', 'TitanRox', 'IronClaw', 'OmegaV'
];

export class TournamentManager {
  constructor(io, options = {}) {
    this.io = io;
    this.serverLanIp = options.serverLanIp || 'localhost';
    this.status = TournamentStatus.REGISTRATION;
    this.round = 0;
    this.players = new Map(); // socketId -> Player
    this.matches = []; // current round matches
    this.countdownTimer = null;
    this.currentBeat = CountdownBeats.READY;
    this.beatTimeRemaining = 0;
    this.isPaused = false;
    this.finalists = [];
    this.spectatorReactions = [];
    this.autoAdvance = false;
    this.roundHistory = [];
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
    const existing = this.players.get(socketId);
    if (existing) {
      existing.name = name || existing.name;
      existing.studentId = studentId || existing.studentId;
      existing.avatar = avatar || existing.avatar;
      return existing;
    }

    const player = {
      id: socketId,
      name: (name || `Contender_${Math.floor(1000 + Math.random() * 9000)}`).trim(),
      studentId: studentId ? String(studentId).trim() : `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: avatar || '🔥',
      status: 'active', // 'active' | 'spectator'
      isBot: Boolean(isBot),
      score: 0,
      roundStreak: 0,
      currentMatchId: null,
      disconnectedAt: null,
      acceptedFinale: false
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

    // 5-second grace period before auto-forfeit if tournament is active
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
        } else if (this.status === TournamentStatus.REGISTRATION) {
          this.players.delete(socketId);
        }
        this.broadcastState();
      }
    }, 5000);
  }

  handleReconnect(oldSocketId, newSocketId) {
    const player = this.players.get(oldSocketId);
    if (player) {
      this.players.delete(oldSocketId);
      player.id = newSocketId;
      player.disconnectedAt = null;
      this.players.set(newSocketId, player);

      // Re-link match if in progress
      if (player.currentMatchId) {
        const match = this.matches.find(m => m.id === player.currentMatchId);
        if (match) {
          if (match.player1.id === oldSocketId) match.player1.id = newSocketId;
          if (match.player2.id === oldSocketId) match.player2.id = newSocketId;
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
      const name = BOT_USERNAMES[(this.players.size + i) % BOT_USERNAMES.length] || `Bot_${i + 1}`;
      const avatars = ['🤖', '⚡', '🦊', '🔥', '🐺', '⚔️', '🦅', '🎯'];
      this.registerPlayer(botId, {
        name: `${name}`,
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

  kickPlayer(socketId) {
    const p = this.players.get(socketId);
    if (p) {
      this.players.delete(socketId);
      this.broadcastState();
      return true;
    }
    return false;
  }

  forceAdvance(socketId) {
    const p = this.players.get(socketId);
    if (p) {
      p.status = 'active';
      this.broadcastState();
      return true;
    }
    return false;
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
        player1: { id: p1.id, name: p1.name, avatar: p1.avatar, studentId: p1.studentId, isBot: p1.isBot },
        player2: { id: p2.id, name: p2.name, avatar: p2.avatar, studentId: p2.studentId, isBot: p2.isBot },
        p1Move: null,
        p2Move: null,
        status: 'IN_PROGRESS',
        result: null, // 'P1_WIN' | 'P2_WIN' | 'DRAW'
        winnerId: null,
        loserId: null
      });
    }

    this.broadcastState();

    // Short breather in MATCHMAKING before synchronized countdown kicks off
    setTimeout(() => {
      this.beginCountdown();
    }, 2500);
  }

  submitMove(socketId, move) {
    if (!['rock', 'paper', 'scissors'].includes(move?.toLowerCase())) return;

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
  }

  beginCountdown() {
    this.status = TournamentStatus.COUNTDOWN;
    const beats = [
      { beat: CountdownBeats.ROCK, duration: 1200 },
      { beat: CountdownBeats.PAPER, duration: 1200 },
      { beat: CountdownBeats.SCISSOR, duration: 1200 },
      { beat: CountdownBeats.CLUTCH, duration: 1600 }
    ];

    let currentStep = 0;

    const executeStep = () => {
      if (this.isPaused) return;

      if (currentStep < beats.length) {
        const { beat, duration } = beats[currentStep];
        this.currentBeat = beat;

        // Broadcast beat event for audio/visual sync
        this.io.emit('countdown_beat', {
          beat,
          round: this.round,
          step: currentStep + 1,
          totalSteps: beats.length,
          duration
        });

        // If it's the CLUTCH beat, bot selections and locks execute!
        if (beat === CountdownBeats.CLUTCH) {
          this.executeBotMovesAndLocks();
        }

        currentStep++;
        this.countdownTimer = setTimeout(executeStep, duration);
      } else {
        // Countdown completed, proceed to evaluation
        this.evaluateRoundResults();
      }
    };

    executeStep();
  }

  executeBotMovesAndLocks() {
    const choices = ['rock', 'paper', 'scissors'];
    for (const match of this.matches) {
      // Bot 1
      if (match.player1.isBot && !match.p1Move) {
        match.p1Move = choices[Math.floor(Math.random() * choices.length)];
      }
      // Bot 2
      if (match.player2.isBot && !match.p2Move) {
        match.p2Move = choices[Math.floor(Math.random() * choices.length)];
      }
      // Human timeout fallback: if human didn't select, default random so game isn't stalled
      if (!match.p1Move) {
        match.p1Move = choices[Math.floor(Math.random() * choices.length)];
      }
      if (!match.p2Move) {
        match.p2Move = choices[Math.floor(Math.random() * choices.length)];
      }
    }
  }

  evaluateRoundResults() {
    this.status = TournamentStatus.EVALUATING;

    for (const match of this.matches) {
      const p1 = this.players.get(match.player1.id);
      const p2 = this.players.get(match.player2.id);

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
          }
        }
      }
    }

    // Save history
    this.roundHistory.push({
      round: this.round,
      matches: JSON.parse(JSON.stringify(this.matches)),
      activeCount: this.getActiveContenders().length,
      spectatorCount: this.getSpectators().length
    });

    this.broadcastState();

    // Give players 4 seconds to experience the dramatic win/loss/draw outcome
    setTimeout(() => {
      this.finalizeRound();
    }, 4500);
  }

  finalizeRound() {
    this.status = TournamentStatus.ROUND_COMPLETE;

    // Check if only 2 players remain!
    const activeContenders = this.getActiveContenders();

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
    this.status = TournamentStatus.REGISTRATION;
    this.round = 0;
    this.currentBeat = CountdownBeats.READY;
    this.matches = [];
    this.finalists = [];
    this.isPaused = false;
    this.roundHistory = [];

    // Reset all players to active, preserve their registration
    for (const player of this.players.values()) {
      player.status = 'active';
      player.score = 0;
      player.roundStreak = 0;
      player.currentMatchId = null;
      player.acceptedFinale = false;
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

    return {
      status: this.status,
      round: this.round,
      currentBeat: this.currentBeat,
      isPaused: this.isPaused,
      autoAdvance: this.autoAdvance,
      serverLanIp: this.serverLanIp,
      stats: {
        totalPlayers: this.players.size,
        activeCount: activeContenders.length,
        spectatorCount: spectators.length
      },
      matches: this.matches.map(m => ({
        id: m.id,
        player1: m.player1,
        player2: m.player2,
        status: m.status,
        result: m.result,
        p1Move: this.status === TournamentStatus.EVALUATING || this.status === TournamentStatus.ROUND_COMPLETE ? m.p1Move : (m.p1Move ? 'LOCKED' : null),
        p2Move: this.status === TournamentStatus.EVALUATING || this.status === TournamentStatus.ROUND_COMPLETE ? m.p2Move : (m.p2Move ? 'LOCKED' : null),
        winnerId: m.winnerId,
        loserId: m.loserId
      })),
      finalists: this.finalists.map(f => ({
        id: f.id,
        name: f.name,
        studentId: f.studentId,
        avatar: f.avatar,
        acceptedFinale: f.acceptedFinale
      })),
      players: this.getAllPlayers().map(p => ({
        id: p.id,
        name: p.name,
        studentId: p.studentId,
        avatar: p.avatar,
        status: p.status,
        isBot: p.isBot,
        score: p.score,
        roundStreak: p.roundStreak,
        currentMatchId: p.currentMatchId
      }))
    };
  }

  broadcastState() {
    this.io.emit('tournament_state', this.getPublicState());
  }
}
