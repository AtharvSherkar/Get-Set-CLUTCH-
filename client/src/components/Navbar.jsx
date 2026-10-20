// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Volume2, VolumeX, Shield, Users, Trophy, Radio, Activity } from 'lucide-react';
import { sound } from '../utils/audio';

export default function Navbar({
  tournamentState,
  currentPlayer,
  onOpenAdmin,
  isAdminOpen
}) {
  const [isMuted, setIsMuted] = useState(sound.muted);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const status = tournamentState?.status || 'REGISTRATION';
  const activeCount = tournamentState?.stats?.activeCount || 0;
  const spectatorCount = tournamentState?.stats?.spectatorCount || 0;
  const round = tournamentState?.round || 0;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-orange-500/20 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative group cursor-pointer flex items-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF5500] to-[#FF9F1C] rounded-xl blur-xs opacity-60 group-hover:opacity-100 transition duration-300"></div>
            <img
              src="/assets/clutch-logo.png"
              alt="CLUTCH Logo"
              className="relative w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg bg-black/60 p-1 border border-orange-500/40"
              onError={(e) => {
                // Fallback icon if logo fails to load
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-['Orbitron',sans-serif] font-black text-lg sm:text-xl tracking-wider text-white">
                CLU<span className="text-[#FF5500]">TCH</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40">
                BATTLE ROYALE
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium hidden sm:block">
              Rock • Paper • Scissors Tournament
            </p>
          </div>
        </div>

        {/* Live Tournament Status Pills */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Round Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-orange-500/30 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-[#FF5500] animate-pulse" />
            <span className="text-zinc-400 hidden xs:inline">STATUS:</span>
            <span className="text-orange-400 font-bold uppercase tracking-wider font-['Space_Grotesk',sans-serif]">
              {status === 'FINALE_STAGE'
                ? 'STAGE FINALE'
                : status === 'REGISTRATION'
                ? 'LOBBY OPEN'
                : `ROUND ${round}`}
            </span>
          </div>

          {/* Contenders / Spectators Counter */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1 rounded-lg bg-black/50 border border-zinc-800 text-xs">
            <div className="flex items-center gap-1 text-green-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              <Users className="w-3.5 h-3.5" />
              <span>{activeCount} Alive</span>
            </div>
            <span className="text-zinc-600">|</span>
            <div className="flex items-center gap-1 text-zinc-400">
              <Radio className="w-3.5 h-3.5 text-orange-400" />
              <span>{spectatorCount} Spectating</span>
            </div>
          </div>

          {/* Audio Mute Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-orange-500/40 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-orange-400" />}
          </button>

          {/* Admin Toggle Button */}
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
              isAdminOpen
                ? 'bg-[#FF5500] text-white border-orange-400 shadow-[0_0_15px_rgba(255,85,0,0.5)]'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-orange-500/40'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden xs:inline">ADMIN</span>
          </button>
        </div>
      </div>
    </header>
  );
}
