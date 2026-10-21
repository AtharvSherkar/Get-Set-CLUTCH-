import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, ExternalLink, Users, Flame, Maximize2, X } from 'lucide-react';
import { sound } from '../utils/audio';

export default function KahootQrBanner({
  serverLanIp,
  activeCount = 0,
  players = [],
  isProjector = false
}) {
  const [copied, setCopied] = useState(false);
  const [isFullScreenQr, setIsFullScreenQr] = useState(false);

  // Determine the mobile-friendly Join URL
  const port = window.location.port ? `:${window.location.port}` : '';
  const host = (serverLanIp && serverLanIp !== 'localhost' && serverLanIp !== '127.0.0.1')
    ? `${serverLanIp}${port}`
    : window.location.host;

  const joinUrl = `${window.location.protocol}//${host}/join`;

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard?.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-7 border-2 border-orange-500/50 shadow-2xl relative overflow-hidden">
        {/* Background fiery ambiance */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-orange-500/15 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* LEFT: KAHOOT-STYLE CALLOUT & JOIN INSTRUCTIONS */}
          <div className="space-y-4 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black tracking-widest uppercase">
              <Flame className="w-4 h-4 text-[#FF5500] animate-pulse" />
              KAHOOT-STYLE TOURNAMENT ENTRY
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-4xl font-black font-['Orbitron',sans-serif] tracking-wider text-white">
                SCAN TO JOIN THE ARENA
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl font-medium">
                Point your phone camera at the QR code or enter the URL below to register your combat handle and enter the waiting lobby!
              </p>
            </div>

            {/* Room Link Box */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-2.5 p-2.5 rounded-2xl bg-black/80 border-2 border-orange-500/40 shadow-inner">
              <div className="px-3 py-1.5 text-xs sm:text-sm font-mono font-bold text-orange-300 break-all select-all">
                {joinUrl}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
                <a
                  href={joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Open Join Page in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Joined Contenders Ticker (Real Players only) */}
            {(() => {
              const humanPlayers = players.filter((p) => !p.isBot);
              return (
                <>
                  <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                      <Users className="w-3.5 h-3.5" />
                      <span>{humanPlayers.length} Players Joined & Waiting in Lobby</span>
                    </div>
                  </div>

                  {/* Recently Joined Preview Badges */}
                  {humanPlayers.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 pt-1">
                      {humanPlayers.slice(-8).map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/60 border border-zinc-800 text-[11px] font-bold text-zinc-200"
                        >
                          <span>{p.avatar}</span>
                          <span className="truncate max-w-[100px]">{p.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* RIGHT: HIGH-CONTRAST QR CODE CARD */}
          <div className="relative group flex flex-col items-center">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#FF5500] via-[#FF9F1C] to-[#FF5500] rounded-3xl blur-md opacity-50 group-hover:opacity-80 transition duration-300"></div>
            
            <div className="relative bg-white p-3.5 rounded-2xl shadow-2xl flex flex-col items-center border-4 border-orange-500">
              <div className="p-1 rounded-lg bg-white">
                <QRCodeSVG
                  value={joinUrl}
                  size={190}
                  level="H"
                  marginSize={1}
                />
              </div>
              
              <div className="w-full mt-2 pt-2 border-t border-zinc-200 flex items-center justify-between text-[11px] font-bold text-zinc-800">
                <span className="font-['Orbitron',sans-serif] tracking-wider text-[#FF5500]">
                  CLUTCH JOIN
                </span>
                <button
                  type="button"
                  onClick={() => setIsFullScreenQr(true)}
                  className="flex items-center gap-1 text-zinc-500 hover:text-black transition cursor-pointer"
                  title="Expand to Fullscreen for Auditorium"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Enlarge</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN QR CODE MODAL (FOR AUDITORIUM PROJECTION) */}
      {isFullScreenQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
          <div className="text-center space-y-6 max-w-lg w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/assets/clutch-logo.png" alt="CLUTCH" className="w-10 h-10 object-contain" />
                <h3 className="text-2xl font-black font-['Orbitron',sans-serif] text-white">
                  JOIN CLUTCH
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFullScreenQr(false)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl inline-block shadow-[0_0_60px_rgba(255,85,0,0.6)] border-4 border-orange-500">
              <div className="p-2 bg-white rounded-2xl mx-auto flex justify-center">
                <QRCodeSVG
                  value={joinUrl}
                  size={300}
                  level="H"
                  marginSize={1}
                />
              </div>
              <p className="mt-3 text-sm font-mono font-black text-black break-all">
                {joinUrl}
              </p>
            </div>

            <p className="text-sm font-bold text-zinc-300">
              Scan with your phone camera to enter the battle royale!
            </p>
          </div>
        </div>
      )}
    </>
  );
}
