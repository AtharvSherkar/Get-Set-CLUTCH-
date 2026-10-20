// client/src/components/FinaleCallModal.jsx
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Phone, PhoneCall, Sparkles, Trophy, QrCode, ShieldCheck, ArrowRight } from 'lucide-react';

export default function FinaleCallModal({
  finalists = [],
  currentPlayer,
  onAcceptFinale
}) {
  const [accepted, setAccepted] = useState(false);

  // Check if current user is one of the 2 finalists
  const isFinalist = finalists.some((f) => f.id === currentPlayer?.id);
  const otherFinalist = finalists.find((f) => f.id !== currentPlayer?.id);

  // Start incoming ringtone on mount if not accepted
  useEffect(() => {
    if (!accepted) {
      sound.startRingtone();
    }
    return () => {
      sound.stopRingtone();
    };
  }, [accepted]);

  const handleAccept = () => {
    sound.stopRingtone();
    sound.playVictory();
    setAccepted(true);
    onAcceptFinale();

    // Trigger explosive celebratory confetti shower
    const end = Date.now() + 4 * 1000;
    const colors = ['#FF5500', '#FF9F1C', '#FFD700', '#FFFFFF'];

    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto">
      {/* PHONE INCOMING CALL VIEW */}
      {!accepted ? (
        <div className="w-full max-w-sm rounded-[2.5rem] bg-[#0E0E14] border-4 border-[#252532] shadow-[0_0_60px_rgba(255,85,0,0.3)] p-6 flex flex-col items-center justify-between min-h-[580px] text-center relative overflow-hidden animate-ring-vibe">
          {/* Top Phone Sensor Bar */}
          <div className="w-28 h-4 bg-black rounded-full mb-6"></div>

          {/* Caller Details & Pulsing Logo */}
          <div className="space-y-4 my-auto">
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              {/* Radiating soundwave circles */}
              <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping opacity-75"></div>
              <div className="absolute -inset-4 rounded-full border border-orange-500/30 animate-pulse"></div>
              <img
                src="/assets/clutch-logo.png"
                alt="CLUTCH HQ"
                className="w-24 h-24 object-contain rounded-2xl bg-black/90 p-2 border-2 border-orange-500 shadow-xl relative z-10"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400 font-mono">
                ENCRYPTED STAGE DISPATCH
              </span>
              <h2 className="text-2xl font-black font-['Orbitron',sans-serif] text-white tracking-wider">
                CALL FROM CLUTCH
              </h2>
              <p className="text-xs text-zinc-400 font-medium italic">
                Stage summons incoming...
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-zinc-300">
              Final showdown vs <strong className="text-orange-400">{otherFinalist?.name || 'Grand Finalist'}</strong>
            </div>
          </div>

          {/* BOTTOM CONTROLS: STRICTLY ONE GLOWING GREEN ACCEPT BUTTON */}
          <div className="w-full pt-6 pb-2 space-y-4">
            <p className="text-[11px] text-zinc-500 font-medium">
              Accept call to report to the physical stage
            </p>

            <button
              type="button"
              onClick={handleAccept}
              className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 text-white font-black font-['Orbitron',sans-serif] tracking-wider text-base shadow-[0_0_35px_rgba(34,197,94,0.8)] hover:shadow-[0_0_50px_rgba(34,197,94,1)] transition transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-3 border-2 border-green-200"
            >
              <PhoneCall className="w-6 h-6 animate-bounce" />
              <span>ACCEPT SUMMONS</span>
            </button>
          </div>
        </div>
      ) : (
        /* POST-ACCEPT: FULL SCREEN CELEBRATORY BANNER & VIP STAGE PASS */
        <div className="w-full max-w-lg rounded-3xl glass-panel-glow border-2 border-orange-500/60 p-6 sm:p-8 space-y-6 text-center shadow-[0_0_80px_rgba(255,85,0,0.5)]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-yellow-400" />
              OFFICIAL GRAND FINALIST
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-['Orbitron',sans-serif] tracking-wider text-white text-glow-orange">
              CLUTCH IN THE ARENA
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 font-medium max-w-md mx-auto">
              You have survived the digital gauntlet. Report to the main stage immediately for the physical showdown!
            </p>
          </div>

          {/* DIGITAL VIP STAGE PASS */}
          <div className="bg-gradient-to-b from-[#1C1610] to-[#0D0B08] border-2 border-orange-500/60 rounded-2xl p-5 text-left relative overflow-hidden shadow-2xl">
            {/* Holographic accent glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl"></div>

            <div className="flex items-center justify-between pb-3 border-b border-orange-500/30">
              <div className="flex items-center gap-2">
                <img src="/assets/clutch-logo.png" alt="CLUTCH" className="w-7 h-7 object-contain" />
                <span className="font-['Orbitron',sans-serif] font-bold text-xs text-orange-400">
                  CLUTCH STAGE PASS
                </span>
              </div>
              <span className="text-[10px] font-mono text-green-400 bg-green-500/20 px-2 py-0.5 rounded border border-green-500/30 font-bold">
                VERIFIED FINALIST
              </span>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                  CONTENDER IDENTITY
                </span>
                <p className="text-lg font-black font-['Space_Grotesk',sans-serif] text-white">
                  {currentPlayer?.name}
                </p>
                <p className="text-xs text-orange-300 font-mono">
                  ID: {currentPlayer?.studentId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                    STAGE OPPONENT
                  </span>
                  <span className="font-bold text-zinc-200">
                    {otherFinalist?.name || 'TBD'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                    STAGE LOCATION
                  </span>
                  <span className="font-bold text-orange-400">
                    CENTRAL ARENA
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-dashed border-zinc-700 flex items-center justify-between">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Show this screen to event anchors at stage</span>
              </div>
              <QrCode className="w-6 h-6 text-orange-400" />
            </div>
          </div>

          <p className="text-xs text-zinc-500 italic">
            Keep this screen open while walking to the main stage. Good luck, Contender!
          </p>
        </div>
      )}
    </div>
  );
}
