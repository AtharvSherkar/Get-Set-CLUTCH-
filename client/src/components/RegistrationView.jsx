import React, { useState } from 'react';
import { Trophy, Swords, Zap, Users, ArrowRight, ShieldCheck, Flame, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { sound } from '../utils/audio';

const AVATARS = ['🔥', '⚡', '🦊', '🤖', '🐺', '👑', '⚔️', '🎯', '🦅', '💀'];

export default function RegistrationView({
  onRegister,
  onDemoRegister,
  isConnected = false,
  connectionError,
  serverUrl,
  onUpdateServerUrl,
  tournamentState,
  currentPlayer
}) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState(serverUrl || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a display name or gamer tag');
      return;
    }
    setError('');
    sound.playClick();
    setIsSubmitting(true);

    if (!isConnected) {
      setIsSubmitting(false);
      setError('Cannot join: Game server is offline or unreachable. Please connect backend server or enter Demo Mode below.');
      return;
    }

    onRegister(
      {
        name: name.trim(),
        avatar
      },
      {
        onError: (msg) => {
          setIsSubmitting(false);
          setError(msg || 'Failed to enter arena.');
        }
      }
    );

    setTimeout(() => {
      setIsSubmitting(false);
    }, 6000);
  };

  const players = tournamentState?.players || [];
  const activeCount = tournamentState?.stats?.activeCount || 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-widest uppercase">
          <Flame className="w-3.5 h-3.5 animate-pulse text-[#FF5500]" />
          COLLEGE ESPORTS CHAMPIONSHIP
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#FF5500] via-[#FF9F1C] to-[#FF5500] rounded-2xl blur-md opacity-40 animate-pulse"></div>
            <img
              src="/assets/clutch-logo.png"
              alt="CLUTCH Logo"
              className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl bg-black/80 p-2 border-2 border-orange-500/60 shadow-2xl"
            />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-['Orbitron',sans-serif] tracking-wider text-white">
            CLU<span className="text-[#FF5500]">TCH</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-lg font-medium">
            Real-Time Battle Royale Rock-Paper-Scissors. Survive the digital knockout gauntlet to earn your call to the main stage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Registration Form Card */}
        <div className="md:col-span-7 glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-orange-500/20">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-[#FF5500]" />
              <h2 className="text-lg font-bold font-['Space_Grotesk',sans-serif] text-white">
                PLAYER JOIN • ENTER TOURNAMENT
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border">
              {isConnected ? (
                <span className="flex items-center gap-1 text-green-400 border-green-500/30 bg-green-500/20 px-2 py-0.5 rounded-full">
                  <Wifi className="w-3 h-3 text-green-400 animate-pulse" />
                  SERVER ONLINE
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-400 border-red-500/30 bg-red-500/20 px-2 py-0.5 rounded-full">
                  <WifiOff className="w-3 h-3 text-red-400" />
                  SERVER OFFLINE
                </span>
              )}
            </div>
          </div>

          {/* Offline Notice & Server URL Config */}
          {!isConnected && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>BACKEND SERVER DISCONNECTED</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Cloudflare Pages hosts the frontend app, but real-time duels require the CLUTCH Node.js backend. If your backend is deployed (e.g. Render/Railway/VPS) or running locally, enter its URL below:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customServerUrl}
                  onChange={(e) => setCustomServerUrl(e.target.value)}
                  placeholder="https://clutch-backend.onrender.com"
                  className="flex-1 px-3 py-2 rounded-lg bg-black/80 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customServerUrl.trim()) {
                      onUpdateServerUrl?.(customServerUrl.trim());
                    }
                  }}
                  className="px-3.5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shrink-0 cursor-pointer transition shadow"
                >
                  Connect
                </button>
              </div>
              {onDemoRegister && (
                <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-zinc-400">Want to test the player interface immediately?</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!name.trim()) {
                        setError('Please enter your display name first');
                        return;
                      }
                      onDemoRegister({ name: name.trim(), avatar });
                    }}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer"
                  >
                    Enter in Demo Mode &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Display Name / Gamertag <span className="text-[#FF5500]">*</span>
              </label>
              <input
                type="text"
                maxLength={20}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. PhoenixBlade"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-700 focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] text-white text-sm outline-none transition placeholder:text-zinc-600 font-medium"
              />
            </div>

            {/* Avatar Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Choose Combat Badge
              </label>
              <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setAvatar(emoji);
                    }}
                    className={`py-2 text-2xl rounded-xl transition cursor-pointer border ${
                      avatar === emoji
                        ? 'bg-orange-500/30 border-orange-400 scale-105 shadow-[0_0_12px_rgba(255,85,0,0.4)]'
                        : 'bg-black/40 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Join Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF8C00] hover:from-[#FF6B00] hover:to-[#FFA01C] text-white font-extrabold font-['Orbitron',sans-serif] tracking-wider text-base shadow-[0_0_25px_rgba(255,85,0,0.5)] hover:shadow-[0_0_35px_rgba(255,85,0,0.8)] transition transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <span>{isSubmitting ? 'ENTERING ARENA...' : 'JOIN TOURNAMENT'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Tournament Rules & Live Lobby Roster */}
        <div className="md:col-span-5 space-y-6">
          {/* Rules Card */}
          <div className="glass-panel rounded-2xl p-5 space-y-3.5 border border-zinc-800">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm font-['Space_Grotesk',sans-serif]">
              <Zap className="w-4 h-4 text-[#FF5500]" />
              <h3>BATTLE ROYALE PROTOCOL</h3>
            </div>
            <ul className="text-xs text-zinc-300 space-y-2.5 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-[#FF5500] font-bold">01.</span>
                <span>Knock-out elimination: Pairings reshuffled every round.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5500] font-bold">02.</span>
                <span><strong>Draw Condition:</strong> If you and your opponent pick the same gesture, <strong>BOTH ADVANCE</strong> to the next round!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5500] font-bold">03.</span>
                <span><strong>Odd Player?</strong> Matched with <strong>CLUTCH_BOT</strong>. Win or draw to survive!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5500] font-bold">04.</span>
                <span><strong>The Final 2:</strong> When only 2 survive, online play freezes and you receive the <strong>"Call from Clutch"</strong> for the live physical stage finale!</span>
              </li>
            </ul>
          </div>

          {/* Live Registered Contenders List */}
          <div className="glass-panel rounded-2xl p-5 space-y-3 border border-zinc-800">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-1.5 text-white">
                <Users className="w-4 h-4 text-[#FF5500]" />
                <span>REGISTERED CONTENDERS</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-orange-400 font-mono">
                {activeCount} READY
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {players.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500 font-medium">
                  Waiting for first contenders to join the lobby...
                </div>
              ) : (
                players.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-zinc-800/80 hover:border-orange-500/30 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.avatar}</span>
                      <span className="font-bold text-zinc-200">{p.name}</span>
                      {p.isBot && (
                        <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          AI
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-green-400/90 font-mono font-bold">READY</span>
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
