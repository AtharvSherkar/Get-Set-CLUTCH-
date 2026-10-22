// client/src/components/DuelArena.jsx
import React, { useState, useEffect, useRef } from 'react';
import HandIllustration from './HandIllustration';
import { sound } from '../utils/audio';
import { Shield, Zap, CheckCircle2, Lock, Flame, Clock } from 'lucide-react';

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

  // Selection window state (guaranteed 5-second post-countdown window)
  const [selectionActive, setSelectionActive] = useState(false);
  const [selectionRemaining, setSelectionRemaining] = useState(5);
  const [selectionDeadline, setSelectionDeadline] = useState(null);
  const [smoothRemainingMs, setSmoothRemainingMs] = useState(5000);

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
      setSelectionActive(false);
      setSelectionRemaining(5);
      setSelectionDeadline(null);
      setSmoothRemainingMs(5000);
    }
  }, [tournamentState?.status, tournamentState?.round]);

  // Real-time millisecond-precise Socket Synchronizer for 4-Beat Countdown & 5s Selection Window
  useEffect(() => {
    if (!socket) return;

    const handleBeat = (data) => {
      setActiveBeat(data.beat);
      if (['ROCK', 'PAPER', 'SCISSOR'].includes(data.beat)) {
        sound.playBeat(data.beat);
        setHandsRevealed(false);
        setShowOutcome(false);
        setSelectionActive(false);
      } else if (data.beat === 'CLUTCH') {
        sound.playBeat('CLUTCH');
        if (navigator.vibrate) navigator.vibrate(180);
        setClutchShake(true);
        setTimeout(() => setClutchShake(false), 600);
        setHandsRevealed(false);
        setSelectionActive(false);
      }
    };

    const handleSelectionStart = (data) => {
      setActiveBeat('DECISION');
      setSelectionActive(true);
      const secs = data.seconds || 5;
      setSelectionRemaining(secs);
      const deadline = data.deadline || (Date.now() + 5000);
      setSelectionDeadline(deadline);
      setSmoothRemainingMs(5000);
      sound.playClick();
    };

    const handleSelectionTick = (data) => {
      setActiveBeat('DECISION');
      setSelectionActive(true);
      setSelectionRemaining(data.remaining);
      if (data.deadline) setSelectionDeadline(data.deadline);
      if (data.remaining <= 3 && data.remaining > 0) {
        sound.playClick();
      }
    };

    const handleSelectionEnd = () => {
      setActiveBeat('LOCKED');
      setSelectionActive(false);
      setSelectionRemaining(0);
      setSelectionDeadline(null);
      setSmoothRemainingMs(0);
      setHandsRevealed(true);
    };

    socket.on('countdown_beat', handleBeat);
    socket.on('selection_window_start', handleSelectionStart);
    socket.on('selection_tick', handleSelectionTick);
    socket.on('selection_window_end', handleSelectionEnd);

    return () => {
      socket.off('countdown_beat', handleBeat);
      socket.off('selection_window_start', handleSelectionStart);
      socket.off('selection_tick', handleSelectionTick);
      socket.off('selection_window_end', handleSelectionEnd);
    };
  }, [socket]);

  // Fallback sync from tournamentState
  useEffect(() => {
    const serverBeat = tournamentState?.currentBeat;
    if (serverBeat === 'DECISION') {
      setActiveBeat('DECISION');
      setSelectionActive(true);
      if (tournamentState.selectionTimeLeft !== undefined) {
        setSelectionRemaining(tournamentState.selectionTimeLeft);
      }
      if (tournamentState.selectionDeadline) {
        setSelectionDeadline(tournamentState.selectionDeadline);
      }
    } else if (serverBeat === 'LOCKED') {
      setActiveBeat('LOCKED');
      setSelectionActive(false);
      setSelectionRemaining(0);
    } else if (serverBeat && ['ROCK', 'PAPER', 'SCISSOR', 'CLUTCH'].includes(serverBeat)) {
      if (activeBeat !== serverBeat) {
        sound.playBeat(serverBeat);
        setActiveBeat(serverBeat);
        setSelectionActive(false);
        if (serverBeat === 'CLUTCH') {
          if (navigator.vibrate) navigator.vibrate(180);
          setClutchShake(true);
          setTimeout(() => setClutchShake(false), 600);
        } else {
          setHandsRevealed(false);
          setShowOutcome(false);
        }
      }
    }
  }, [tournamentState?.currentBeat, tournamentState?.selectionTimeLeft, tournamentState?.selectionDeadline, activeBeat]);

  // Smooth 60fps countdown progress bar during the 5-second selection window
  useEffect(() => {
    if (!selectionActive && currentBeat !== 'DECISION') {
      return;
    }
    let animId;
    const tick = () => {
      const now = Date.now();
      const targetDeadline = selectionDeadline || (now + 5000);
      const remaining = Math.max(0, targetDeadline - now);
      setSmoothRemainingMs(remaining);
      if (remaining > 0 && (selectionActive || currentBeat === 'DECISION')) {
        animId = requestAnimationFrame(tick);
      }
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [selectionActive, selectionDeadline, currentBeat]);

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

  // Inputs are locked ONLY when currentBeat === 'LOCKED' or during evaluation/round completion
  // (During ROCK... PAPER... SCISSOR... CLUTCH! and the 5-second DECISION phase, inputs are fully available!)
  const isInputLocked =
    currentBeat === 'LOCKED' ||
    status === 'EVALUATING' ||
    status === 'ROUND_COMPLETE';

  // Post-Evaluation Outcome Reveal Timing
  useEffect(() => {
    if (status === 'EVALUATING') {
      setHandsRevealed(true);
      const timer = setTimeout(() => {
        setShowOutcome(true);
      }, 250);
      return () => clearTimeout(timer);
    } else if (status === 'COUNTDOWN') {
      setShowOutcome(false);
    }
  }, [status]);

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

  // Handle move selection (allowed during countdown & throughout 5s selection window)
  const handleSelectMove = (move) => {
    if (isInputLocked) {
      return; // Locked!
    }
    sound.playClick();
    setSelectedMove(move);
    setLockedMove(move);
    onSubmitMove(move);
  };

  // Determine gestures displayed
  let localDisplayedGesture = 'rock';
  if (handsRevealed || status === 'EVALUATING' || status === 'ROUND_COMPLETE') {
    localDisplayedGesture = localRevealedMove || selectedMove || 'rock';
  } else {
    localDisplayedGesture = 'rock';
  }

  let opponentDisplayedGesture = 'rock';
  if (handsRevealed || status === 'EVALUATING' || status === 'ROUND_COMPLETE') {
    opponentDisplayedGesture = opponentRevealedMove || 'rock';
  } else {
    opponentDisplayedGesture = 'rock';
  }

  // Both hands bump vertically during beats 1, 2, and 3
  const isShaking =
    status === 'COUNTDOWN' && ['ROCK', 'PAPER', 'SCISSOR'].includes(currentBeat);

  // Progress percentage for 5-second timer bar
  const progressPercent = Math.min(100, Math.max(0, (smoothRemainingMs / 5000) * 100));
  const displaySeconds = Math.max(1, Math.ceil(smoothRemainingMs / 1000));

  return (
    <div
      className={`w-full max-w-lg mx-auto flex flex-col justify-between h-[calc(100svh-4.25rem)] max-h-[calc(100dvh-4.25rem)] px-3 py-1.5 select-none relative overflow-hidden ${
        clutchShake ? 'animate-micro-shake' : ''
      }`}
    >
      {/* Background fiery battle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Explosive visual shockwave on CLUTCH! beat */}
      {currentBeat === 'CLUTCH' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-20">
          <div className="w-56 h-56 rounded-full border-4 border-[#FF5500] bg-orange-500/20 animate-shockwave-1 shadow-[0_0_60px_rgba(255,85,0,0.9)]"></div>
          <div className="w-56 h-56 rounded-full border-2 border-amber-400 bg-amber-500/10 animate-shockwave-2 shadow-[0_0_90px_rgba(255,159,28,0.7)]"></div>
        </div>
      )}

      {/* TOP: OPPONENT HUD (Compact, fixed height) */}
      <div className="glass-panel rounded-2xl p-2 sm:p-2.5 border border-red-500/30 flex items-center justify-between shadow-lg relative z-10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="text-2xl sm:text-3xl p-1 rounded-xl bg-red-950/60 border border-red-500/40 block">
              {opponentPlayerData?.avatar || '🤖'}
            </span>
            {opponentPlayerData?.isBot && (
              <span className="absolute -bottom-1 -right-1 text-[8px] font-black px-1 rounded bg-red-600 text-white uppercase">
                BOT
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-xs sm:text-sm tracking-wide font-['Space_Grotesk',sans-serif]">
                {opponentPlayerData?.name || 'Searching...'}
              </span>
              {opponentPlayerData?.isSystemBot && (
                <span className="text-[9px] text-orange-400 font-bold px-1 rounded bg-orange-500/20 border border-orange-500/40">
                  CLUTCH_BOT
                </span>
              )}
            </div>
            <p className="text-[9px] text-zinc-400 font-mono">
              Opponent
            </p>
          </div>
        </div>

        {/* Opponent Lock Status */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-black/60 border border-zinc-800">
          {showOutcome ? (
            <span className="text-orange-400 uppercase font-bold text-[10px]">
              {opponentRevealedMove || 'ROCK'}
            </span>
          ) : currentMatch?.p1Move && currentMatch?.p2Move ? (
            <div className="flex items-center gap-1 text-green-400 text-[10px]">
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse"></span>
              <span>Thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* CENTER ARENA: MIRRORED DUAL COMBAT HANDS & DYNAMIC BEAT/TIMER OVERLAY */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-0.5 overflow-hidden">
        {/* Opponent Hand (Top, facing down) */}
        <div
          key={`opp-hand-${currentBeat}`}
          className={`w-full flex justify-center -mb-4 sm:-mb-6 relative z-0 flex-shrink ${
            isShaking ? 'animate-bump-down' : ''
          } ${handsRevealed && (status === 'EVALUATING' || currentBeat === 'LOCKED') ? 'animate-hand-snap' : ''}`}
        >
          <HandIllustration
            gesture={opponentDisplayedGesture}
            isTop={true}
            isShaking={isShaking}
            isClutch={handsRevealed && (currentBeat === 'CLUTCH' || status === 'EVALUATING')}
            label={showOutcome ? (opponentRevealedMove || 'rock') : ''}
          />
        </div>

        {/* CENTER TYPOGRAPHY & COUNTDOWN / SELECTION TIMER CONTAINER */}
        <div className="my-1 relative z-30 flex flex-col items-center justify-center min-h-[64px] sm:min-h-[85px] w-full max-w-sm px-2">
          {/* Matchmaking Standby Message */}
          {status === 'MATCHMAKING' && (
            <div className="pointer-events-none px-3.5 py-1.5 rounded-xl bg-black/80 border border-orange-500/50 backdrop-blur-sm shadow-[0_0_20px_rgba(255,85,0,0.3)] animate-pulse">
              <span className="font-bold font-['Space_Grotesk',sans-serif] text-orange-400 tracking-wider uppercase text-[11px] sm:text-xs">
                ⚔️ Contenders Ready — Stand By...
              </span>
            </div>
          )}

          {/* RHYTHM TRACKER: ROCK - PAPER - SCISSOR - CLUTCH */}
          {status === 'COUNTDOWN' && ['ROCK', 'PAPER', 'SCISSOR', 'CLUTCH'].includes(currentBeat) && (
            <div className="flex items-center gap-1 sm:gap-1.5 mb-1 select-none pointer-events-none">
              {['ROCK', 'PAPER', 'SCISSOR', 'CLUTCH'].map((b) => {
                const isCurrent = currentBeat === b;
                const beatOrder = ['ROCK', 'PAPER', 'SCISSOR', 'CLUTCH'];
                const isPassed = beatOrder.indexOf(currentBeat) >= beatOrder.indexOf(b);
                return (
                  <span
                    key={`track-${b}`}
                    className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider uppercase font-['Orbitron',sans-serif] transition-all duration-150 ${
                      isCurrent
                        ? b === 'CLUTCH'
                          ? 'bg-[#FF5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.9)] scale-105 border border-orange-300'
                          : 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.9)] scale-105 border border-white'
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

          {/* DYNAMIC BEAT WORDS POPUP DURING COUNTDOWN */}
          {status === 'COUNTDOWN' && ['ROCK', 'PAPER', 'SCISSOR', 'CLUTCH'].includes(currentBeat) && (
            <div
              key={`popup-word-${currentBeat}`}
              className="pointer-events-none flex flex-col items-center justify-center select-none"
            >
              {currentBeat === 'ROCK' && (
                <div className="animate-word-popup px-5 py-1.5 sm:px-7 sm:py-2 rounded-2xl bg-black/90 border-2 border-white/80 shadow-[0_0_30px_rgba(255,255,255,0.7)] flex items-center gap-2.5 backdrop-blur-md">
                  <span className="text-2xl sm:text-3xl">🪨</span>
                  <span className="font-black font-['Orbitron',sans-serif] tracking-widest text-2xl sm:text-4xl text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
                    ROCK
                  </span>
                </div>
              )}

              {currentBeat === 'PAPER' && (
                <div className="animate-word-popup px-5 py-1.5 sm:px-7 sm:py-2 rounded-2xl bg-black/90 border-2 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.7)] flex items-center gap-2.5 backdrop-blur-md">
                  <span className="text-2xl sm:text-3xl">📄</span>
                  <span className="font-black font-['Orbitron',sans-serif] tracking-widest text-2xl sm:text-4xl text-sky-300 drop-shadow-[0_0_20px_rgba(56,189,248,0.9)]">
                    PAPER
                  </span>
                </div>
              )}

              {currentBeat === 'SCISSOR' && (
                <div className="animate-word-popup px-5 py-1.5 sm:px-7 sm:py-2 rounded-2xl bg-black/90 border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.7)] flex items-center gap-2.5 backdrop-blur-md">
                  <span className="text-2xl sm:text-3xl">✂️</span>
                  <span className="font-black font-['Orbitron',sans-serif] tracking-widest text-2xl sm:text-4xl text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]">
                    SCISSOR
                  </span>
                </div>
              )}

              {currentBeat === 'CLUTCH' && (
                <div className="animate-clutch-popup px-5 py-1.5 sm:px-8 sm:py-2 rounded-2xl bg-black/95 border-2 border-[#FF5500] shadow-[0_0_50px_rgba(255,85,0,1)] flex items-center gap-2 backdrop-blur-md">
                  <span className="text-xl sm:text-2xl animate-bounce">⚡</span>
                  <span className="font-black font-['Orbitron',sans-serif] tracking-widest text-3xl sm:text-5xl text-[#FF5500] drop-shadow-[0_0_35px_rgba(255,85,0,1)]">
                    CLUTCH!
                  </span>
                  <span className="text-xl sm:text-2xl animate-bounce">⚡</span>
                </div>
              )}
            </div>
          )}

          {/* GUARANTEED 5-SECOND DECISION & GESTURE SELECTION WINDOW */}
          {(currentBeat === 'DECISION' || selectionActive) && status !== 'EVALUATING' && (
            <div className="w-full max-w-xs mx-auto flex flex-col items-center justify-center p-2 rounded-2xl bg-black/90 border-2 border-orange-500/80 shadow-[0_0_30px_rgba(255,85,0,0.5)] backdrop-blur-md">
              <div className="flex items-center justify-between w-full px-1 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider font-mono text-orange-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
                  <span>CHOOSE GESTURE</span>
                </span>
                <span
                  className={`text-sm sm:text-base font-black font-['Orbitron',sans-serif] px-2 py-0.5 rounded-lg shadow-sm ${
                    displaySeconds <= 2
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-orange-500 text-black'
                  }`}
                >
                  {displaySeconds}s
                </span>
              </div>

              {/* Glowing Dynamic Progress Bar */}
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                <div
                  className={`h-full transition-all duration-75 rounded-full ${
                    displaySeconds > 3
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                      : displaySeconds === 2
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                      : 'bg-gradient-to-r from-orange-500 to-red-600 animate-pulse'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-1 text-[10px] text-zinc-300 font-semibold tracking-wide text-center">
                {selectedMove ? (
                  <span className="text-green-400 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Locked: {selectedMove.toUpperCase()} (tap to switch)
                  </span>
                ) : (
                  <span className="text-amber-300 animate-pulse">
                    Tap Stone, Paper, or Scissor below!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* LOCKED BEAT NOTICE */}
          {currentBeat === 'LOCKED' && status !== 'EVALUATING' && (
            <div className="px-4 py-1.5 rounded-xl bg-black/90 border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.7)] flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-red-400 animate-bounce" />
              <span className="font-['Orbitron',sans-serif] font-black text-xs text-red-300 tracking-wider uppercase">
                CHOICES LOCKED!
              </span>
            </div>
          )}

          {/* Post-"CLUTCH" Evaluation Outcome */}
          {status === 'EVALUATING' && showOutcome && (
            <div className="animate-outcome-pop">
              {isWinner && (
                <div className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-['Orbitron',sans-serif] font-black text-lg sm:text-xl text-center shadow-[0_0_35px_rgba(34,197,94,0.7)] border-2 border-green-300">
                  🏆 VICTORY!
                  <p className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase mt-0.5 text-green-100 font-['Space_Grotesk',sans-serif]">
                    Advancing to Round {round + 1}
                  </p>
                </div>
              )}
              {isDraw && (
                <div className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-['Orbitron',sans-serif] font-black text-lg sm:text-xl text-center shadow-[0_0_35px_rgba(245,158,11,0.7)] border-2 border-amber-300">
                  ⚡ DRAW!
                  <p className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase mt-0.5 text-amber-100 font-['Space_Grotesk',sans-serif]">
                    Both Contenders Qualify!
                  </p>
                </div>
              )}
              {isLoser && (
                <div className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-['Orbitron',sans-serif] font-black text-lg sm:text-xl text-center shadow-[0_0_35px_rgba(239,68,68,0.7)] border-2 border-red-300">
                  💀 ELIMINATED!
                  <p className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase mt-0.5 text-red-100 font-['Space_Grotesk',sans-serif]">
                    Transitioning to Spectator Arena
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Local Player Hand (Bottom, facing up) */}
        <div
          key={`local-hand-${currentBeat}`}
          className={`w-full flex justify-center -mt-4 sm:-mt-6 relative z-0 flex-shrink ${
            isShaking ? 'animate-bump-up' : ''
          } ${handsRevealed && (status === 'EVALUATING' || currentBeat === 'LOCKED') ? 'animate-hand-snap' : ''}`}
        >
          <HandIllustration
            gesture={localDisplayedGesture}
            isTop={false}
            isShaking={isShaking}
            isClutch={handsRevealed && (currentBeat === 'CLUTCH' || status === 'EVALUATING')}
            label={showOutcome ? (localRevealedMove || selectedMove || 'rock') : ''}
          />
        </div>
      </div>

      {/* BOTTOM: LOCAL PLAYER HUD & STICKY THUMB-FRIENDLY RPS ACTION DECK */}
      <div className="flex-shrink-0 sticky bottom-0 z-30 pb-1 sm:pb-2 space-y-1.5">
        {/* Local Player Info Bar */}
        <div className="flex items-center justify-between px-3 py-1 rounded-xl bg-black/80 border border-orange-500/30 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">{currentPlayer?.avatar || '🔥'}</span>
            <span className="font-bold text-white tracking-wide text-xs">{currentPlayer?.name} (YOU)</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isInputLocked ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-mono font-bold uppercase text-[10px]">
                <Lock className="w-3 h-3 text-red-400" />
                CHOICES LOCKED
              </span>
            ) : selectedMove ? (
              <span className="flex items-center gap-1 text-green-400 font-bold uppercase text-[10px] sm:text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Picked: {selectedMove.toUpperCase()}
              </span>
            ) : (
              <span className="text-orange-400 font-semibold animate-pulse text-[10px] sm:text-[11px]">
                {currentBeat === 'DECISION' ? 'Choose before 0s!' : 'Pick your gesture!'}
              </span>
            )}
          </div>
        </div>

        {/* Floating Thumb-Friendly Action Cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* STONE / ROCK */}
          <button
            type="button"
            onClick={() => handleSelectMove('rock')}
            disabled={isInputLocked}
            className={`py-2.5 sm:py-3.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all transform active:scale-95 border-2 ${
              isInputLocked
                ? 'cursor-not-allowed opacity-45'
                : 'cursor-pointer hover:scale-102'
            } ${
              selectedMove === 'rock'
                ? 'bg-gradient-to-b from-orange-500/40 to-orange-600/20 border-[#FF5500] scale-102 shadow-[0_0_20px_rgba(255,85,0,0.6)] ring-2 ring-orange-400/50'
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
            className={`py-2.5 sm:py-3.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all transform active:scale-95 border-2 ${
              isInputLocked
                ? 'cursor-not-allowed opacity-45'
                : 'cursor-pointer hover:scale-102'
            } ${
              selectedMove === 'paper'
                ? 'bg-gradient-to-b from-orange-500/40 to-orange-600/20 border-[#FF5500] scale-102 shadow-[0_0_20px_rgba(255,85,0,0.6)] ring-2 ring-orange-400/50'
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
            className={`py-2.5 sm:py-3.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all transform active:scale-95 border-2 ${
              isInputLocked
                ? 'cursor-not-allowed opacity-45'
                : 'cursor-pointer hover:scale-102'
            } ${
              selectedMove === 'scissors'
                ? 'bg-gradient-to-b from-orange-500/40 to-orange-600/20 border-[#FF5500] scale-102 shadow-[0_0_20px_rgba(255,85,0,0.6)] ring-2 ring-orange-400/50'
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
