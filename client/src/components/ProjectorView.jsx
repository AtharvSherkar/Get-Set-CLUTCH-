// client/src/components/ProjectorView.jsx
// Big Screen / Auditorium Projector Display Mode with Kahoot-style Live QR Code & Game PIN

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Trophy, Swords, Flame, Users, Radio, Sparkles, Hash, QrCode, Smartphone } from 'lucide-react';

export default function ProjectorView({ tournamentState }) {
  const status = tournamentState?.status || 'REGISTRATION';
  const round = tournamentState?.round || 0;
  const gamePin = tournamentState?.gamePin || '742910';
  const activeCount = tournamentState?.stats?.activeCount || 0;
  const spectatorCount = tournamentState?.stats?.spectatorCount || 0;
  const matches = tournamentState?.matches || [];
  const finalists = tournamentState?.finalists || [];
  const currentBeat = tournamentState?.currentBeat || 'READY';

  // Construct mobile join URL
  const serverIp = tournamentState?.serverLanIp || window.location.hostname;
  const port = window.location.port || '5173';
  const joinUrl = `http://${serverIp}:${port}/#player?pin=${gamePin}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 select-none">
      {/* KAHOOT STYLE LIVE QR CODE & JOIN BANNER (FEATURED IN REGISTRATION / LOBBY) */}
      <div className="glass-panel-glow border-2 border-orange-500/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Left: Join Instructions & Game PIN */}
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black tracking-widest uppercase">
            <Flame className="w-4 h-4 text-[#FF5500] animate-pulse" />
            LIVE AUDITORIUM STAGE FEED
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <img src="/assets/clutch-logo.png" alt="CLUTCH" className="w-12 h-12 object-contain" />
            <h1 className="text-3xl sm:text-5xl font-black font-['Orbitron',sans-serif] tracking-wider text-white">
              CLU<span className="text-[#FF5500]">TCH</span> ARENA
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            {/* Game PIN Box */}
            <div className="bg-black/80 px-6 py-3 rounded-2xl border-2 border-orange-500 shadow-xl text-center">
              <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-widest block">
                GAME PIN CODE
              </span>
              <span className="text-4xl sm:text-5xl font-black text-orange-400 font-mono tracking-wider">
                {gamePin}
              </span>
            </div>

            <div className="text-xs text-zinc-300 font-medium space-y-1 text-center sm:text-left">
              <p className="flex items-center gap-1.5 justify-center sm:justify-start font-bold text-white text-sm">
                <Smartphone className="w-4 h-4 text-[#FF5500]" />
                Scan QR or open on phone:
              </p>
              <p className="font-mono text-orange-300 text-xs sm:text-sm bg-black/60 px-3 py-1.5 rounded-lg border border-zinc-800">
                {joinUrl}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Crisp Scannable QR Code */}
        <div className="flex flex-col items-center gap-2 bg-black/90 p-4 sm:p-5 rounded-2xl border-2 border-orange-500/60 shadow-2xl">
          <div className="bg-white p-3 rounded-xl shadow-inner">
            <QRCodeSVG
              value={joinUrl}
              size={150}
              level="H"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#FFFFFF"
            />
          </div>
          <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5" />
            SCAN WITH PHONE CAMERA TO JOIN
          </span>
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

      {/* GIANT STATS DIALS */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 border border-zinc-800 text-center">
          <span className="text-xs uppercase font-extrabold text-zinc-400 block tracking-widest">
            STAGE ROUND
          </span>
          <span className="text-3xl sm:text-6xl font-black text-white font-['Space_Grotesk',sans-serif] mt-1 block">
            {status === 'FINALE_STAGE' ? 'FINALE' : `ROUND ${round}`}
          </span>
        </div>

        <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 border border-green-500/30 text-center shadow-[0_0_30px_rgba(34,197,94,0.15)]">
          <span className="text-xs uppercase font-extrabold text-green-400 block tracking-widest flex items-center justify-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
            CONTENDERS ALIVE
          </span>
          <span className="text-3xl sm:text-6xl font-black text-green-400 font-mono mt-1 block">
            {activeCount}
          </span>
        </div>

        <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 border border-orange-500/30 text-center shadow-[0_0_30px_rgba(255,85,0,0.15)]">
          <span className="text-xs uppercase font-extrabold text-orange-400 block tracking-widest">
            SPECTATORS
          </span>
          <span className="text-3xl sm:text-6xl font-black text-orange-400 font-mono mt-1 block">
            {spectatorCount}
          </span>
        </div>
      </div>

      {/* BIG SCREEN DUEL GRID */}
      <div className="glass-panel rounded-3xl p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Swords className="w-6 h-6 text-[#FF5500]" />
            <h2 className="text-lg sm:text-xl font-bold font-['Space_Grotesk',sans-serif] text-white">
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
              ? 'Lobby open. Contenders registering on mobile devices via QR code above.'
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
