// client/src/components/AdminConsole.jsx
import React, { useState } from 'react';
import { sound } from '../utils/audio';
import {
  Shield, Play, Pause, RotateCcw, Bot, UserMinus, ArrowUpRight,
  Flame, Swords, Users, AlertTriangle, X, Check, PhoneCall
} from 'lucide-react';

export default function AdminConsole({
  tournamentState,
  isOpen,
  onClose,
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

  if (!isOpen) return null;

  const status = tournamentState?.status || 'REGISTRATION';
  const round = tournamentState?.round || 0;
  const isPaused = tournamentState?.isPaused || false;
  const autoAdvance = tournamentState?.autoAdvance || false;
  const activeCount = tournamentState?.stats?.activeCount || 0;
  const spectatorCount = tournamentState?.stats?.spectatorCount || 0;
  const totalCount = tournamentState?.stats?.totalPlayers || 0;
  const matches = tournamentState?.matches || [];
  const players = tournamentState?.players || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl rounded-2xl glass-panel-glow border-2 border-orange-500/40 p-5 sm:p-6 space-y-6 my-auto max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-[#FF5500] border border-orange-500/40">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-['Orbitron',sans-serif] text-white">
                ORGANIZER ADMIN CONSOLE
              </h2>
              <p className="text-xs text-zinc-400">
                Tournament Orchestration, Automated Pairing & Stage Control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP STATUS GAUGES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-panel p-3 rounded-xl border border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">STATUS</span>
            <span className="text-base sm:text-lg font-black text-orange-400 font-['Space_Grotesk',sans-serif]">
              {status}
            </span>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">ROUND</span>
            <span className="text-base sm:text-lg font-black text-white font-mono">
              {round}
            </span>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">ALIVE CONTENDERS</span>
            <span className="text-base sm:text-lg font-black text-green-400 font-mono">
              {activeCount}
            </span>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">SPECTATORS</span>
            <span className="text-base sm:text-lg font-black text-red-400 font-mono">
              {spectatorCount}
            </span>
          </div>
        </div>

        {/* PRIMARY ORCHESTRATION ACTION BUTTONS */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            ROUND ORCHESTRATION
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Start Round / Matchmaking */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStartRound();
              }}
              disabled={activeCount < 2}
              className="py-3 px-3 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF8C00] hover:from-[#FF6B00] hover:to-[#FFA01C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black font-['Space_Grotesk',sans-serif] text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{round === 0 ? 'START ROUND 1' : 'START NEXT ROUND'}</span>
            </button>

            {/* Pause / Resume */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onTogglePause();
              }}
              className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                isPaused
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              <Pause className="w-4 h-4" />
              <span>{isPaused ? 'RESUME ROUND' : 'PAUSE ROUND'}</span>
            </button>

            {/* Finale Stage Manual Trigger */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onTriggerFinale();
              }}
              className="py-3 px-3 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-yellow-400" />
              <span>TRIGGER FINALE</span>
            </button>

            {/* Reset Tournament */}
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="py-3 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET TO LOBBY</span>
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
                  className="flex-1 py-3 px-2 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>CONFIRM</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BOT SIMULATION TOOLKIT (ESSENTIAL FOR TESTING/DEMOS) */}
        <div className="glass-panel p-4 rounded-xl border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Bot className="w-4 h-4 text-[#FF5500]" />
              <span>TEST CONTENDER SIMULATION BOT ENGINE</span>
            </div>
            <span className="text-[10px] text-zinc-400">
              Instantly fill the tournament bracket for solo testing
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAddBots(4)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
            >
              +4 Bots
            </button>
            <button
              type="button"
              onClick={() => onAddBots(8)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
            >
              +8 Bots
            </button>
            <button
              type="button"
              onClick={() => onAddBots(16)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
            >
              +16 Bots
            </button>
            <button
              type="button"
              onClick={onClearBots}
              className="px-3 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-xs font-semibold text-red-400 cursor-pointer ml-auto"
            >
              Clear All Bots
            </button>
          </div>
        </div>

        {/* CONTENDERS ROSTER MANAGEMENT TABLE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              CONTENDER ROSTER & OVERRIDES ({players.length})
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              Green = Active Contender | Gray = Spectator
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto rounded-xl border border-zinc-800 bg-black/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-bold text-[10px] sticky top-0">
                <tr>
                  <th className="p-2.5">Contender</th>
                  <th className="p-2.5">Student ID</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Streak</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {players.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/40">
                    <td className="p-2.5 flex items-center gap-2">
                      <span className="text-base">{p.avatar}</span>
                      <span className="font-bold text-zinc-200">{p.name}</span>
                      {p.isBot && (
                        <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400">
                          AI
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-zinc-400">{p.studentId}</td>
                    <td className="p-2.5">
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
                    <td className="p-2.5 font-mono text-orange-400 font-bold">
                      {p.roundStreak || 0}W
                    </td>
                    <td className="p-2.5 text-right space-x-1.5">
                      {p.status !== 'active' && (
                        <button
                          type="button"
                          onClick={() => onForceAdvance(p.id)}
                          title="Force advance this player into active round"
                          className="px-2 py-1 rounded bg-green-950/60 hover:bg-green-800/60 border border-green-500/40 text-green-300 font-bold text-[10px] cursor-pointer"
                        >
                          Revive
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onKickPlayer(p.id)}
                        title="Kick player from tournament"
                        className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-800/60 border border-red-500/40 text-red-300 font-bold text-[10px] cursor-pointer"
                      >
                        Kick
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
