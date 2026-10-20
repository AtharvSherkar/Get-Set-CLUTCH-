// client/src/components/WaitingRoom.jsx
// Dedicated Player Waiting Room & Spectator Lounge

import React, { useState } from 'react';
import { sound } from '../utils/audio';
import {
  Users, Radio, Send, Trophy, Flame, Zap, Swords,
  ShieldCheck, Hourglass, Sparkles, CheckCircle2
} from 'lucide-react';

const REACTION_EMOJIS = ['🔥', '💀', '👏', '⚡', '🤯', '🏆', '❤️', '😱'];

const PRESET_CHEERS = [
  "LOCK IN! 🔥",
  "CLUTCH MOMENT! ⚡",
  "WHO IS GOING TO STAGE? 🏆",
  "NEVER BACK DOWN! ⚔️",
  "INSANE DRAW! 🤯"
];

export default function WaitingRoom({
  tournamentState,
  currentPlayer,
  reactions = [],
  cheers = [],
  onSendReaction,
  onSendCheer
}) {
  const [customCheer, setCustomCheer] = useState('');

  const status = tournamentState?.status || 'REGISTRATION';
  const round = tournamentState?.round || 0;
  const activeCount = tournamentState?.stats?.activeCount || 0;
  const spectatorCount = tournamentState?.stats?.spectatorCount || 0;
  const totalCount = tournamentState?.stats?.totalPlayers || 0;
  const matches = tournamentState?.matches || [];
  const isSpectator = currentPlayer?.status === 'spectator';

  const lastReactionRef = React.useRef(0);

  const handleEmojiClick = (emoji) => {
    const now = Date.now();
    if (now - lastReactionRef.current < 250) return; // Guard against accidental ghost/double click
    lastReactionRef.current = now;
    sound.playClick();
    onSendReaction(emoji, currentPlayer?.name || 'Contender');
  };

  const handleCheerSubmit = (e) => {
    e?.preventDefault();
    if (!customCheer.trim()) return;
    sound.playClick();
    onSendCheer(customCheer.trim(), currentPlayer?.name || 'Contender');
    setCustomCheer('');
  };

  const handlePresetCheer = (text) => {
    sound.playClick();
    onSendCheer(text, currentPlayer?.name || 'Contender');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 relative">

      {/* CONTENDER COMBAT STATUS CARD (TOP) */}
      <div className="glass-panel-glow rounded-3xl p-6 border-2 border-orange-500/40 relative overflow-hidden shadow-2xl">
        {/* Subtle fiery background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <span className="text-4xl sm:text-5xl p-3 rounded-2xl bg-black/80 border-2 border-orange-500/60 block shadow-lg">
                {currentPlayer?.avatar || '🔥'}
              </span>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-black px-2 py-0.5 rounded-full bg-[#FF5500] text-white uppercase tracking-wider">
                {isSpectator ? 'SPECTATOR' : 'ALIVE'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-['Space_Grotesk',sans-serif] text-white">
                  {currentPlayer?.name}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {currentPlayer?.studentId}
                </span>
              </div>

              {/* Status explanation */}
              <p className="text-xs text-zinc-300 font-medium">
                {isSpectator ? (
                  <span className="text-red-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    Eliminated from active duels. You are now cheering from the Spectator Arena!
                  </span>
                ) : round === 0 ? (
                  <span className="text-green-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Lobby Ready. Standing by for organizer to initiate Round 1!
                  </span>
                ) : (
                  <span className="text-orange-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    Qualified for Round {round + 1}! Awaiting next pairing lock.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* TOURNAMENT LIVE DIALS */}
          <div className="flex items-center gap-4 sm:gap-6 bg-black/70 px-5 py-3 rounded-2xl border border-zinc-800">
            <div className="text-center">
              <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">
                ALIVE CONTENDERS
              </span>
              <span className="text-xl sm:text-2xl font-black text-green-400 font-mono">
                {activeCount}
              </span>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <div className="text-center">
              <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">
                SPECTATORS
              </span>
              <span className="text-xl sm:text-2xl font-black text-orange-400 font-mono">
                {spectatorCount}
              </span>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <div className="text-center">
              <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">
                ROUND
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk',sans-serif]">
                {status === 'FINALE_STAGE' ? 'FINALE' : `R-${round}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MATCHMAKING RADAR / STATUS PULSE */}
      <div className="glass-panel rounded-2xl p-4 border border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-[#FF5500] animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-[#FF5500] absolute"></span>
          </div>
          <div>
            <span className="font-bold text-white uppercase tracking-wider block">
              {status === 'REGISTRATION'
                ? 'WAITING ROOM ACTIVE — CONTENDERS REGISTERING'
                : status === 'ROUND_COMPLETE'
                ? 'ROUND CONCLUDED — ORGANIZER PREPARING NEXT COMBAT ROUND'
                : 'SYNCHRONIZING WITH CLUTCH TOURNAMENT SERVER'}
            </span>
            <span className="text-[11px] text-zinc-400">
              Keep your screen on. Pairing locks in automatically when round begins!
            </span>
          </div>
        </div>
        <Hourglass className="w-4 h-4 text-orange-400 animate-spin hidden sm:block" />
      </div>

      {/* TWO COLUMN GRID: ACTIVE DUELS & REACTION HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT (7 cols): LIVE PAIRINGS & BRACKET TRACKER */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-[#FF5500]" />
              <h2 className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                TOURNAMENT BRACKET & LIVE PAIRS
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              {matches.length} ACTIVE PAIRS
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-zinc-400">
                {status === 'REGISTRATION'
                  ? 'Contenders are assembling in the waiting room. Round 1 matchmaking starting shortly!'
                  : 'Preparing pairing for the next round...'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {matches.map((m) => {
                const isCompleted = m.status === 'COMPLETED';
                const isDraw = m.result === 'DRAW';
                const p1Won = m.result === 'P1_WIN';
                const p2Won = m.result === 'P2_WIN';

                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-xl border transition ${
                      isCompleted
                        ? isDraw
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-black/50 border-orange-500/30'
                        : 'bg-zinc-900/60 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-1.5">
                      <span className="font-mono text-zinc-500">PAIR #{m.id.split('_').pop()}</span>
                      {isCompleted ? (
                        isDraw ? (
                          <span className="text-amber-400 font-extrabold uppercase">
                            DRAW • BOTH ADVANCE
                          </span>
                        ) : (
                          <span className="text-green-400 font-extrabold uppercase">
                            COMPLETED
                          </span>
                        )
                      ) : (
                        <span className="text-orange-400 flex items-center gap-1 font-bold animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]"></span>
                          DUELING
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`p-2 rounded-lg flex items-center justify-between ${
                        p1Won ? 'bg-green-500/20 text-white font-bold border border-green-500/40' : 'bg-black/40 text-zinc-300'
                      }`}>
                        <div className="flex items-center gap-1.5 truncate">
                          <span>{m.player1.avatar}</span>
                          <span className="truncate">{m.player1.name}</span>
                        </div>
                        {isCompleted && <span className="font-mono uppercase text-orange-400 font-bold">{m.p1Move || 'ROCK'}</span>}
                      </div>

                      <div className={`p-2 rounded-lg flex items-center justify-between ${
                        p2Won ? 'bg-green-500/20 text-white font-bold border border-green-500/40' : 'bg-black/40 text-zinc-300'
                      }`}>
                        <div className="flex items-center gap-1.5 truncate">
                          <span>{m.player2.avatar}</span>
                          <span className="truncate">{m.player2.name}</span>
                        </div>
                        {isCompleted && <span className="font-mono uppercase text-orange-400 font-bold">{m.p2Move || 'ROCK'}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT (5 cols): INTERACTIVE REACTION ENGINE & CHEERS */}
        <div className="lg:col-span-5 space-y-5">
          {/* FLOATING EMOJI REACTION TAP BAR */}
          <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4 text-[#FF5500]" />
              <span>FLOATING REACTION ENGINE</span>
            </div>
            <p className="text-xs text-zinc-400">
              Tap any reaction to float glowing emojis across every contender's screen!
            </p>

            <div className="grid grid-cols-4 gap-2">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="py-3 text-2xl rounded-xl bg-zinc-900/80 hover:bg-orange-500/20 border border-zinc-800 hover:border-orange-500/50 transition transform active:scale-125 cursor-pointer shadow-md flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* CHEER SHOUTOUT FEED */}
          <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 text-[#FF5500]" />
                <span>COMMUNITY SHOUTOUTS</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">LIVE TICKER</span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CHEERS.map((cheer, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetCheer(cheer)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-black/40 border border-zinc-800 hover:border-orange-500/40 text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  {cheer}
                </button>
              ))}
            </div>

            {/* Cheer Input Form */}
            <form onSubmit={handleCheerSubmit} className="flex gap-2">
              <input
                type="text"
                maxLength={50}
                value={customCheer}
                onChange={(e) => setCustomCheer(e.target.value)}
                placeholder="Send a hype shoutout..."
                className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-zinc-800 focus:border-[#FF5500] text-white text-xs outline-none transition placeholder:text-zinc-600 font-medium"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF6B00] text-white transition cursor-pointer flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Cheers Stream */}
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {cheers.length === 0 ? (
                <p className="text-center py-4 text-xs text-zinc-600 italic">
                  Waiting for first shoutout...
                </p>
              ) : (
                cheers.slice(-15).reverse().map((c) => (
                  <div
                    key={c.id}
                    className="p-2 rounded-lg bg-black/40 border border-zinc-800/80 text-xs flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-orange-400">{c.senderName}</span>
                      <span className="text-zinc-600 font-mono">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-zinc-200 font-medium">{c.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
