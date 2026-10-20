// client/src/components/HandIllustration.jsx
// Detailed 2D Illustrated Human Hands with 5 distinct fingers, realistic proportions & esports accents

import React from 'react';

export default function HandIllustration({
  gesture = 'rock', // 'rock' | 'paper' | 'scissors'
  isTop = false,    // true for opponent facing down, false for player facing up
  isShaking = false,
  glowColor = '#FF5500',
  label = ''
}) {
  const normGesture = (gesture || 'rock').toLowerCase();

  // Hand SVG details with 5 distinct fingers
  const renderHandSvg = () => {
    if (normGesture === 'paper') {
      // Open Palm with 5 distinct spread fingers
      return (
        <svg
          viewBox="0 0 240 320"
          className="w-full h-full drop-shadow-[0_0_20px_rgba(255,85,0,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA07A" />
              <stop offset="60%" stopColor="#E67E50" />
              <stop offset="100%" stopColor="#B34D22" />
            </linearGradient>
            <linearGradient id="sleeveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A2A38" />
              <stop offset="100%" stopColor="#14141E" />
            </linearGradient>
            <linearGradient id="cyberNeon" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF5500" />
              <stop offset="100%" stopColor="#FF9F1C" />
            </linearGradient>
          </defs>

          {/* Wrist / Esports Glove Sleeve */}
          <path d="M60 260 L180 260 L195 320 L45 320 Z" fill="url(#sleeveGrad)" stroke="#FF5500" strokeWidth="2.5" />
          <path d="M60 260 L180 260 L185 272 L55 272 Z" fill="url(#cyberNeon)" />
          {/* Cybernetic glove seams */}
          <line x1="80" y1="272" x2="70" y2="320" stroke="#FF5500" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
          <line x1="160" y1="272" x2="170" y2="320" stroke="#FF5500" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />

          {/* Main Palm Base */}
          <path
            d="M60 260 C55 200, 50 170, 68 150 C75 140, 85 140, 95 145 C105 140, 115 140, 125 145 C135 140, 145 140, 155 145 C165 145, 175 150, 180 175 C185 200, 185 235, 180 260 Z"
            fill="url(#skinGrad)"
            stroke="#4A1E0D"
            strokeWidth="3"
          />

          {/* FINGER 1: THUMB (Left side, angled out naturally) */}
          <path
            d="M60 215 C45 205, 25 185, 22 165 C20 148, 32 142, 42 148 C52 155, 60 175, 68 185"
            fill="url(#skinGrad)"
            stroke="#4A1E0D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Thumb nail & joint creases */}
          <path d="M26 160 C28 153, 34 153, 37 158" stroke="#FFD8B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="42" y1="172" x2="52" y2="180" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

          {/* FINGER 2: INDEX FINGER */}
          <path
            d="M72 150 C70 110, 72 70, 78 50 C82 38, 96 38, 98 50 C101 70, 99 110, 96 145"
            fill="url(#skinGrad)"
            stroke="#4A1E0D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Index nail & knuckles */}
          <path d="M82 48 C85 43, 92 43, 94 48" stroke="#FFD8B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="77" y1="85" x2="94" y2="85" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <line x1="76" y1="115" x2="95" y2="115" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

          {/* FINGER 3: MIDDLE FINGER (Tallest) */}
          <path
            d="M98 145 C98 100, 100 55, 107 35 C111 23, 126 23, 129 35 C133 55, 131 100, 128 145"
            fill="url(#skinGrad)"
            stroke="#4A1E0D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Middle nail & knuckles */}
          <path d="M112 33 C115 28, 123 28, 126 33" stroke="#FFD8B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="105" y1="72" x2="125" y2="72" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <line x1="104" y1="108" x2="125" y2="108" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

          {/* FINGER 4: RING FINGER */}
          <path
            d="M128 145 C129 105, 131 65, 138 48 C142 36, 155 36, 157 48 C160 65, 158 105, 154 148"
            fill="url(#skinGrad)"
            stroke="#4A1E0D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Ring nail & knuckles */}
          <path d="M142 46 C145 41, 151 41, 154 46" stroke="#FFD8B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="135" y1="84" x2="152" y2="84" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <line x1="134" y1="116" x2="151" y2="116" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

          {/* FINGER 5: PINKY FINGER (Smallest) */}
          <path
            d="M154 152 C158 125, 163 95, 169 75 C173 65, 185 66, 186 76 C187 95, 182 135, 178 175"
            fill="url(#skinGrad)"
            stroke="#4A1E0D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Pinky nail & knuckles */}
          <path d="M173 74 C175 70, 181 70, 183 74" stroke="#FFD8B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="165" y1="105" x2="180" y2="105" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

          {/* Palm Life/Heart lines */}
          <path d="M75 195 Q115 210, 140 185" stroke="#7E2E0B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
          <path d="M85 220 Q125 235, 160 215" stroke="#7E2E0B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        </svg>
      );
    }

    if (normGesture === 'scissors') {
      // Scissor Hand: Index & Middle extended in V; Thumb holding Ring & Pinky tightly down!
      return (
        <svg
          viewBox="0 0 240 320"
          className="w-full h-full drop-shadow-[0_0_20px_rgba(255,85,0,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="skinGradSci" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA07A" />
              <stop offset="60%" stopColor="#E67E50" />
              <stop offset="100%" stopColor="#B34D22" />
            </linearGradient>
            <linearGradient id="sleeveGradSci" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A2A38" />
              <stop offset="100%" stopColor="#14141E" />
            </linearGradient>
            <linearGradient id="cyberNeonSci" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF5500" />
              <stop offset="100%" stopColor="#FF9F1C" />
            </linearGradient>
          </defs>

          {/* Wrist / Glove Sleeve */}
          <path d="M60 260 L180 260 L195 320 L45 320 Z" fill="url(#sleeveGradSci)" stroke="#FF5500" strokeWidth="2.5" />
          <path d="M60 260 L180 260 L185 272 L55 272 Z" fill="url(#cyberNeonSci)" />

          {/* FINGER 2: INDEX FINGER (Extended, angled slightly left) */}
          <path
            d="M80 160 C72 115, 62 65, 66 40 C70 26, 88 28, 90 42 C94 65, 98 115, 102 160"
            fill="url(#skinGradSci)"
            stroke="#4A1E0D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Index nail & joints */}
          <path d="M72 38 C76 32, 83 33, 86 38" stroke="#FFD8B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="72" y1="78" x2="90" y2="82" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <line x1="76" y1="112" x2="95" y2="115" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

          {/* FINGER 3: MIDDLE FINGER (Extended, angled slightly right creating sharp V) */}
          <path
            d="M106 160 C114 115, 126 65, 134 38 C139 25, 156 28, 155 42 C152 65, 142 115, 132 160"
            fill="url(#skinGradSci)"
            stroke="#4A1E0D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Middle nail & joints */}
          <path d="M140 37 C144 32, 151 33, 153 38" stroke="#FFD8B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="126" y1="80" x2="145" y2="76" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <line x1="122" y1="114" x2="140" y2="110" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

          {/* Main Palm Base */}
          <path
            d="M60 260 C55 200, 52 180, 75 160 C85 155, 145 155, 165 160 C182 175, 185 210, 180 260 Z"
            fill="url(#skinGradSci)"
            stroke="#4A1E0D"
            strokeWidth="3"
          />

          {/* FINGER 4: RING FINGER (Curled down into palm) */}
          <path
            d="M130 160 C140 160, 156 162, 160 178 C163 192, 148 200, 134 195"
            fill="url(#skinGradSci)"
            stroke="#4A1E0D"
            strokeWidth="2.5"
          />

          {/* FINGER 5: PINKY FINGER (Curled down into palm) */}
          <path
            d="M158 175 C168 178, 178 185, 176 200 C174 212, 158 215, 145 208"
            fill="url(#skinGradSci)"
            stroke="#4A1E0D"
            strokeWidth="2.5"
          />

          {/* FINGER 1: THUMB (Curled across pinning ring & pinky down) */}
          <path
            d="M58 200 C50 180, 65 165, 85 170 C110 175, 135 182, 148 190 C156 195, 152 210, 140 215 C115 220, 80 225, 64 215 Z"
            fill="url(#skinGradSci)"
            stroke="#4A1E0D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Thumb nail & fold */}
          <path d="M138 193 C143 195, 144 202, 140 206" stroke="#FFD8B8" strokeWidth="2" strokeLinecap="round" />
          <path d="M85 180 Q105 190, 120 188" stroke="#7E2E0B" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
        </svg>
      );
    }

    // Default: ROCK (Clenched Fist showing all 5 fingers curled together)
    return (
      <svg
        viewBox="0 0 240 320"
        className="w-full h-full drop-shadow-[0_0_20px_rgba(255,85,0,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skinGradRock" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA07A" />
            <stop offset="60%" stopColor="#E67E50" />
            <stop offset="100%" stopColor="#B34D22" />
          </linearGradient>
          <linearGradient id="sleeveGradRock" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2A38" />
            <stop offset="100%" stopColor="#14141E" />
          </linearGradient>
          <linearGradient id="cyberNeonRock" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF5500" />
            <stop offset="100%" stopColor="#FF9F1C" />
          </linearGradient>
        </defs>

        {/* Wrist / Glove Sleeve */}
        <path d="M60 260 L180 260 L195 320 L45 320 Z" fill="url(#sleeveGradRock)" stroke="#FF5500" strokeWidth="2.5" />
        <path d="M60 260 L180 260 L185 272 L55 272 Z" fill="url(#cyberNeonRock)" />

        {/* Palm & Fist Base */}
        <path
          d="M60 260 C52 210, 50 170, 58 140 C65 110, 175 110, 182 140 C190 170, 188 210, 180 260 Z"
          fill="url(#skinGradRock)"
          stroke="#4A1E0D"
          strokeWidth="3"
        />

        {/* 4 KNUCKLES AT TOP: Index, Middle, Ring, Pinky */}
        {/* Index knuckle */}
        <path d="M60 135 C60 105, 88 105, 88 135" fill="url(#skinGradRock)" stroke="#4A1E0D" strokeWidth="2.5" />
        {/* Middle knuckle (highest) */}
        <path d="M88 130 C88 95, 120 95, 120 130" fill="url(#skinGradRock)" stroke="#4A1E0D" strokeWidth="2.5" />
        {/* Ring knuckle */}
        <path d="M120 132 C120 100, 152 100, 152 132" fill="url(#skinGradRock)" stroke="#4A1E0D" strokeWidth="2.5" />
        {/* Pinky knuckle */}
        <path d="M152 138 C152 110, 180 110, 180 138" fill="url(#skinGradRock)" stroke="#4A1E0D" strokeWidth="2.5" />

        {/* Finger rolls curled into fist */}
        <line x1="88" y1="130" x2="88" y2="185" stroke="#4A1E0D" strokeWidth="2" strokeLinecap="round" />
        <line x1="120" y1="130" x2="120" y2="185" stroke="#4A1E0D" strokeWidth="2" strokeLinecap="round" />
        <line x1="152" y1="135" x2="152" y2="185" stroke="#4A1E0D" strokeWidth="2" strokeLinecap="round" />

        {/* Individual curled finger segments */}
        <path d="M64 165 C68 175, 82 175, 86 165" stroke="#7E2E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M94 165 C98 175, 114 175, 118 165" stroke="#7E2E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M126 165 C130 175, 144 175, 148 165" stroke="#7E2E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M156 165 C160 175, 172 175, 176 165" stroke="#7E2E0B" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* FINGER 1: THUMB (Bold, folded across index and middle fingers) */}
        <path
          d="M52 195 C45 160, 60 145, 85 150 C110 155, 138 168, 145 180 C150 192, 142 208, 126 210 C100 215, 68 215, 54 205 Z"
          fill="url(#skinGradRock)"
          stroke="#4A1E0D"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Thumb nail */}
        <path d="M134 182 C139 184, 140 192, 136 196" stroke="#FFD8B8" strokeWidth="2" strokeLinecap="round" />
        <line x1="75" y1="175" x2="105" y2="185" stroke="#7E2E0B" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  };

  return (
    <div className={`relative flex flex-col items-center justify-center transition-transform duration-300 ${
      isTop ? 'rotate-180' : ''
    }`}>
      <div
        className={`w-36 h-48 sm:w-48 sm:h-64 transition-all duration-200 ${
          isShaking
            ? isTop
              ? 'animate-shake-down'
              : 'animate-shake-up'
            : 'transform hover:scale-105'
        }`}
      >
        {renderHandSvg()}
      </div>

      {label && (
        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
          isTop
            ? 'rotate-180 bg-red-950/80 border-red-500/40 text-red-300'
            : 'bg-orange-950/80 border-[#FF5500]/50 text-orange-300'
        }`}>
          {label}
        </div>
      )}
    </div>
  );
}
