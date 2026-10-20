// client/src/components/SpectatorLobby.jsx
import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { Users, Radio, Send, Trophy, Flame, Zap, Swords, Heart, Skull } from 'lucide-react';

const REACTION_EMOJIS = ['🔥', '💀', '👏', '⚡', '🤯', '🏆', '❤️', '😱'];

const PRESET_CHEERS = [
  "LET'S GOOO! 🔥",
  "CLUTCH MOMENT! ⚡",
  "WHAT A DRAW! 🤯",
  "SEE YOU ON STAGE! 🏆",
  "INSANE MATCH! ⚔️"
];

export default function SpectatorLobby({
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
  const players = tournamentState?.players || [];

  const handleEmojiClick = (emoji) => {
    sound.playClick();
    onSendReaction(emoji, currentPlayer?.name || 'Spectator');
  };

  const handleCheerSubmit = (e) => {
    e?.preventDefault();
    if (!customCheer.trim()) return;
    sound.playClick();
    onSendCheer(customCheer.trim(), currentPlayer?.name || 'Spectator');
    setCustomCheer('');
  };

  const handlePresetCheer = (text) => {
    sound.playClick();
    onSendCheer(text, currentPlayer?.name || 'Spectator');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 relative">
      {/* FLOATING EMOJI CANVAS */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.slice(-20).map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.x}%`, bottom: '80px' }}
            className="absolute text-3xl sm:text-4xl animate-float-emoji filter drop-shadow-[0_0_12px_rgba(255,85,0,0.6)]"
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* SPECTATOR ARENA HEADER BANNER */}
      <div className="glass-panel-glow rounded-2xl p-5 sm:p-6 border border-orange-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center md:text-left">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-2xl text-[#FF5500]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-xl sm:text-2xl font-black font-['Orbitron',sans-serif] text-white">
                LIVE SPECTATOR LOBBY
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                LIVE FEED
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {currentPlayer?.status === 'spectator'
                ? "You are currently spectating the live gauntlet. Cheer on the remaining contenders!"
                : "Waiting for the next round pairing to begin."}
            </p>
          </div>
        </div>

        {/* CONTENDER VS SPECTATOR COUNTER DIALS */}
        <div className="flex items-center gap-3 sm:gap-6 bg-black/60 px-4 py-2.5 rounded-xl border border-zinc-800">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              ALIVE CONTENDERS
            </span>
            <span className="text-xl sm:text-2xl font-black text-green-400 font-mono">
              {activeCount}
            </span>
          </div>
          <div className="h-8 w-px bg-zinc-800"></div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              SPECTATORS
            </span>
            <span className="text-xl sm:text-2xl font-black text-orange-400 font-mono">
              {spectatorCount}
            </span>
          </div>
          <div className="h-8 w-px bg-zinc-800"></div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              STAGE
            </span>
            <span className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk',sans-serif]">
              {status === 'FINALE_STAGE' ? 'FINALE' : `R-${round}`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / MAIN: LIVE MATCHES & BRACKET FEED */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-[#FF5500]" />
                <h2 className="text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                  ACTIVE ROUND DUELS {round > 0 && `(ROUND ${round})`}
                </h2>
              </div>
              <span className="text-xs text-zinc-400">
                {matches.length} {matches.length === 1 ? 'Pair' : 'Pairs'} in Combat
              </span>
            </div>

            {matches.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-sm font-semibold text-zinc-400">
                  {status === 'REGISTRATION'
                    ? "Tournament has not started yet. Waiting for organizer to begin Round 1."
                    : status === 'FINALE_STAGE'
                    ? "2 Finalists have been crowned! Stand by for the live stage summons."
                    : "Matchmaking in progress. Preparing duel arena..."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {matches.map((m) => {
                  const isCompleted = m.status === 'COMPLETED';
                  const isDraw = m.result === 'DRAW';
                  const p1Won = m.result === 'P1_WIN';
                  const p2Won = m.result === 'P2_WIN';

                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCompleted
                          ? isDraw
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : 'bg-black/50 border-orange-500/30'
                          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* Duel Pair Status Header */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 pb-2 mb-2 border-b border-zinc-800/80">
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

                      {/* Contender 1 */}
                      <div className={`flex items-center justify-between p-2 rounded-lg text-xs mb-1.5 ${
                        p1Won ? 'bg-green-500/20 border border-green-500/50 text-white font-bold' : isDraw ? 'bg-amber-500/10 text-white' : 'text-zinc-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{m.player1.avatar}</span>
                          <span className="font-bold">{m.player1.name}</span>
                          {m.player1.isBot && <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400">AI</span>}
                        </div>
                        {isCompleted && (
                          <span className="font-extrabold text-[11px] uppercase tracking-wider text-orange-400">
                            {m.p1Move || 'ROCK'}
                          </span>
                        )}
                      </div>

                      {/* Contender 2 */}
                      <div className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                        p2Won ? 'bg-green-500/20 border border-green-500/50 text-white font-bold' : isDraw ? 'bg-amber-500/10 text-white' : 'text-zinc-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{m.player2.avatar}</span>
                          <span className="font-bold">{m.player2.name}</span>
                          {m.player2.isBot && <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400">AI</span>}
                        </div>
                        {isCompleted && (
                          <span className="font-extrabold text-[11px] uppercase tracking-wider text-orange-400">
                            {m.p2Move || 'ROCK'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: INTERACTIVE REACTION BAR & CHEERS STREAM */}
        <div className="lg:col-span-4 space-y-6">
          {/* FLOATING EMOJI REACTION BAR */}
          <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-3.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm font-['Space_Grotesk',sans-serif]">
              <Flame className="w-4 h-4 text-[#FF5500]" />
              <h3>REACTION TAP BAR</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Tap to send live floating reactions across everyone's screens!
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

          {/* LIVE CHEER STREAM & INPUT */}
          <div className="glass-panel rounded-2xl p-5 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm font-['Space_Grotesk',sans-serif]">
                <Zap className="w-4 h-4 text-[#FF5500]" />
                <h3>SPECTATOR SHOUTOUTS</h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">LIVE FEED</span>
            </div>

            {/* Preset Cheer Quick Taps */}
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

            {/* Custom Cheer Input Form */}
            <form onSubmit={handleCheerSubmit} className="flex gap-2">
              <input
                type="text"
                maxLength={50}
                value={customCheer}
                onChange={(e) => setCustomCheer(e.target.value)}
                placeholder="Send a quick shoutout..."
                className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-zinc-800 focus:border-[#FF5500] text-white text-xs outline-none transition placeholder:text-zinc-600 font-medium"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF6B00] text-white transition cursor-pointer flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Cheers Ticker Display */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {cheers.length === 0 ? (
                <p className="text-center py-4 text-xs text-zinc-600 italic">
                  Be the first to send a shoutout!
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
