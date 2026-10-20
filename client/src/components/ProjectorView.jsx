// client/src/components/ProjectorView.jsx
// Big Screen / Auditorium Projector Display Mode for Event Anchors & Audiences

import React from 'react';
import { Trophy, Swords, Flame, Users, Radio, Sparkles, PhoneCall } from 'lucide-react';
import KahootQrBanner from './KahootQrBanner';

export default function ProjectorView({ tournamentState }) {
  const status = tournamentState?.status || 'REGISTRATION';
  const round = tournamentState?.round || 0;
  const activeCount = tournamentState?.stats?.activeCount || 0;
  const spectatorCount = tournamentState?.stats?.spectatorCount || 0;
  const matches = tournamentState?.matches || [];
  const finalists = tournamentState?.finalists || [];
  const currentBeat = tournamentState?.currentBeat || 'READY';

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8 select-none">
      {/* CINEMATIC STAGE BANNER */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black tracking-widest uppercase">
          <Flame className="w-4 h-4 text-[#FF5500] animate-pulse" />
          OFFICIAL ARENA PROJECTOR FEED
        </div>

        <div className="flex items-center justify-center gap-4">
          <img src="/assets/clutch-logo.png" alt="CLUTCH" className="w-16 h-16 object-contain" />
          <h1 className="text-5xl sm:text-7xl font-black font-['Orbitron',sans-serif] tracking-wider text-white">
            CLU<span className="text-[#FF5500]">TCH</span>
          </h1>
        </div>
      </div>

      {/* 2-PLAYER GRAND FINALE CALL ALERT (IF TRIGGERED) */}
      {status === 'FINALE_STAGE' && finalists.length === 2 && (
        <div className="glass-panel-glow border-4 border-yellow-500 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_80px_rgba(234,179,8,0.4)] animate-pulse">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 text-yellow-300 font-black text-sm uppercase tracking-widest border border-yellow-500/40">
            <Trophy className="w-5 h-5 text-yellow-400" />
            GRAND FINALE SUMMONS IN PROGRESS
          </div>

          <h2 className="text-4xl sm:text-6xl font-black font-['Orbitron',sans-serif] text-white">
            REPORT TO THE MAIN STAGE!
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            <div className="p-6 rounded-2xl bg-black/80 border-2 border-orange-500 text-center min-w-[240px]">
              <span className="text-5xl block mb-2">{finalists[0]?.avatar}</span>
              <h3 className="text-2xl font-black text-white">{finalists[0]?.name}</h3>
              <p className="text-xs text-orange-400 font-mono mt-1">{finalists[0]?.studentId}</p>
            </div>

            <div className="text-3xl font-black text-[#FF5500] font-['Orbitron',sans-serif]">
              VS
            </div>

            <div className="p-6 rounded-2xl bg-black/80 border-2 border-orange-500 text-center min-w-[240px]">
              <span className="text-5xl block mb-2">{finalists[1]?.avatar}</span>
              <h3 className="text-2xl font-black text-white">{finalists[1]?.name}</h3>
              <p className="text-xs text-orange-400 font-mono mt-1">{finalists[1]?.studentId}</p>
            </div>
          </div>
        </div>
      )}

      {/* KAHOOT-STYLE REGISTRATION QR BANNER ON BIG SCREEN */}
      {status === 'REGISTRATION' && (
        <KahootQrBanner
          serverLanIp={tournamentState?.serverLanIp}
          activeCount={activeCount}
          players={tournamentState?.players || []}
          isProjector={true}
        />
      )}

      {/* GIANT STATS DIALS */}
      <div className="grid grid-cols-3 gap-6">
        <div className="glass-panel-glow rounded-3xl p-6 border border-zinc-800 text-center">
          <span className="text-xs uppercase font-extrabold text-zinc-400 block tracking-widest">
            STAGE ROUND
          </span>
          <span className="text-4xl sm:text-6xl font-black text-white font-['Space_Grotesk',sans-serif] mt-1 block">
            {status === 'FINALE_STAGE' ? 'FINALE' : `ROUND ${round}`}
          </span>
        </div>

        <div className="glass-panel-glow rounded-3xl p-6 border border-green-500/30 text-center shadow-[0_0_30px_rgba(34,197,94,0.15)]">
          <span className="text-xs uppercase font-extrabold text-green-400 block tracking-widest flex items-center justify-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
            CONTENDERS ALIVE
          </span>
          <span className="text-4xl sm:text-6xl font-black text-green-400 font-mono mt-1 block">
            {activeCount}
          </span>
        </div>

        <div className="glass-panel-glow rounded-3xl p-6 border border-orange-500/30 text-center shadow-[0_0_30px_rgba(255,85,0,0.15)]">
          <span className="text-xs uppercase font-extrabold text-orange-400 block tracking-widest">
            SPECTATORS
          </span>
          <span className="text-4xl sm:text-6xl font-black text-orange-400 font-mono mt-1 block">
            {spectatorCount}
          </span>
        </div>
      </div>

      {/* BIG SCREEN DUEL GRID */}
      <div className="glass-panel rounded-3xl p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Swords className="w-6 h-6 text-[#FF5500]" />
            <h2 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-white">
              LIVE ARENA COMBAT DUELS
            </h2>
          </div>
          {status === 'COUNTDOWN' && (
            <div className="text-base font-black px-4 py-1.5 rounded-full bg-[#FF5500] text-black font-['Orbitron',sans-serif] animate-pulse">
              COUNTDOWN: {currentBeat}
            </div>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-sm font-semibold">
            {status === 'REGISTRATION'
              ? 'Lobby open. Contenders registering on mobile devices.'
              : 'Stand by for round pairings...'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => {
              const isCompleted = m.status === 'COMPLETED';
              const isDraw = m.result === 'DRAW';
              const p1Won = m.result === 'P1_WIN';
              const p2Won = m.result === 'P2_WIN';

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCompleted
                      ? isDraw
                        ? 'bg-amber-950/30 border-amber-500/50'
                        : 'bg-black/60 border-orange-500/40'
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400 pb-2 mb-2 border-b border-zinc-800">
                    <span className="font-mono text-zinc-500">PAIR #{m.id.split('_').pop()}</span>
                    {isCompleted ? (
                      isDraw ? (
                        <span className="text-amber-400 font-extrabold uppercase">DRAW • BOTH QUALIFY</span>
                      ) : (
                        <span className="text-green-400 font-extrabold uppercase">COMPLETE</span>
                      )
                    ) : (
                      <span className="text-orange-400 font-bold animate-pulse">DUELING</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className={`p-2.5 rounded-xl flex items-center justify-between text-sm ${
                      p1Won ? 'bg-green-500/20 text-white font-bold border border-green-500/40' : 'bg-black/40 text-zinc-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{m.player1.avatar}</span>
                        <span className="font-bold">{m.player1.name}</span>
                      </div>
                      {isCompleted && (
                        <span className="font-mono uppercase font-black text-orange-400">
                          {m.p1Move || 'ROCK'}
                        </span>
                      )}
                    </div>

                    <div className={`p-2.5 rounded-xl flex items-center justify-between text-sm ${
                      p2Won ? 'bg-green-500/20 text-white font-bold border border-green-500/40' : 'bg-black/40 text-zinc-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{m.player2.avatar}</span>
                        <span className="font-bold">{m.player2.name}</span>
                      </div>
                      {isCompleted && (
                        <span className="font-mono uppercase font-black text-orange-400">
                          {m.p2Move || 'ROCK'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
