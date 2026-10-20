// client/src/components/AdminPanel.jsx
// Dedicated Organizer Admin Panel & Tournament Operations Console

import React, { useState } from 'react';
import { sound } from '../utils/audio';
import {
  Shield, Play, Pause, RotateCcw, Bot, Swords, Users,
  Check, X, Eye, EyeOff, Search, Trophy, Radio, PhoneCall,
  Flame, Zap, AlertTriangle, RefreshCw
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
  onResetTournament,
  onToggleAutoAdvance
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [revealMoves, setRevealMoves] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'SPECTATOR' | 'BOT'

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

  // Filtered players list
  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'ACTIVE') return p.status === 'active';
    if (filterStatus === 'SPECTATOR') return p.status === 'spectator';
    if (filterStatus === 'BOT') return p.isBot;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* ADMIN CONTROL DECK HEADER */}
      <div className="glass-panel-glow rounded-2xl p-5 sm:p-6 border-2 border-orange-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-[#FF5500] border border-orange-500/40 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-['Orbitron',sans-serif] tracking-wider text-white">
                TOURNAMENT DIRECTOR DESK
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 uppercase">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Authoritative Master Control: Automated Matchmaking, Real-Time Round Orchestration & Stage Summons
            </p>
          </div>
        </div>

        {/* TOP STATUS GAUGES */}
        <div className="flex items-center gap-3 sm:gap-4 bg-black/60 px-4 py-2 rounded-xl border border-zinc-800 self-stretch md:self-auto justify-between md:justify-start">
          <div className="text-center">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">STATUS</span>
            <span className="text-xs sm:text-sm font-black text-orange-400 font-['Space_Grotesk',sans-serif]">
              {status}
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
            <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">CONTENDERS</span>
            <span className="text-sm sm:text-base font-black text-green-400 font-mono">
              {activeCount}
            </span>
          </div>
          <div className="h-6 w-px bg-zinc-800"></div>
          <div className="text-center">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">SPECTATORS</span>
            <span className="text-sm sm:text-base font-black text-red-400 font-mono">
              {spectatorCount}
            </span>
          </div>
        </div>
      </div>

      {/* KAHOOT-STYLE LIVE QR CODE & PLAYER REGISTRATION BAR */}
      <KahootQrBanner
        serverLanIp={tournamentState?.serverLanIp}
        activeCount={activeCount}
        players={players}
      />

      {/* PRIMARY ORCHESTRATION & BOT TOOLKIT */}
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
              Populate test contenders to simulate full 8/16/32 player tournament brackets.
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

      {/* LIVE DUELS GRID (ACTIVE MATCH MONITOR) */}
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

      {/* CONTENDER DIRECTORY & OVERRIDES TABLE */}
      <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF5500]" />
            <h2 className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
              CONTENDER DIRECTORY ({filteredPlayers.length} / {players.length})
            </h2>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contender or ID..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/60 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-orange-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg bg-black/60 border border-zinc-800 text-xs text-zinc-300 outline-none"
            >
              <option value="ALL">All ({players.length})</option>
              <option value="ACTIVE">Alive ({activeCount})</option>
              <option value="SPECTATOR">Eliminated ({spectatorCount})</option>
              <option value="BOT">AI Bots</option>
            </select>
          </div>
        </div>

        {/* Players Table */}
        <div className="max-h-80 overflow-y-auto rounded-xl border border-zinc-800/80 bg-black/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 uppercase font-bold text-[10px] sticky top-0">
              <tr>
                <th className="p-3">Contender</th>
                <th className="p-3">Student ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Streak</th>
                <th className="p-3 text-right">Overrides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No contenders match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/50">
                    <td className="p-3 flex items-center gap-2">
                      <span className="text-base">{p.avatar}</span>
                      <span className="font-bold text-zinc-200">{p.name}</span>
                      {p.isBot && <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400">AI</span>}
                    </td>
                    <td className="p-3 font-mono text-zinc-400">{p.studentId}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-orange-400 font-bold">{p.roundStreak || 0}W</td>
                    <td className="p-3 text-right space-x-2">
                      {p.status !== 'active' && (
                        <button
                          type="button"
                          onClick={() => onForceAdvance(p.id)}
                          className="px-2.5 py-1 rounded bg-green-950/60 hover:bg-green-800/60 border border-green-500/40 text-green-300 font-bold text-[10px] cursor-pointer"
                        >
                          Revive
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onKickPlayer(p.id)}
                        className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-800/60 border border-red-500/40 text-red-300 font-bold text-[10px] cursor-pointer"
                      >
                        Kick
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
