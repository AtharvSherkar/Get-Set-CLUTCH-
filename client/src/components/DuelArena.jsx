// client/src/components/DuelArena.jsx
import React, { useState, useEffect, useRef } from 'react';
import HandIllustration from './HandIllustration';
import { sound } from '../utils/audio';
import { Shield, Zap, CheckCircle2, Lock, Flame } from 'lucide-react';

export default function DuelArena({
  socket,
  currentMatch,
  currentPlayer,
  tournamentState,
  onSubmitMove
}) {
  const [selectedMove, setSelectedMove] = useState(null);
  const [lockedMove, setLockedMove] = useState(null);
  const [clutchShake, setClutchShake] = useState(false);
  const [handsRevealed, setHandsRevealed] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [activeBeat, setActiveBeat] = useState(null);

  // Derive current beat directly from active real-time socket event or server state
  const currentBeat = activeBeat || tournamentState?.currentBeat || 'READY';
  const status =
    tournamentState?.status === 'EVALUATING' || tournamentState?.status === 'ROUND_COMPLETE'
      ? tournamentState.status
      : activeBeat
      ? 'COUNTDOWN'
      : tournamentState?.status || 'COUNTDOWN';
  const round = tournamentState?.round || 1;

  // Reset local beat and selection when round changes or matchmaking begins
  useEffect(() => {
    if (tournamentState?.status === 'MATCHMAKING') {
      setActiveBeat(null);
      setSelectedMove(null);
      setLockedMove(null);
      setShowOutcome(false);
      setHandsRevealed(false);
    }
  }, [tournamentState?.status, tournamentState?.round]);

  // Real-time millisecond-precise Socket Synchronizer for 4-Beat Countdown
  useEffect(() => {
    if (!socket) return;
    const handleBeat = (data) => {
      setActiveBeat(data.beat);
      if (['ROCK', 'PAPER', 'SCISSOR'].includes(data.beat)) {
        sound.playBeat(data.beat);
        setHandsRevealed(false);
        setShowOutcome(false);
      } else if (data.beat === 'CLUTCH') {
        sound.playBeat('CLUTCH');
        if (navigator.vibrate) navigator.vibrate(180);
        setClutchShake(true);
        setTimeout(() => setClutchShake(false), 600);
        setHandsRevealed(false);
        setTimeout(() => setHandsRevealed(true), 280);
      }
    };
    socket.on('countdown_beat', handleBeat);
    return () => socket.off('countdown_beat', handleBeat);
  }, [socket]);

  // Fallback if socket event missed: sync from tournamentState
  useEffect(() => {
    const serverBeat = tournamentState?.currentBeat;
    if (serverBeat && ['ROCK', 'PAPER', 'SCISSOR', 'CLUTCH'].includes(serverBeat)) {
      if (activeBeat !== serverBeat) {
        sound.playBeat(serverBeat);
        setActiveBeat(serverBeat);
        if (serverBeat === 'CLUTCH') {
          if (navigator.vibrate) navigator.vibrate(180);
          setClutchShake(true);
          setTimeout(() => setClutchShake(false), 600);
          setHandsRevealed(false);
          setTimeout(() => setHandsRevealed(true), 280);
        } else {
          setHandsRevealed(false);
          setShowOutcome(false);
        }
      }
    }
  }, [tournamentState?.currentBeat, activeBeat]);

  // Determine which player is local vs opponent
  const isP1 = currentMatch?.player1?.id === currentPlayer?.id;
  const localPlayerData = isP1 ? currentMatch?.player1 : currentMatch?.player2;
  const opponentPlayerData = isP1 ? currentMatch?.player2 : currentMatch?.player1;

  // Moves revealed during evaluation / on CLUTCH
  const localRevealedMove = isP1 ? currentMatch?.p1Move : currentMatch?.p2Move;
  const opponentRevealedMove = isP1 ? currentMatch?.p2Move : currentMatch?.p1Move;

  // Match outcome
  const matchResult = currentMatch?.result;
  const isWinner =
    (matchResult === 'P1_WIN' && isP1) || (matchResult === 'P2_WIN' && !isP1);
  const isLoser =
    (matchResult === 'P1_WIN' && !isP1) || (matchResult === 'P2_WIN' && isP1);
  const isDraw = matchResult === 'DRAW';

  // Inputs are locked definitively on the CLUTCH beat or during evaluation/round completion
  const isInputLocked = currentBeat === 'CLUTCH' || status === 'EVALUATING' || status === 'ROUND_COMPLETE';

  // Post-"CLUTCH" Outcome Reveal Timing:
  // ONLY after "CLUTCH" has flashed and hands have opened does the match outcome display
  useEffect(() => {
    if (status === 'EVALUATING') {
      if (handsRevealed) {
        const timer = setTimeout(() => {
          setShowOutcome(true);
        }, 120);
        return () => clearTimeout(timer);
      } else {
        setHandsRevealed(true);
        const timer = setTimeout(() => {
          setShowOutcome(true);
        }, 320);
        return () => clearTimeout(timer);
      }
    } else if (status === 'COUNTDOWN') {
      setShowOutcome(false);
    }
  }, [status, handsRevealed]);

  // Victory / defeat sound upon outcome display
  useEffect(() => {
    if (showOutcome && status === 'EVALUATING') {
      if (isWinner || isDraw) {
        sound.playVictory();
      } else if (isLoser) {
        sound.playDefeat();
      }
    }
  }, [showOutcome, status, isWinner, isLoser, isDraw]);

  // Handle move selection (pre-selection allowed, locks on CLUTCH)
  const handleSelectMove = (move) => {
    if (isInputLocked) {
      return; // Locked!
    }
    sound.playClick();
    setSelectedMove(move);
    setLockedMove(move);
    onSubmitMove(move);
  };

  // Determine gesture displayed by local player
  // During ROCK -> PAPER -> SCISSOR and initial hold of CLUTCH: closed-fist neutral rock
  // On reveal (after micro-beat hold of CLUTCH or during evaluation): morph to actual selection
  let localDisplayedGesture = 'rock';
  if (handsRevealed || status === 'EVALUATING' || status === 'ROUND_COMPLETE') {
    localDisplayedGesture = localRevealedMove || selectedMove || 'rock';
  } else {
    localDisplayedGesture = 'rock';
  }

  // Determine gesture displayed by opponent
  let opponentDisplayedGesture = 'rock';
  if (handsRevealed || status === 'EVALUATING' || status === 'ROUND_COMPLETE') {
    opponentDisplayedGesture = opponentRevealedMove || 'rock';
  } else {
    opponentDisplayedGesture = 'rock';
  }

  // Both hands bump vertically during beats 1, 2, and 3
  const isShaking =
    status === 'COUNTDOWN' && ['ROCK', 'PAPER', 'SCISSOR'].includes(currentBeat);

  return (
    <div className={`w-full max-w-lg mx-auto flex flex-col justify-between min-h-[calc(100vh-70px)] px-3 py-2 select-none relative overflow-hidden ${clutchShake ? 'animate-micro-shake' : ''}`}>
      {/* Background fiery battle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Explosive visual shockwave on CLUTCH! lock-in beat */}
      {currentBeat === 'CLUTCH' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-20">
          <div className="w-56 h-56 rounded-full border-4 border-[#FF5500] bg-orange-500/20 animate-shockwave-1 shadow-[0_0_60px_rgba(255,85,0,0.9)]"></div>
          <div className="w-56 h-56 rounded-full border-2 border-amber-400 bg-amber-500/10 animate-shockwave-2 shadow-[0_0_90px_rgba(255,159,28,0.7)]"></div>
        </div>
      )}

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
          {showOutcome ? (
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
        {/* Opponent Hand (Top, facing down) - Bumps vertically downwards on beats 1, 2, 3 */}
        <div
          key={`opp-hand-${currentBeat}`}
          className={`w-full flex justify-center -mb-6 sm:-mb-8 relative z-0 ${
            isShaking ? 'animate-bump-down' : ''
          } ${handsRevealed && (currentBeat === 'CLUTCH' || status === 'EVALUATING') ? 'animate-hand-snap' : ''}`}
        >
          <HandIllustration
            gesture={opponentDisplayedGesture}
            isTop={true}
            isShaking={isShaking}
            label={showOutcome ? (opponentRevealedMove || 'rock') : ''}
          />
        </div>

        {/* CENTER TYPOGRAPHY & BEAT POPUP CONTAINER (Directly between top & bottom hands) */}
        <div className="my-2 relative z-30 flex flex-col items-center justify-center min-h-[110px]">
          {/* Matchmaking Standby Message (No countdown timer numbers) */}
          {status === 'MATCHMAKING' && (
            <div className="pointer-events-none px-4 py-2 rounded-2xl bg-black/80 border border-orange-500/50 backdrop-blur-sm shadow-[0_0_20px_rgba(255,85,0,0.3)] animate-pulse">
              <span className="font-bold font-['Space_Grotesk',sans-serif] text-orange-400 tracking-wider uppercase text-xs sm:text-sm">
                ⚔️ Contenders Ready — Stand By...
              </span>
            </div>
          )}

          {/* RHYTHM TRACKER: ROCK - PAPER - SCISSOR - CLUTCH (Pure words, NO 1 2 3) */}
          {status === 'COUNTDOWN' && (
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 select-none pointer-events-none">
              {['ROCK', 'PAPER', 'SCISSOR', 'CLUTCH'].map((b) => {
                const isCurrent = currentBeat === b;
                const beatOrder = ['ROCK', 'PAPER', 'SCISSOR', 'CLUTCH'];
                const isPassed = beatOrder.indexOf(currentBeat) >= beatOrder.indexOf(b);
                return (
                  <span
                    key={`track-${b}`}
                    className={`px-2.5 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase font-['Orbitron',sans-serif] transition-all duration-150 ${
                      isCurrent
                        ? b === 'CLUTCH'
                          ? 'bg-[#FF5500] text-white shadow-[0_0_18px_rgba(255,85,0,0.9)] scale-110 border border-orange-300'
                          : 'bg-white text-black shadow-[0_0_14px_rgba(255,255,255,0.9)] scale-105 border border-white'
                        : isPassed
                        ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        : 'bg-zinc-900/60 text-zinc-600 border border-zinc-800'
                    }`}
                  >
                    {b === 'CLUTCH' ? '⚡ CLUTCH' : b}
                  </span>
                );
              })}
            </div>
          )}

          {/* DYNAMIC BEAT WORDS POPUP (ROCK -> PAPER -> SCISSOR -> CLUTCH!) */}
          {status === 'COUNTDOWN' && ['ROCK', 'PAPER', 'SCISSOR', 'CLUTCH'].includes(currentBeat) && (
            <div
              key={`popup-word-${currentBeat}`}
              className="pointer-events-none flex flex-col items-center justify-center select-none"
            >
              {currentBeat === 'ROCK' && (
                <div className="animate-word-popup px-6 py-2 sm:px-9 sm:py-2.5 rounded-2xl bg-black/90 border-2 border-white/80 shadow-[0_0_35px_rgba(255,255,255,0.7)] flex items-center gap-3 backdrop-blur-md">
                  <span className="text-3xl sm:text-4xl">🪨</span>
                  <span className="font-black font-['Orbitron',sans-serif] tracking-widest text-3xl sm:text-5xl text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
                    ROCK
                  </span>
                </div>
              )}

              {currentBeat === 'PAPER' && (
                <div className="animate-word-popup px-6 py-2 sm:px-9 sm:py-2.5 rounded-2xl bg-black/90 border-2 border-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.7)] flex items-center gap-3 backdrop-blur-md">
                  <span className="text-3xl sm:text-4xl">📄</span>
                  <span className="font-black font-['Orbitron',sans-serif] tracking-widest text-3xl sm:text-5xl text-sky-300 drop-shadow-[0_0_20px_rgba(56,189,248,0.9)]">
                    PAPER
                  </span>
                </div>
              )}

              {currentBeat === 'SCISSOR' && (
                <div className="animate-word-popup px-6 py-2 sm:px-9 sm:py-2.5 rounded-2xl bg-black/90 border-2 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.7)] flex items-center gap-3 backdrop-blur-md">
                  <span className="text-3xl sm:text-4xl">✂️</span>
                  <span className="font-black font-['Orbitron',sans-serif] tracking-widest text-3xl sm:text-5xl text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]">
                    SCISSOR
                  </span>
                </div>
              )}

              {currentBeat === 'CLUTCH' && (
                <div className="animate-clutch-popup px-6 py-2.5 sm:px-10 sm:py-3 rounded-3xl bg-black/95 border-3 border-[#FF5500] shadow-[0_0_60px_rgba(255,85,0,1)] flex flex-col items-center justify-center backdrop-blur-md">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-4xl animate-bounce">⚡</span>
                    <span className="font-black font-['Orbitron',sans-serif] tracking-widest text-4xl sm:text-6xl text-[#FF5500] drop-shadow-[0_0_40px_rgba(255,85,0,1)]">
                      CLUTCH!
                    </span>
                    <span className="text-2xl sm:text-4xl animate-bounce">⚡</span>
                  </div>
                  <span className="text-[9px] sm:text-[11px] font-black tracking-widest uppercase font-mono text-orange-300 mt-0.5">
                    CHOICES LOCKED!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Post-"CLUTCH" Evaluation Outcome */}
          {status === 'EVALUATING' && showOutcome && (
            <div className="animate-outcome-pop">
              {isWinner && (
                <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-['Orbitron',sans-serif] font-black text-xl sm:text-2xl text-center shadow-[0_0_35px_rgba(34,197,94,0.7)] border-2 border-green-300">
                  🏆 VICTORY!
                  <p className="text-xs font-semibold tracking-wider uppercase mt-0.5 text-green-100 font-['Space_Grotesk',sans-serif]">
                    Advancing to Round {round + 1}
                  </p>
                </div>
              )}
              {isDraw && (
                <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-['Orbitron',sans-serif] font-black text-xl sm:text-2xl text-center shadow-[0_0_35px_rgba(245,158,11,0.7)] border-2 border-amber-300">
                  ⚡ DRAW!
                  <p className="text-xs font-semibold tracking-wider uppercase mt-0.5 text-amber-100 font-['Space_Grotesk',sans-serif]">
                    Both Contenders Qualify!
                  </p>
                </div>
              )}
              {isLoser && (
                <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-['Orbitron',sans-serif] font-black text-xl sm:text-2xl text-center shadow-[0_0_35px_rgba(239,68,68,0.7)] border-2 border-red-300">
                  💀 ELIMINATED!
                  <p className="text-xs font-semibold tracking-wider uppercase mt-0.5 text-red-100 font-['Space_Grotesk',sans-serif]">
                    Transitioning to Spectator Arena
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Local Player Hand (Bottom, facing up) - Bumps vertically upwards on beats 1, 2, 3 */}
        <div
          key={`local-hand-${currentBeat}`}
          className={`w-full flex justify-center -mt-6 sm:-mt-8 relative z-0 ${
            isShaking ? 'animate-bump-up' : ''
          } ${handsRevealed && (currentBeat === 'CLUTCH' || status === 'EVALUATING') ? 'animate-hand-snap' : ''}`}
        >
          <HandIllustration
            gesture={localDisplayedGesture}
            isTop={false}
            isShaking={isShaking}
            label={showOutcome ? (localRevealedMove || selectedMove || 'rock') : ''}
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
            {isInputLocked ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 font-mono font-bold uppercase text-[10px]">
                <Lock className="w-3 h-3 text-orange-400" />
                CHOICES LOCKED AT CLUTCH!
              </span>
            ) : lockedMove ? (
              <span className="flex items-center gap-1 text-green-400 font-bold uppercase text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Selected: {lockedMove.toUpperCase()}
              </span>
            ) : (
              <span className="text-orange-400 font-semibold animate-pulse text-[11px]">
                Pick your gesture before CLUTCH!
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
            disabled={isInputLocked}
            className={`py-3 sm:py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 border-2 ${
              isInputLocked
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
            } ${
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
            disabled={isInputLocked}
            className={`py-3 sm:py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 border-2 ${
              isInputLocked
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
            } ${
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
            disabled={isInputLocked}
            className={`py-3 sm:py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 border-2 ${
              isInputLocked
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
            } ${
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
