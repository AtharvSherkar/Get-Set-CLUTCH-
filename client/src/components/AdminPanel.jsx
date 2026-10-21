// client/src/components/AdminPanel.jsx
// Dedicated Organizer Admin Panel & Tournament Operations Console
// Real-time synchronization for Waiting List, Eliminations, and Last 2 Players

import React, { useState } from 'react';
import { sound } from '../utils/audio';
import {
  Shield, Play, Pause, RotateCcw, Bot, Swords, Users,
  Check, X, Eye, EyeOff, Search, Trophy, Radio, PhoneCall,
  Flame, Zap, AlertTriangle, RefreshCw, Skull, Clock,
  Crown, Sparkles, UserCheck, UserX, ArrowRight,
  History, BarChart3, Filter, Award, Target, Activity
} from 'lucide-react';
import KahootQrBanner from './KahootQrBanner';

export default function AdminPanel({
  tournamentState,
  onStartRound,
  onTogglePause,
  onAddBots,
  onClearBots,
  onKickPlayer,
  onForceAdvance,
  onTriggerFinale,
  onDeclareChampion,
  onResetTournament,
  onToggleAutoAdvance
}) {
  const [activeTab, setActiveTab] = useState('WAITING'); // 'WAITING' | 'HISTORY' | 'MATRIX' | 'ELIMINATIONS' | 'DUELS'
  const [confirmReset, setConfirmReset] = useState(false);
  const [revealMoves, setRevealMoves] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'FINALIST' | 'SPECTATOR' | 'BOT'
  const [historyRoundFilter, setHistoryRoundFilter] = useState('ALL'); // 'ALL' | 1 | 2...
  const [historyResultFilter, setHistoryResultFilter] = useState('ALL'); // 'ALL' | 'WIN' | 'DRAW'

  const status = tournamentState?.status || 'REGISTRATION';
  const round = tournamentState?.round || 0;
  const isPaused = tournamentState?.isPaused || false;
  const autoAdvance = tournamentState?.autoAdvance || false;
  const activeCount = tournamentState?.stats?.activeCount || 0;
  const spectatorCount = tournamentState?.stats?.spectatorCount || 0;
  const totalCount = tournamentState?.stats?.totalPlayers || 0;
  const matches = tournamentState?.matches || [];
  const players = tournamentState?.players || [];
  const currentBeat = tournamentState?.currentBeat || 'READY';
  const roundHistory = tournamentState?.roundHistory || [];

  // Live synced lists (bots strictly excluded from waiting lobby)
  const lastTwoPlayers = tournamentState?.lastTwoPlayers || [];
  const waitingPlayers = (tournamentState?.waitingPlayers || []).filter((p) => !p.isBot);
  const eliminations = tournamentState?.eliminations || [];
  const champion = tournamentState?.champion || null;
  const finalists = tournamentState?.finalists || [];

  // Format relative timestamps
  const formatTime = (ts) => {
    if (!ts) return 'Just now';
    const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMoveIcon = (move) => {
    if (!move) return 'Pending';
    const norm = move.toLowerCase();
    if (norm === 'rock') return '🪨 Rock';
    if (norm === 'paper') return '📄 Paper';
    if (norm === 'scissors') return '✂️ Scissors';
    return move;
  };

  const renderMoveBadge = (move, isWinner = false) => {
    if (!move || move === 'LOCKED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 font-mono text-[11px] font-bold">
          <span>🔒</span>
          <span>{move || 'PENDING'}</span>
        </span>
      );
    }
    const norm = move.toLowerCase();
    if (norm === 'rock') {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-['Space_Grotesk'] border ${
          isWinner ? 'bg-orange-500/30 text-orange-300 border-orange-500/70 shadow-[0_0_12px_rgba(255,85,0,0.5)]' : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
        }`}>
          <span>🪨</span>
          <span>ROCK</span>
        </span>
      );
    }
    if (norm === 'paper') {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-['Space_Grotesk'] border ${
          isWinner ? 'bg-blue-500/30 text-blue-300 border-blue-500/70 shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
        }`}>
          <span>📄</span>
          <span>PAPER</span>
        </span>
      );
    }
    if (norm === 'scissors') {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-['Space_Grotesk'] border ${
          isWinner ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        }`}>
          <span>✂️</span>
          <span>SCISSORS</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-mono">
        {move}
      </span>
    );
  };

  // Compile all historical and active matches for comprehensive live tracking
  const allHistoricalMatches = [];
  roundHistory.forEach((rh) => {
    (rh.matches || []).forEach((m) => {
      allHistoricalMatches.push({
        ...m,
        round: rh.round,
        timestamp: m.completedAt || m.timestamp || rh.timestamp,
        isCompleted: true
      });
    });
  });

  // Include current round active matches if not already archived
  if (matches.length > 0 && !roundHistory.some((rh) => rh.round === round)) {
    matches.forEach((m) => {
      allHistoricalMatches.unshift({
        ...m,
        round: round,
        timestamp: m.timestamp || Date.now(),
        isCompleted: m.status === 'COMPLETED'
      });
    });
  }

  // Calculate move distribution metrics
  const moveStats = { rock: 0, paper: 0, scissors: 0 };
  allHistoricalMatches.forEach((m) => {
    if (m.p1Move && moveStats[m.p1Move.toLowerCase()] !== undefined) moveStats[m.p1Move.toLowerCase()]++;
    if (m.p2Move && moveStats[m.p2Move.toLowerCase()] !== undefined) moveStats[m.p2Move.toLowerCase()]++;
  });

  // Filtered match history
  const filteredHistoryMatches = allHistoricalMatches.filter((m) => {
    if (historyRoundFilter !== 'ALL' && m.round !== Number(historyRoundFilter)) return false;
    if (historyResultFilter === 'WIN' && m.result !== 'P1_WIN' && m.result !== 'P2_WIN') return false;
    if (historyResultFilter === 'DRAW' && m.result !== 'DRAW') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const p1Match = m.player1?.name?.toLowerCase().includes(q) || m.player1?.studentId?.toLowerCase().includes(q);
      const p2Match = m.player2?.name?.toLowerCase().includes(q) || m.player2?.studentId?.toLowerCase().includes(q);
      if (!p1Match && !p2Match) return false;
    }
    return true;
  });

  // Filtered players list for Competitor Status Overview & Matrix
  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.eliminatedBy && p.eliminatedBy.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'ACTIVE') return p.status === 'active';
    if (filterStatus === 'FINALIST') return finalists.some((f) => f.id === p.id) || p.acceptedFinale;
    if (filterStatus === 'SPECTATOR') return p.status === 'spectator';
    if (filterStatus === 'BOT') return p.isBot;
    if (filterStatus === 'HUMAN') return !p.isBot;
    return true;
  });

  // Filtered waiting list (strictly real human players, zero bots)
  const filteredWaiting = waitingPlayers.filter((p) =>
    !p.isBot &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filtered eliminations list
  const filteredEliminations = eliminations.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.defeatedBy && e.defeatedBy.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* 1. ADMIN CONTROL DECK HEADER */}
      <div className="glass-panel-glow rounded-2xl p-5 sm:p-6 border-2 border-orange-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-[#FF5500] border border-orange-500/40 flex items-center justify-center">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-['Orbitron',sans-serif] tracking-wider text-white">
                ORGANIZER ADMIN CONSOLE
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                LIVE SYNC
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              Real-time synchronization for Waiting List, Casualty Graveyard, and Grand Finale Duel.
            </p>
          </div>
        </div>

        {/* Global Dials */}
        <div className="flex items-center gap-4 sm:gap-6 bg-black/60 px-5 py-2.5 rounded-xl border border-zinc-800">
          <div className="text-center">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">STAGE STATUS</span>
            <span className="text-xs sm:text-sm font-black text-orange-400 uppercase font-mono">
              {status === 'FINALE_STAGE' ? 'GRAND FINALE' : status}
            </span>
          </div>
          <div className="h-6 w-px bg-zinc-800"></div>
          <div className="text-center">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">ROUND</span>
            <span className="text-sm sm:text-base font-black text-white font-mono">
              {round}
            </span>
          </div>
          <div className="h-6 w-px bg-zinc-800"></div>
          <div className="text-center">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">PLAYERS IN LOBBY</span>
            <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
              {waitingPlayers.length}
            </span>
          </div>
          <div className="h-6 w-px bg-zinc-800"></div>
          <div className="text-center">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">ELIMINATED</span>
            <span className="text-sm sm:text-base font-black text-red-400 font-mono">
              {eliminations.length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. KAHOOT-STYLE LIVE QR CODE & PLAYER REGISTRATION BAR */}
      <KahootQrBanner
        serverLanIp={tournamentState?.serverLanIp}
        activeCount={activeCount}
        players={players}
      />

      {/* 3. PROMINENT "LAST 2 PLAYERS" SHOWCASE (GRAND FINALE DUEL) */}
      {(lastTwoPlayers.length === 2 || status === 'FINALE_STAGE' || champion) && (
        <div className="glass-panel-glow border-2 border-yellow-500/70 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_60px_rgba(234,179,8,0.25)] space-y-5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-yellow-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-yellow-500/30 pb-4 relative z-10">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
              <div>
                <h2 className="text-lg sm:text-2xl font-black font-['Orbitron',sans-serif] tracking-wider text-yellow-300">
                  {champion ? 'GRAND CHAMPION DECLARED!' : 'LAST 2 CONTENDERS • GRAND FINALE SHOWCASE'}
                </h2>
                <p className="text-xs text-yellow-200/80 font-medium">
                  {champion
                    ? `Tournament victor crowned! Congratulations to ${champion.name}!`
                    : 'The ultimate battle royale summit! Two finalists stand ready for the main stage.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {status !== 'FINALE_STAGE' && !champion && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onTriggerFinale();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-yellow-500/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>SUMMON TO STAGE</span>
                </button>
              )}
            </div>
          </div>

          {/* Crowned Champion Banner if exists */}
          {champion && (
            <div className="p-4 rounded-2xl bg-yellow-500/20 border-2 border-yellow-400 text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-black font-black text-xs uppercase tracking-widest">
                <Crown className="w-4 h-4" /> TOURNAMENT CHAMPION
              </div>
              <div className="text-5xl">{champion.avatar}</div>
              <h3 className="text-2xl font-black text-white font-['Space_Grotesk',sans-serif]">{champion.name}</h3>
              <p className="text-xs text-yellow-300 font-mono">{champion.studentId}</p>
            </div>
          )}

          {/* Last 2 Contenders Head-to-Head Card */}
          {lastTwoPlayers.length === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center relative z-10">
              {/* Finalist 1 */}
              <div className="md:col-span-5 p-5 rounded-2xl bg-black/80 border-2 border-orange-500/60 shadow-xl space-y-3 text-center">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-wider border border-orange-500/40">
                  FINALIST 1
                </div>
                <div className="text-6xl">{lastTwoPlayers[0].avatar}</div>
                <div>
                  <h3 className="text-xl font-black text-white">{lastTwoPlayers[0].name}</h3>
                  <span className="text-xs text-orange-400 font-mono block">{lastTwoPlayers[0].studentId}</span>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs font-mono pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
                    Streak: <strong className="text-green-400">{lastTwoPlayers[0].roundStreak || 0}W</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
                    Points: <strong className="text-orange-400">{lastTwoPlayers[0].score || 0}</strong>
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onDeclareChampion && onDeclareChampion(lastTwoPlayers[0].id);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Crown className="w-4 h-4" />
                    <span>CROWN AS CHAMPION 🏆</span>
                  </button>
                </div>
              </div>

              {/* VS Divider */}
              <div className="md:col-span-1 text-center py-2">
                <span className="text-2xl sm:text-3xl font-black text-[#FF5500] font-['Orbitron',sans-serif] tracking-widest block animate-pulse">
                  VS
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                  DUEL
                </span>
              </div>

              {/* Finalist 2 */}
              <div className="md:col-span-5 p-5 rounded-2xl bg-black/80 border-2 border-orange-500/60 shadow-xl space-y-3 text-center">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-wider border border-orange-500/40">
                  FINALIST 2
                </div>
                <div className="text-6xl">{lastTwoPlayers[1].avatar}</div>
                <div>
                  <h3 className="text-xl font-black text-white">{lastTwoPlayers[1].name}</h3>
                  <span className="text-xs text-orange-400 font-mono block">{lastTwoPlayers[1].studentId}</span>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs font-mono pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
                    Streak: <strong className="text-green-400">{lastTwoPlayers[1].roundStreak || 0}W</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
                    Points: <strong className="text-orange-400">{lastTwoPlayers[1].score || 0}</strong>
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onDeclareChampion && onDeclareChampion(lastTwoPlayers[1].id);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Crown className="w-4 h-4" />
                    <span>CROWN AS CHAMPION 🏆</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Target Finalist Counter (when > 2 active players remain) */}
      {activeCount > 2 && (
        <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-zinc-300">
              <strong className="text-white font-bold">{activeCount} Contenders</strong> remaining. When down to{' '}
              <strong className="text-yellow-400 font-bold">2 finalists</strong>, the Grand Finale showcase will trigger!
            </span>
          </div>
          <span className="text-orange-400 font-mono font-bold">{activeCount - 2} eliminations to Finale</span>
        </div>
      )}

      {/* 4. PRIMARY ORCHESTRATION & BOT TOOLKIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ACTION STRIP (8 cols) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-5 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4 text-[#FF5500]" />
              <span>ROUND ORCHESTRATION ACTIONS</span>
            </div>
            {status === 'COUNTDOWN' && (
              <span className="text-[11px] font-bold text-orange-400 animate-pulse font-mono">
                BEAT: {currentBeat}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Start Round Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStartRound();
              }}
              disabled={activeCount < 2}
              className="py-3 px-2 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF8C00] hover:from-[#FF6B00] hover:to-[#FFA01C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold font-['Space_Grotesk',sans-serif] text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{round === 0 ? 'START ROUND 1' : 'START NEXT ROUND'}</span>
            </button>

            {/* Pause / Resume Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onTogglePause();
              }}
              className={`py-3 px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                isPaused
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              <Pause className="w-4 h-4" />
              <span>{isPaused ? 'RESUME ROUND' : 'PAUSE ROUND'}</span>
            </button>

            {/* Manual Finale Trigger */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onTriggerFinale();
              }}
              className="py-3 px-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-yellow-400" />
              <span>TRIGGER FINALE</span>
            </button>

            {/* Reset Tournament */}
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="py-3 px-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET LOBBY</span>
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onResetTournament();
                    setConfirmReset(false);
                  }}
                  className="flex-1 py-3 px-1 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>CONFIRM</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TEST CONTENDER BOT ENGINE (4 cols) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-zinc-800 space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                <Bot className="w-4 h-4 text-[#FF5500]" />
                <span>AI CONTENDER SIMULATOR</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Populate test contenders to simulate live tournament elimination flows.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => onAddBots(4)}
              className="flex-1 min-w-[70px] py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 hover:text-white cursor-pointer transition text-center"
            >
              +4 Bots
            </button>
            <button
              type="button"
              onClick={() => onAddBots(8)}
              className="flex-1 min-w-[70px] py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 hover:text-white cursor-pointer transition text-center"
            >
              +8 Bots
            </button>
            <button
              type="button"
              onClick={() => onAddBots(16)}
              className="flex-1 min-w-[70px] py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 hover:text-white cursor-pointer transition text-center"
            >
              +16 Bots
            </button>
            <button
              type="button"
              onClick={onClearBots}
              className="w-full py-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-xs font-bold text-red-400 cursor-pointer transition text-center"
            >
              Clear All Bots
            </button>
          </div>
        </div>
      </div>

      {/* 5. WORKSPACE TABS: WAITING LIST | MATCH HISTORY | COMPETITORS MATRIX | ELIMINATIONS | DUELS */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/60 border border-zinc-800 overflow-x-auto">
          {/* TAB 1: LIVE WAITING LIST */}
          <button
            type="button"
            onClick={() => setActiveTab('WAITING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'WAITING'
                ? 'bg-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>LIVE WAITING LIST</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
              {waitingPlayers.length}
            </span>
          </button>

          {/* TAB 2: MATCH HISTORY & RESULTS */}
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'HISTORY'
                ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>MATCH HISTORY</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
              {allHistoricalMatches.length}
            </span>
          </button>

          {/* TAB 3: COMPETITORS STATUS MATRIX */}
          <button
            type="button"
            onClick={() => setActiveTab('MATRIX')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'MATRIX'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>COMPETITORS MATRIX</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
              {players.length}
            </span>
          </button>

          {/* TAB 4: LIVE ELIMINATIONS */}
          <button
            type="button"
            onClick={() => setActiveTab('ELIMINATIONS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'ELIMINATIONS'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>GRAVEYARD</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
              {eliminations.length}
            </span>
          </button>

          {/* TAB 5: LIVE DUELS */}
          <button
            type="button"
            onClick={() => setActiveTab('DUELS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'DUELS'
                ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>ACTIVE DUELS</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
              {matches.length}
            </span>
          </button>
        </div>

        {/* Quick Search inside tabs */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contender, ID, opponent..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* 6. TAB CONTENT: LIVE WAITING LIST */}
      {activeTab === 'WAITING' && (
        <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>LIVE WAITING ROOM ROSTER ({filteredWaiting.length} PLAYERS)</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real human contenders currently registered and standing by in the waiting lobby (AI bots hidden).
              </p>
            </div>
          </div>

          {filteredWaiting.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 font-medium">
              No real players currently in the waiting list. Players who scan the QR code and join will appear here in real-time!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredWaiting.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3 hover:border-amber-500/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-black/60 border border-zinc-800">
                      {p.avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                        <span>{p.studentId}</span>
                        <span>•</span>
                        <span className="text-amber-400">Joined {formatTime(p.registeredAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                      WAITING
                    </span>
                    <button
                      type="button"
                      onClick={() => onKickPlayer(p.id)}
                      className="text-[10px] text-red-400 hover:text-red-300 transition cursor-pointer"
                    >
                      Kick
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. TAB CONTENT: LIVE ELIMINATIONS & GRAVEYARD */}
      {activeTab === 'ELIMINATIONS' && (
        <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-white flex items-center gap-2">
                <Skull className="w-4 h-4 text-red-500" />
                <span>CASUALTY GRAVEYARD & ELIMINATION FEED ({filteredEliminations.length})</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time tracking of eliminated contenders. Admins can revive any player directly back to the active tournament lobby.
              </p>
            </div>
          </div>

          {filteredEliminations.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 font-medium">
              No eliminations yet! All contenders are currently alive and battling.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredEliminations.map((e) => (
                <div
                  key={e.id}
                  className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-red-950/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-black/60 border border-red-500/40">
                      {e.avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{e.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400">({e.studentId})</span>
                        {e.isBot && (
                          <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400 font-mono">AI</span>
                        )}
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-500/30 text-red-300 border border-red-500/50">
                          ROUND {e.round} ELIMINATION
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-300 mt-1">
                        <span>Defeated by:</span>
                        <strong className="text-white font-bold">{e.defeatedBy}</strong>
                        {e.loserMove && e.winnerMove && (
                          <span className="text-zinc-400 font-mono text-[11px] ml-1">
                            ({getMoveIcon(e.winnerMove)} defeated {getMoveIcon(e.loserMove)})
                          </span>
                        )}
                        <span className="text-zinc-500 text-[10px]">• {formatTime(e.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => onForceAdvance(e.playerId)}
                      className="px-3 py-1.5 rounded-lg bg-green-950/60 hover:bg-green-800/80 border border-green-500/50 text-green-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-md"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Revive to Lobby</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onKickPlayer(e.playerId)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-900/40 text-zinc-400 hover:text-red-300 border border-zinc-800 cursor-pointer"
                      title="Permanently remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. TAB CONTENT: LIVE DUEL PAIRS */}
      {activeTab === 'DUELS' && (
        <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-[#FF5500]" />
              <h2 className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                LIVE DUEL PAIRS MONITOR ({matches.length} PAIRS)
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setRevealMoves(!revealMoves)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 cursor-pointer"
            >
              {revealMoves ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{revealMoves ? 'Hide Secret Moves' : 'Reveal Live Moves'}</span>
            </button>
          </div>

          {matches.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500 font-medium">
              {status === 'REGISTRATION'
                ? 'Lobby registration open. Start Round 1 to begin pairing.'
                : status === 'FINALE_STAGE'
                ? '2 Finalists reached! Live stage sequence active.'
                : 'Waiting for next round pairing...'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {matches.map((m) => {
                const isCompleted = m.status === 'COMPLETED';
                const isDraw = m.result === 'DRAW';
                const p1Won = m.result === 'P1_WIN';
                const p2Won = m.result === 'P2_WIN';

                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl border transition ${
                      isCompleted
                        ? isDraw
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-black/60 border-orange-500/30'
                        : 'bg-zinc-900/70 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 pb-2 mb-2 border-b border-zinc-800">
                      <span className="font-mono text-zinc-500">PAIR #{m.id.split('_').pop()}</span>
                      {isCompleted ? (
                        isDraw ? (
                          <span className="text-amber-400 font-extrabold">DRAW • BOTH QUALIFY</span>
                        ) : (
                          <span className="text-green-400 font-extrabold">COMPLETED</span>
                        )
                      ) : (
                        <span className="text-orange-400 flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]"></span>
                          IN PROGRESS
                        </span>
                      )}
                    </div>

                    {/* Player 1 */}
                    <div className={`flex items-center justify-between p-2 rounded-lg text-xs mb-1.5 ${
                      p1Won ? 'bg-green-500/20 border border-green-500/50 text-white font-bold' : isDraw ? 'bg-amber-500/10 text-white' : 'text-zinc-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span>{m.player1.avatar}</span>
                        <span className="font-bold">{m.player1.name}</span>
                        {m.player1.isBot && <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400">AI</span>}
                      </div>
                      <span className="font-mono font-bold text-orange-400 uppercase text-[11px]">
                        {isCompleted || revealMoves ? (m.p1Move || 'PENDING') : (m.p1Move ? 'LOCKED' : '...')}
                      </span>
                    </div>

                    {/* Player 2 */}
                    <div className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                      p2Won ? 'bg-green-500/20 border border-green-500/50 text-white font-bold' : isDraw ? 'bg-amber-500/10 text-white' : 'text-zinc-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span>{m.player2.avatar}</span>
                        <span className="font-bold">{m.player2.name}</span>
                        {m.player2.isBot && <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400">AI</span>}
                      </div>
                      <span className="font-mono font-bold text-orange-400 uppercase text-[11px]">
                        {isCompleted || revealMoves ? (m.p2Move || 'PENDING') : (m.p2Move ? 'LOCKED' : '...')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 8. TAB CONTENT: LIVE MATCH HISTORY & PAIRING RESULTS */}
      {activeTab === 'HISTORY' && (
        <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-5">
          {/* Section Header & Analytical Dashboard */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#FF5500]" />
                <h2 className="text-base sm:text-lg font-black font-['Orbitron',sans-serif] tracking-wider text-white">
                  MATCH PAIRINGS & RESULTS HISTORY
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                  LIVE SYNC
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Full transparent audit trail of every combat round, gestures thrown, winner knockouts, and ties.
              </p>
            </div>

            {/* Duel History Quick Metric Counters */}
            <div className="flex flex-wrap items-center gap-2 bg-black/60 p-2 rounded-xl border border-zinc-800 text-xs">
              <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-400 uppercase font-mono block">DUELS</span>
                <span className="font-bold text-white font-mono">{allHistoricalMatches.length}</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-green-950/40 border border-green-500/30 text-center">
                <span className="text-[9px] text-green-400 uppercase font-mono block">KNOCKOUTS</span>
                <span className="font-bold text-green-300 font-mono">
                  {allHistoricalMatches.filter((m) => m.result === 'P1_WIN' || m.result === 'P2_WIN').length}
                </span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-center">
                <span className="text-[9px] text-amber-400 uppercase font-mono block">DRAWS</span>
                <span className="font-bold text-amber-300 font-mono">
                  {allHistoricalMatches.filter((m) => m.result === 'DRAW').length}
                </span>
              </div>
              <div className="h-6 w-px bg-zinc-800 hidden sm:block"></div>
              {/* Gesture Distribution */}
              <div className="flex items-center gap-1 text-[11px] text-zinc-300 font-mono px-2">
                <span>🪨 {moveStats.rock}</span>
                <span>•</span>
                <span>📄 {moveStats.paper}</span>
                <span>•</span>
                <span>✂️ {moveStats.scissors}</span>
              </div>
            </div>
          </div>

          {/* Filter Bar: By Round & By Result */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-zinc-800/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-orange-400" />
                <span>Round:</span>
              </span>
              <button
                type="button"
                onClick={() => setHistoryRoundFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  historyRoundFilter === 'ALL'
                    ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(255,85,0,0.5)]'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                All Rounds
              </button>
              {Array.from(new Set(allHistoricalMatches.map((m) => m.round))).map((r) => (
                <button
                  key={`round-filter-${r}`}
                  type="button"
                  onClick={() => setHistoryRoundFilter(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    historyRoundFilter === r
                      ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(255,85,0,0.5)]'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Round {r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 mr-1">Outcome:</span>
              <button
                type="button"
                onClick={() => setHistoryResultFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  historyResultFilter === 'ALL'
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setHistoryResultFilter('WIN')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  historyResultFilter === 'WIN'
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Decisive Wins
              </button>
              <button
                type="button"
                onClick={() => setHistoryResultFilter('DRAW')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  historyResultFilter === 'DRAW'
                    ? 'bg-amber-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Draws
              </button>
            </div>
          </div>

          {/* Matches Breakdown List */}
          {filteredHistoryMatches.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500 font-medium bg-black/30 rounded-2xl border border-zinc-800/60 space-y-2">
              <History className="w-8 h-8 mx-auto text-zinc-600 opacity-50" />
              <p>No match history records match the current filter.</p>
              <p className="text-[11px] text-zinc-600">
                Matches, choices, and outcomes log here in real-time as duels resolve!
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredHistoryMatches.map((m) => {
                const p1Won = m.result === 'P1_WIN';
                const p2Won = m.result === 'P2_WIN';
                const isDraw = m.result === 'DRAW';
                const isInProgress = m.status === 'IN_PROGRESS';

                return (
                  <div
                    key={`${m.round}_${m.id}`}
                    className={`p-4 rounded-2xl border transition-all ${
                      p1Won || p2Won
                        ? 'bg-zinc-900/80 border-green-500/30 hover:border-green-500/60 shadow-[0_0_15px_rgba(34,197,94,0.08)]'
                        : isDraw
                        ? 'bg-zinc-900/80 border-amber-500/30 hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                        : 'bg-zinc-900/80 border-orange-500/30 hover:border-orange-500/60'
                    }`}
                  >
                    {/* Duel Meta Top Bar */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/70 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 font-mono font-bold text-[10px]">
                          ROUND {m.round}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">#{m.id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {formatTime(m.timestamp)}
                        </span>
                        {isInProgress ? (
                          <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-bold animate-pulse">
                            ⚔️ LIVE IN ARENA
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold">
                            COMPLETED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3-Column Combat Pair Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                      {/* Player 1 Card (3 cols) */}
                      <div
                        className={`md:col-span-3 p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          p1Won
                            ? 'bg-green-950/30 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                            : p2Won
                            ? 'bg-red-950/20 border-red-500/30 opacity-75'
                            : 'bg-zinc-950/50 border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl p-1.5 rounded-lg bg-black/60 border border-zinc-800 flex-shrink-0">
                            {m.player1.avatar}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs sm:text-sm text-white truncate">
                                {m.player1.name}
                              </span>
                              {m.player1.isBot && (
                                <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400 font-mono">
                                  {m.player1.isSystemBot ? 'CLUTCH_BOT' : 'AI'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono block">
                              {m.player1.studentId}
                            </span>
                          </div>
                        </div>

                        {/* Choice & Outcome */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {renderMoveBadge(m.p1Move, p1Won)}
                          {p1Won && (
                            <span className="text-[10px] font-bold text-green-400 flex items-center gap-0.5">
                              <Crown className="w-3 h-3 text-green-400" />
                              <span>WINNER (+10)</span>
                            </span>
                          )}
                          {p2Won && (
                            <span className="text-[10px] font-bold text-red-400 flex items-center gap-0.5">
                              <Skull className="w-3 h-3 text-red-400" />
                              <span>ELIMINATED</span>
                            </span>
                          )}
                          {isDraw && (
                            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                              <Zap className="w-3 h-3 text-amber-400" />
                              <span>ADVANCED</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Center VS Indicator (1 col) */}
                      <div className="md:col-span-1 flex flex-col items-center justify-center py-1">
                        <div className="w-8 h-8 rounded-full bg-black/80 border border-zinc-800 flex items-center justify-center shadow-lg">
                          <Swords className="w-4 h-4 text-orange-400" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-zinc-500 font-mono mt-1">
                          VS
                        </span>
                      </div>

                      {/* Player 2 Card (3 cols) */}
                      <div
                        className={`md:col-span-3 p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          p2Won
                            ? 'bg-green-950/30 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                            : p1Won
                            ? 'bg-red-950/20 border-red-500/30 opacity-75'
                            : 'bg-zinc-950/50 border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl p-1.5 rounded-lg bg-black/60 border border-zinc-800 flex-shrink-0">
                            {m.player2.avatar}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs sm:text-sm text-white truncate">
                                {m.player2.name}
                              </span>
                              {m.player2.isBot && (
                                <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400 font-mono">
                                  {m.player2.isSystemBot ? 'CLUTCH_BOT' : 'AI'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono block">
                              {m.player2.studentId}
                            </span>
                          </div>
                        </div>

                        {/* Choice & Outcome */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {renderMoveBadge(m.p2Move, p2Won)}
                          {p2Won && (
                            <span className="text-[10px] font-bold text-green-400 flex items-center gap-0.5">
                              <Crown className="w-3 h-3 text-green-400" />
                              <span>WINNER (+10)</span>
                            </span>
                          )}
                          {p1Won && (
                            <span className="text-[10px] font-bold text-red-400 flex items-center gap-0.5">
                              <Skull className="w-3 h-3 text-red-400" />
                              <span>ELIMINATED</span>
                            </span>
                          )}
                          {isDraw && (
                            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                              <Zap className="w-3 h-3 text-amber-400" />
                              <span>ADVANCED</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 9. TAB CONTENT: COMPETITORS STATUS OVERVIEW & MATRIX */}
      {activeTab === 'MATRIX' && (
        <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <h2 className="text-base sm:text-lg font-black font-['Orbitron',sans-serif] tracking-wider text-white">
                  COMPETITORS STATUS OVERVIEW & MATRIX
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Live roster of all registered contenders with real-time tournament progression, scores, and casualty records.
              </p>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-black/60 p-1.5 rounded-xl border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterStatus === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All ({players.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('ACTIVE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterStatus === 'ACTIVE'
                    ? 'bg-green-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('FINALIST')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterStatus === 'FINALIST'
                    ? 'bg-yellow-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Finalists ({finalists.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('SPECTATOR')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterStatus === 'SPECTATOR'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Eliminated ({spectatorCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('HUMAN')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterStatus === 'HUMAN'
                    ? 'bg-orange-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Humans ({players.filter((p) => !p.isBot).length})
              </button>
            </div>
          </div>

          {/* Competitors Overview Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-black/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/90 text-zinc-400 uppercase font-bold text-[10px] sticky top-0">
                <tr>
                  <th className="p-3">Contender</th>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3">Score & Streak</th>
                  <th className="p-3">Progression / Casualty Details</th>
                  <th className="p-3 text-right">Admin Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      No contenders match the current filter or search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((p) => {
                    const isChamp = champion?.id === p.id;
                    const isFin = finalists.some((f) => f.id === p.id) || p.acceptedFinale;
                    const isActive = p.status === 'active';
                    const isElim = p.status === 'spectator';

                    return (
                      <tr key={p.id} className="hover:bg-zinc-900/50 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl p-1 rounded-lg bg-black/60 border border-zinc-800">
                              {p.avatar}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-xs sm:text-sm">
                                  {p.name}
                                </span>
                                {isChamp && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                              </div>
                              <span className="text-[10px] text-zinc-500 font-mono block">
                                Joined {formatTime(p.registeredAt)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-zinc-300">
                          {p.studentId}
                          {p.isBot && (
                            <span className="ml-1 text-[9px] px-1 rounded bg-zinc-800 text-zinc-400">
                              AI BOT
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {isChamp ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[10px] font-black font-mono uppercase flex items-center gap-1 w-max shadow-[0_0_12px_rgba(234,179,8,0.3)]">
                              <Crown className="w-3 h-3 text-yellow-400" />
                              CHAMPION
                            </span>
                          ) : isFin ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-bold font-mono uppercase flex items-center gap-1 w-max">
                              <Sparkles className="w-3 h-3 text-yellow-400" />
                              GRAND FINALIST
                            </span>
                          ) : isActive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold font-mono uppercase flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                              ACTIVE CONTENDER
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold font-mono uppercase flex items-center gap-1 w-max">
                              <Skull className="w-3 h-3 text-red-400" />
                              ELIMINATED
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-xs">
                            <span className="text-white font-bold">{p.score || 0} pts</span>
                            <span className="text-zinc-500 ml-1.5 font-normal">
                              ({p.roundStreak || 0} streak)
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {isElim ? (
                            <div className="text-[11px] text-zinc-300">
                              <span className="text-red-400 font-semibold">
                                Eliminated in Round {p.eliminatedRound || p.eliminationDetails?.round || '1'}
                              </span>
                              {p.eliminatedBy && (
                                <span className="text-zinc-400 block text-[10px]">
                                  by {p.eliminatedBy}
                                  {p.eliminationDetails?.loserMove && p.eliminationDetails?.winnerMove && (
                                    <span className="text-zinc-500 font-mono ml-1">
                                      ({p.eliminationDetails.loserMove} vs {p.eliminationDetails.winnerMove})
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          ) : isFin ? (
                            <div className="text-[11px] text-yellow-400 font-medium">
                              Stage summons: {p.acceptedFinale ? '✅ Call Accepted' : '⏳ Waiting on stage'}
                            </div>
                          ) : (
                            <div className="text-[11px] text-zinc-400">
                              Advancing into tournament bracket
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {isElim && (
                            <button
                              type="button"
                              onClick={() => onForceAdvance(p.id)}
                              className="px-2.5 py-1 rounded bg-green-950/60 hover:bg-green-800/60 border border-green-500/40 text-green-300 font-bold text-[10px] cursor-pointer transition"
                            >
                              Revive
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onKickPlayer(p.id)}
                            className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-800/60 border border-red-500/40 text-red-300 font-bold text-[10px] cursor-pointer transition"
                          >
                            Kick
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
