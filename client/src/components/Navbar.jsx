// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Volume2, VolumeX, Shield, Users, Radio, Activity, Tv } from 'lucide-react';
import { sound } from '../utils/audio';

export default function Navbar({
  tournamentState,
  currentPlayer,
  activeView = 'PLAYER', // 'PLAYER' | 'ADMIN' | 'PROJECTOR'
  onSelectView
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
          <div className="relative flex items-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF5500] to-[#FF9F1C] rounded-xl blur-xs opacity-60"></div>
            <img
              src="/assets/clutch-logo.png"
              alt="CLUTCH Logo"
              className="relative w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg bg-black/70 p-1 border border-orange-500/40"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-['Orbitron',sans-serif] font-black text-lg sm:text-xl tracking-wider text-white">
                CLU<span className="text-[#FF5500]">TCH</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40">
                ESPORTS
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium hidden sm:block">
              Rock • Paper • Scissors Battle Royale
            </p>
          </div>
        </div>

        {/* CENTER BADGE - STRICTLY SEPARATED BY ROLE (NO ADMIN LINKS FOR PLAYERS) */}
        {activeView === 'ADMIN' ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-orange-950/40 border border-orange-500/40 text-xs">
            <Shield className="w-4 h-4 text-[#FF5500]" />
            <span className="font-black text-orange-400 font-['Orbitron',sans-serif] tracking-wider">
              ORGANIZER CONSOLE
            </span>
          </div>
        ) : activeView === 'PROJECTOR' ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/60 border border-zinc-700 text-xs">
            <Tv className="w-4 h-4 text-[#FF5500]" />
            <span className="font-black text-white font-['Orbitron',sans-serif] tracking-wider">
              STAGE BIG SCREEN
            </span>
          </div>
        ) : (
          /* Main Player View: Clean tournament status banner with ZERO admin links */
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/50 border border-orange-500/30 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-[#FF5500] animate-pulse" />
            <span className="text-zinc-400 hidden xs:inline">ARENA:</span>
            <span className="text-orange-400 font-bold uppercase tracking-wider font-['Space_Grotesk',sans-serif]">
              {status === 'FINALE_STAGE'
                ? 'STAGE FINALE'
                : status === 'REGISTRATION'
                ? 'LOBBY OPEN'
                : `ROUND ${round}`}
            </span>
          </div>
        )}

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-black/50 border border-zinc-800 text-xs">
            <div className="flex items-center gap-1 text-green-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              <span>{activeCount} Alive</span>
            </div>
            <span className="text-zinc-600">|</span>
            <span className="text-orange-400 font-bold uppercase font-['Space_Grotesk',sans-serif]">
              {status === 'FINALE_STAGE' ? 'FINALE' : `R-${round}`}
            </span>
          </div>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-orange-500/40 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-orange-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
