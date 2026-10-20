// client/src/components/DuelArena.jsx
import React, { useState, useEffect } from 'react';
import HandIllustration from './HandIllustration';
import { sound } from '../utils/audio';
import { Shield, Zap, CheckCircle2, Lock, Flame } from 'lucide-react';

export default function DuelArena({
  currentMatch,
  currentPlayer,
  tournamentState,
  onSubmitMove
}) {
  const [selectedMove, setSelectedMove] = useState(null);
  const [lockedMove, setLockedMove] = useState(null);

  const status = tournamentState?.status || 'COUNTDOWN';
  const currentBeat = tournamentState?.currentBeat || 'READY';
  const round = tournamentState?.round || 1;

  // Determine which player is local vs opponent
  const isP1 = currentMatch?.player1?.id === currentPlayer?.id;
  const localPlayerData = isP1 ? currentMatch?.player1 : currentMatch?.player2;
  const opponentPlayerData = isP1 ? currentMatch?.player2 : currentMatch?.player1;

  // Moves revealed during evaluation
  const localRevealedMove = isP1 ? currentMatch?.p1Move : currentMatch?.p2Move;
  const opponentRevealedMove = isP1 ? currentMatch?.p2Move : currentMatch?.p1Move;

  // Match outcome
  const matchResult = currentMatch?.result;
  const isWinner =
    (matchResult === 'P1_WIN' && isP1) || (matchResult === 'P2_WIN' && !isP1);
  const isLoser =
    (matchResult === 'P1_WIN' && !isP1) || (matchResult === 'P2_WIN' && isP1);
  const isDraw = matchResult === 'DRAW';

  // Handle beat sound effects and haptic vibration sync
  useEffect(() => {
    if (['ROCK', 'PAPER', 'SCISSOR'].includes(currentBeat)) {
      sound.playBeatTick(currentBeat);
    } else if (currentBeat === 'CLUTCH') {
      sound.playClutchLock(); // Plays heavy impact bass + executes navigator.vibrate(120) on mobile
    }
  }, [currentBeat]);

  // Handle victory / defeat audio
  useEffect(() => {
    if (status === 'EVALUATING') {
      if (isWinner || isDraw) {
        sound.playVictory();
      } else if (isLoser) {
        sound.playDefeat();
      }
    }
  }, [status, isWinner, isLoser, isDraw]);

  // Handle move card selection
  const handleSelectMove = (move) => {
    if (currentBeat === 'CLUTCH' || status === 'EVALUATING' || status === 'ROUND_COMPLETE') {
      return; // Locked!
    }
    sound.playClick();
    setSelectedMove(move);
    setLockedMove(move);
    onSubmitMove(move);
  };

  // Determine gesture displayed by local player
  let localDisplayedGesture = 'rock';
  if (status === 'EVALUATING' || status === 'ROUND_COMPLETE') {
    localDisplayedGesture = localRevealedMove || selectedMove || 'rock';
  } else if (currentBeat === 'CLUTCH') {
    localDisplayedGesture = selectedMove || 'rock';
  } else {
    localDisplayedGesture = 'rock'; // Neutral combat fist during rock/paper/scissor
  }

  // Determine gesture displayed by opponent
  let opponentDisplayedGesture = 'rock';
  if (status === 'EVALUATING' || status === 'ROUND_COMPLETE') {
    opponentDisplayedGesture = opponentRevealedMove || 'rock';
  } else {
    opponentDisplayedGesture = 'rock';
  }

  // Shaking active during countdown beats
  const isShaking =
    status === 'COUNTDOWN' && ['ROCK', 'PAPER', 'SCISSOR'].includes(currentBeat);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col justify-between min-h-[calc(100vh-70px)] px-3 py-2 select-none relative overflow-hidden">
      {/* Background fiery battle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* TOP: OPPONENT HUD */}
      <div className="glass-panel rounded-2xl p-3 border border-red-500/30 flex items-center justify-between shadow-lg relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-3xl p-1.5 rounded-xl bg-red-950/60 border border-red-500/40 block">
              {opponentPlayerData?.avatar || '🤖'}
            </span>
            {opponentPlayerData?.isBot && (
              <span className="absolute -bottom-1 -right-1 text-[9px] font-black px-1 rounded bg-red-600 text-white uppercase">
                BOT
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm sm:text-base tracking-wide font-['Space_Grotesk',sans-serif]">
                {opponentPlayerData?.name || 'Searching...'}
              </span>
              {opponentPlayerData?.isSystemBot && (
                <span className="text-[10px] text-orange-400 font-bold px-1.5 rounded bg-orange-500/20 border border-orange-500/40">
                  CLUTCH_BOT
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              {opponentPlayerData?.studentId || 'Opponent Contender'}
            </p>
          </div>
        </div>

        {/* Opponent Lock Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 border border-zinc-800">
          {status === 'EVALUATING' ? (
            <span className="text-orange-400 uppercase font-bold text-[11px]">
              {opponentRevealedMove || 'ROCK'}
            </span>
          ) : currentMatch?.p1Move && currentMatch?.p2Move ? (
            <div className="flex items-center gap-1 text-green-400 text-[11px]">
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-zinc-500 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse"></span>
              <span>Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* CENTER ARENA: MIRRORED DUAL COMBAT HANDS */}
      <div className="flex-1 flex flex-col items-center justify-center relative py-2 my-auto">
        {/* Opponent Hand (Top, facing down) */}
        <div className="w-full flex justify-center -mb-6 sm:-mb-8 relative z-0">
          <HandIllustration
            gesture={opponentDisplayedGesture}
            isTop={true}
            isShaking={isShaking}
            label={status === 'EVALUATING' ? (opponentRevealedMove || 'rock') : ''}
          />
        </div>

        {/* Synchronized Beat & Result Overlay */}
        <div className="my-2 relative z-20 flex flex-col items-center justify-center">
          {status === 'COUNTDOWN' && (
            <div className="flex flex-col items-center gap-1.5">
              <div
                key={currentBeat}
                className={`px-6 py-2.5 rounded-2xl font-black font-['Orbitron',sans-serif] tracking-widest text-2xl sm:text-3xl shadow-2xl transition-all transform duration-150 ${
                  currentBeat === 'CLUTCH'
                    ? 'bg-gradient-to-r from-[#FF5500] via-[#FF9F1C] to-[#FF5500] text-black scale-125 shadow-[0_0_40px_rgba(255,85,0,0.9)] animate-pulse'
                    : currentBeat === 'SCISSOR'
                    ? 'bg-zinc-900 border-2 border-orange-400 text-orange-400 scale-110 shadow-[0_0_25px_rgba(255,140,0,0.5)]'
                    : currentBeat === 'PAPER'
                    ? 'bg-zinc-900 border-2 border-amber-400 text-amber-400 scale-105'
                    : 'bg-zinc-900 border-2 border-zinc-500 text-white'
                }`}
              >
                {currentBeat === 'CLUTCH' ? '⚡ CLUTCH! ⚡' : currentBeat}
              </div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                {currentBeat === 'CLUTCH' ? 'CHOICES LOCKED!' : 'BEAT COUNTDOWN'}
              </p>
            </div>
          )}

          {/* Evaluating / Result State */}
          {status === 'EVALUATING' && (
            <div className="animate-bounce">
              {isWinner && (
                <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-['Orbitron',sans-serif] font-black text-xl sm:text-2xl text-center shadow-[0_0_35px_rgba(34,197,94,0.7)] border-2 border-green-300">
                  🏆 VICTORY!
                  <p className="text-xs font-semibold tracking-wider uppercase mt-0.5 text-green-100">
                    Advancing to Round {round + 1}
                  </p>
                </div>
              )}
              {isDraw && (
                <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-['Orbitron',sans-serif] font-black text-xl sm:text-2xl text-center shadow-[0_0_35px_rgba(245,158,11,0.7)] border-2 border-amber-300">
                  ⚡ DRAW!
                  <p className="text-xs font-semibold tracking-wider uppercase mt-0.5 text-amber-100">
                    Both Contenders Qualify!
                  </p>
                </div>
              )}
              {isLoser && (
                <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-['Orbitron',sans-serif] font-black text-xl sm:text-2xl text-center shadow-[0_0_35px_rgba(239,68,68,0.7)] border-2 border-red-300">
                  💀 ELIMINATED!
                  <p className="text-xs font-semibold tracking-wider uppercase mt-0.5 text-red-100">
                    Transitioning to Spectator Arena
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Local Player Hand (Bottom, facing up) */}
        <div className="w-full flex justify-center -mt-6 sm:-mt-8 relative z-0">
          <HandIllustration
            gesture={localDisplayedGesture}
            isTop={false}
            isShaking={isShaking}
            label={status === 'EVALUATING' ? (localRevealedMove || selectedMove || 'rock') : ''}
          />
        </div>
      </div>

      {/* BOTTOM: LOCAL PLAYER HUD & THUMB-FRIENDLY RPS DECK */}
      <div className="space-y-3 relative z-10">
        {/* Local Player Info Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/60 border border-orange-500/30 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentPlayer?.avatar || '🔥'}</span>
            <span className="font-bold text-white tracking-wide">{currentPlayer?.name} (YOU)</span>
          </div>
          <div className="flex items-center gap-1.5">
            {lockedMove ? (
              <span className="flex items-center gap-1 text-green-400 font-bold uppercase text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Selected: {lockedMove}
              </span>
            ) : (
              <span className="text-orange-400 font-semibold animate-pulse text-[11px]">
                Pick your gesture!
              </span>
            )}
          </div>
        </div>

        {/* Floating Thumb-Friendly Action Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* STONE / ROCK */}
          <button
            type="button"
            onClick={() => handleSelectMove('rock')}
            disabled={currentBeat === 'CLUTCH' || status === 'EVALUATING'}
            className={`py-3 sm:py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer border-2 ${
              selectedMove === 'rock'
                ? 'bg-gradient-to-b from-orange-500/40 to-orange-600/20 border-[#FF5500] scale-105 shadow-[0_0_20px_rgba(255,85,0,0.6)]'
                : 'bg-zinc-900/90 border-zinc-700 hover:border-orange-500/50 hover:bg-zinc-800'
            }`}
          >
            <span className="text-2xl sm:text-3xl">🪨</span>
            <span className="text-xs sm:text-sm font-extrabold font-['Space_Grotesk',sans-serif] tracking-wider uppercase text-white">
              STONE
            </span>
          </button>

          {/* PAPER */}
          <button
            type="button"
            onClick={() => handleSelectMove('paper')}
            disabled={currentBeat === 'CLUTCH' || status === 'EVALUATING'}
            className={`py-3 sm:py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer border-2 ${
              selectedMove === 'paper'
                ? 'bg-gradient-to-b from-orange-500/40 to-orange-600/20 border-[#FF5500] scale-105 shadow-[0_0_20px_rgba(255,85,0,0.6)]'
                : 'bg-zinc-900/90 border-zinc-700 hover:border-orange-500/50 hover:bg-zinc-800'
            }`}
          >
            <span className="text-2xl sm:text-3xl">📄</span>
            <span className="text-xs sm:text-sm font-extrabold font-['Space_Grotesk',sans-serif] tracking-wider uppercase text-white">
              PAPER
            </span>
          </button>

          {/* SCISSOR */}
          <button
            type="button"
            onClick={() => handleSelectMove('scissors')}
            disabled={currentBeat === 'CLUTCH' || status === 'EVALUATING'}
            className={`py-3 sm:py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer border-2 ${
              selectedMove === 'scissors'
                ? 'bg-gradient-to-b from-orange-500/40 to-orange-600/20 border-[#FF5500] scale-105 shadow-[0_0_20px_rgba(255,85,0,0.6)]'
                : 'bg-zinc-900/90 border-zinc-700 hover:border-orange-500/50 hover:bg-zinc-800'
            }`}
          >
            <span className="text-2xl sm:text-3xl">✂️</span>
            <span className="text-xs sm:text-sm font-extrabold font-['Space_Grotesk',sans-serif] tracking-wider uppercase text-white">
              SCISSOR
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
