// client/src/components/HandIllustration.jsx
// Esports Tournament Combat Gauntlets – Realistic 5-Finger Anatomical Battle Hands
// Featuring matte carbon armor, articulated phalange plating, and cybernetic energy conduits.

import React from 'react';

export default function HandIllustration({
  gesture = 'rock', // 'rock' | 'paper' | 'scissors' | 'scissor'
  isTop = false,    // true for opponent facing down (rival crimson), false for player facing up (clutch orange)
  isShaking = false,
  isClutch = false,
  glowColor,
  label = ''
}) {
  const normGesture = (gesture || 'rock').toLowerCase();

  // Dynamic Esports Theme Colors:
  // Player: High-Voltage Clutch Orange (#FF5500) & Neon Amber (#FF9F1C)
  // Opponent: Rival Battle Crimson (#EF4444) & Neon Rose (#F87171)
  const accentPrimary = glowColor || (isTop ? '#EF4444' : '#FF5500');
  const accentSecondary = isTop ? '#F87171' : '#FF9F1C';
  const accentCore = isTop ? '#FFE4E6' : '#FFF3E8';
  const accentDeep = isTop ? '#7F1D1D' : '#7C2D12';

  const prefix = isTop ? 'rival' : 'player';

  // Common SVG Defs (Gradients, Filters, Textures)
  const renderDefs = () => (
    <defs>
      {/* Matte Carbon Armor Plating Gradient */}
      <linearGradient id={`${prefix}_armorPlate`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#252736" />
        <stop offset="45%" stopColor="#1B1C26" />
        <stop offset="100%" stopColor="#111218" />
      </linearGradient>

      {/* Titanium Specular Bevel Highlight */}
      <linearGradient id={`${prefix}_armorHighlight`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4A5068" />
        <stop offset="50%" stopColor="#2B2E3D" />
        <stop offset="100%" stopColor="#151720" />
      </linearGradient>

      {/* Ballistic Carbon Fiber Under-Sleeve */}
      <linearGradient id={`${prefix}_carbonUnder`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0B0C10" />
        <stop offset="50%" stopColor="#181A22" />
        <stop offset="100%" stopColor="#0B0C10" />
      </linearGradient>

      {/* Cybernetic Energy Conduit Gradient */}
      <linearGradient id={`${prefix}_energyGlow`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={accentSecondary} />
        <stop offset="50%" stopColor={accentPrimary} />
        <stop offset="100%" stopColor={accentDeep} />
      </linearGradient>

      {/* Edge Rim Highlight Gradient */}
      <linearGradient id={`${prefix}_rimSpec`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8A94A8" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#4A5068" stopOpacity="0.2" />
      </linearGradient>

      {/* Knuckle Shell Gradient */}
      <linearGradient id={`${prefix}_knuckleGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#35394A" />
        <stop offset="40%" stopColor="#212330" />
        <stop offset="100%" stopColor="#0E0F14" />
      </linearGradient>

      {/* High-Voltage Rim Glow Filter on CLUTCH Lock */}
      <filter id={`${prefix}_clutchFilter`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={accentPrimary} floodOpacity="0.9" />
        <feDropShadow dx="0" dy="0" stdDeviation="16" floodColor={accentPrimary} floodOpacity="0.4" />
      </filter>
    </defs>
  );

  // Common Armored Wrist Bracer & Sleeve Base (Y: 255 to 320)
  const renderWristBracer = () => (
    <g id="wrist-bracer">
      {/* Base carbon under-arm */}
      <path d="M50 258 L190 258 L206 320 L34 320 Z" fill={`url(#${prefix}_carbonUnder)`} stroke="#090A0D" strokeWidth="2" />

      {/* Armored Bracer Forearm Shell */}
      <path d="M54 262 L186 262 L198 318 L42 318 Z" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3244" strokeWidth="1.5" />

      {/* Lower Tactical Compression Strap */}
      <path d="M38 296 L202 296 L204 308 L36 308 Z" fill="#0C0D12" stroke="#1F222E" strokeWidth="1" />
      <rect x="110" y="294" width="20" height="15" rx="2" fill="#2F3342" stroke="#5E667E" strokeWidth="1" />
      <line x1="120" y1="296" x2="120" y2="307" stroke="#0C0D12" strokeWidth="1.5" />

      {/* Upper Tactical Compression Strap */}
      <path d="M44 274 L196 274 L198 286 L42 286 Z" fill="#0C0D12" stroke="#1F222E" strokeWidth="1" />
      <rect x="110" y="272" width="20" height="15" rx="2" fill="#2F3342" stroke="#5E667E" strokeWidth="1" />
      <line x1="120" y1="274" x2="120" y2="285" stroke="#0C0D12" strokeWidth="1.5" />

      {/* Cybernetic Energy Conduit (Pulse Channel) */}
      <line x1="120" y1="262" x2="120" y2="318" stroke={`url(#${prefix}_energyGlow)`} strokeWidth="3" strokeLinecap="round" />
      <line x1="120" y1="262" x2="120" y2="318" stroke={accentCore} strokeWidth="1" strokeLinecap="round" opacity="0.9" />

      {/* Flanking Energy Vents */}
      <line x1="66" y1="288" x2="62" y2="312" stroke={accentPrimary} strokeWidth="1.5" opacity="0.75" />
      <line x1="174" y1="288" x2="178" y2="312" stroke={accentPrimary} strokeWidth="1.5" opacity="0.75" />

      {/* Beveled Top Collar Rim */}
      <path d="M52 258 L188 258 L190 264 L50 264 Z" fill={`url(#${prefix}_armorHighlight)`} stroke="#4F556C" strokeWidth="1" />
      <line x1="53" y1="259" x2="187" y2="259" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
    </g>
  );

  // GESTURE 1: ROCK (Armored Clenched Combat Fist)
  const renderRockFist = () => (
    <svg viewBox="0 0 240 320" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {renderDefs()}
      {renderWristBracer()}

      {/* Palm / Fist Base Hull */}
      <path
        d="M52 260 C42 220, 44 175, 54 142 C58 126, 182 126, 186 142 C196 175, 198 220, 188 260 Z"
        fill={`url(#${prefix}_carbonUnder)`}
        stroke="#0A0B0E"
        strokeWidth="2.5"
      />

      {/* Metacarpal Dorsal Armor Plate */}
      <path
        d="M62 258 L178 258 L182 195 L168 180 L72 180 L58 195 Z"
        fill={`url(#${prefix}_armorPlate)`}
        stroke="#2E3345"
        strokeWidth="1.5"
      />

      {/* Center Tactical Crest & Energy Conduits */}
      <path d="M102 225 L120 238 L138 225 L120 205 Z" fill="#13141B" stroke="#2D3141" strokeWidth="1" />
      <path d="M106 224 L120 234 L134 224 L120 210 Z" fill={`url(#${prefix}_energyGlow)`} />
      <line x1="120" y1="238" x2="120" y2="258" stroke={`url(#${prefix}_energyGlow)`} strokeWidth="2.5" />
      <line x1="102" y1="225" x2="80" y2="198" stroke={`url(#${prefix}_energyGlow)`} strokeWidth="1.5" opacity="0.8" />
      <line x1="138" y1="225" x2="160" y2="198" stroke={`url(#${prefix}_energyGlow)`} strokeWidth="1.5" opacity="0.8" />

      {/* 4 KNUCKLE ARMOR PLATES (Index, Middle, Ring, Pinky across top) */}
      {/* 1. Index Knuckle Plate (X: 55 to 88, Y: 114 to 142) */}
      <g id="index-knuckle">
        <path d="M56 122 L72 114 L88 118 L88 142 L56 142 Z" fill={`url(#${prefix}_knuckleGrad)`} stroke="#464C63" strokeWidth="1.5" />
        <path d="M58 123 L72 116 L86 120" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
        <circle cx="72" cy="128" r="2.5" fill="#12131A" stroke="#5E6580" strokeWidth="1" />
      </g>

      {/* 2. Middle Knuckle Plate (Apex knuckle, X: 88 to 126, Y: 104 to 138) */}
      <g id="middle-knuckle">
        <path d="M88 118 L107 104 L126 109 L126 138 L88 138 Z" fill={`url(#${prefix}_knuckleGrad)`} stroke="#464C63" strokeWidth="1.5" />
        <path d="M90 119 L107 106 L124 111" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.7" />
        <line x1="107" y1="106" x2="107" y2="138" stroke={`url(#${prefix}_energyGlow)`} strokeWidth="1.5" />
        <circle cx="107" cy="123" r="2.5" fill="#12131A" stroke="#5E6580" strokeWidth="1" />
      </g>

      {/* 3. Ring Knuckle Plate (X: 126 to 158, Y: 109 to 138) */}
      <g id="ring-knuckle">
        <path d="M126 109 L142 112 L158 118 L158 138 L126 138 Z" fill={`url(#${prefix}_knuckleGrad)`} stroke="#464C63" strokeWidth="1.5" />
        <path d="M128 111 L142 114 L156 120" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
        <circle cx="142" cy="125" r="2.5" fill="#12131A" stroke="#5E6580" strokeWidth="1" />
      </g>

      {/* 4. Pinky Knuckle Plate (X: 158 to 186, Y: 118 to 146) */}
      <g id="pinky-knuckle">
        <path d="M158 118 L172 122 L185 130 L185 146 L158 142 Z" fill={`url(#${prefix}_knuckleGrad)`} stroke="#464C63" strokeWidth="1.5" />
        <path d="M160 120 L172 124 L183 131" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.5" />
        <circle cx="172" cy="132" r="2.2" fill="#12131A" stroke="#5E6580" strokeWidth="1" />
      </g>

      {/* FOLDED FINGER PHALANGES (Curled into combat fist) */}
      {/* Index Finger Fold */}
      <g id="index-fold">
        <rect x="57" y="142" width="31" height="26" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#0A0B0E" strokeWidth="1.5" />
        <rect x="58" y="169" width="30" height="24" rx="2" fill={`url(#${prefix}_armorHighlight)`} stroke="#0A0B0E" strokeWidth="1.5" />
        <line x1="60" y1="168" x2="86" y2="168" stroke={accentPrimary} strokeWidth="1" opacity="0.6" />
      </g>

      {/* Middle Finger Fold */}
      <g id="middle-fold">
        <rect x="89" y="138" width="37" height="28" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#0A0B0E" strokeWidth="1.5" />
        <rect x="90" y="167" width="35" height="25" rx="2" fill={`url(#${prefix}_armorHighlight)`} stroke="#0A0B0E" strokeWidth="1.5" />
        <line x1="92" y1="166" x2="123" y2="166" stroke={accentPrimary} strokeWidth="1.2" opacity="0.8" />
      </g>

      {/* Ring Finger Fold */}
      <g id="ring-fold">
        <rect x="127" y="138" width="31" height="28" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#0A0B0E" strokeWidth="1.5" />
        <rect x="128" y="167" width="29" height="25" rx="2" fill={`url(#${prefix}_armorHighlight)`} stroke="#0A0B0E" strokeWidth="1.5" />
        <line x1="130" y1="166" x2="155" y2="166" stroke={accentPrimary} strokeWidth="1" opacity="0.6" />
      </g>

      {/* Pinky Finger Fold */}
      <g id="pinky-fold">
        <rect x="159" y="142" width="26" height="25" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#0A0B0E" strokeWidth="1.5" />
        <rect x="160" y="168" width="24" height="24" rx="2" fill={`url(#${prefix}_armorHighlight)`} stroke="#0A0B0E" strokeWidth="1.5" />
      </g>

      {/* THE THUMB (Clamped firmly across index and middle fingers) */}
      <g id="thumb-clamp">
        {/* Thenar base plate on left */}
        <path
          d="M44 195 C38 178, 48 160, 68 158 C80 162, 90 170, 92 188 C85 210, 60 218, 44 195 Z"
          fill={`url(#${prefix}_carbonUnder)`}
          stroke="#0A0B0E"
          strokeWidth="2"
        />

        {/* Thumb Armored Proximal Phalanx */}
        <path
          d="M50 188 C52 168, 70 160, 92 164 L122 170 C125 186, 118 198, 96 204 L64 204 Z"
          fill={`url(#${prefix}_armorPlate)`}
          stroke="#383D50"
          strokeWidth="2"
        />

        {/* Thumb Distal Phalanx & Tip Plate */}
        <path
          d="M98 166 L136 172 C146 175, 150 186, 144 195 C136 204, 118 206, 102 202 L96 182 Z"
          fill={`url(#${prefix}_armorHighlight)`}
          stroke="#4D536B"
          strokeWidth="1.8"
        />

        {/* Thumb Specular Highlight */}
        <path d="M56 182 C65 170, 85 166, 128 172" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

        {/* Thumb Hinge Joint Detail */}
        <circle cx="95" cy="184" r="3" fill="#12131A" stroke={accentPrimary} strokeWidth="1.2" />
        <line x1="68" y1="190" x2="88" y2="190" stroke={`url(#${prefix}_energyGlow)`} strokeWidth="1.2" />
      </g>

      {/* High-Voltage Edge Rim Highlight Lines */}
      <path d="M54 250 C46 210, 48 175, 55 146" stroke={accentPrimary} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <path d="M186 250 C194 210, 192 175, 185 146" stroke={accentPrimary} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );

  // GESTURE 2: PAPER (Tactical Battle-Ready Open Palm with 5 Articulated Fingers)
  const renderPaperHand = () => (
    <svg viewBox="0 0 240 320" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {renderDefs()}
      {renderWristBracer()}

      {/* Palm Base Carbon Hull */}
      <path
        d="M52 260 C42 215, 38 180, 52 152 C60 144, 180 144, 188 152 C202 180, 198 215, 188 260 Z"
        fill={`url(#${prefix}_carbonUnder)`}
        stroke="#0A0B0E"
        strokeWidth="2.5"
      />

      {/* Thenar Palm Pad (Left) */}
      <path
        d="M54 258 C46 225, 48 185, 68 170 C84 175, 96 195, 94 235 L75 258 Z"
        fill={`url(#${prefix}_armorPlate)`}
        stroke="#2E3345"
        strokeWidth="1.5"
      />

      {/* Hypothenar Palm Pad (Right) */}
      <path
        d="M186 258 C194 225, 192 185, 172 170 C156 175, 144 195, 146 235 L165 258 Z"
        fill={`url(#${prefix}_armorPlate)`}
        stroke="#2E3345"
        strokeWidth="1.5"
      />

      {/* Central Palm Ballistic Plate & Energy Core */}
      <path
        d="M92 175 L148 175 L142 245 L98 245 Z"
        fill={`url(#${prefix}_armorHighlight)`}
        stroke="#3D4255"
        strokeWidth="1.2"
      />
      <polygon points="120,188 132,198 132,216 120,226 108,216 108,198" fill="#12131A" stroke="#373B4D" strokeWidth="1" />
      <polygon points="120,192 128,200 128,214 120,222 112,214 112,200" fill={`url(#${prefix}_energyGlow)`} />
      <line x1="120" y1="226" x2="120" y2="258" stroke={`url(#${prefix}_energyGlow)`} strokeWidth="2" />

      {/* Metacarpal Ridge Bar (Y: 146 to 162) */}
      <path d="M58 152 L182 152 L184 164 L56 164 Z" fill={`url(#${prefix}_knuckleGrad)`} stroke="#464C63" strokeWidth="1" />
      <line x1="60" y1="153" x2="180" y2="153" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />

      {/* ================= 5 EXTENDED ARTICULATED FINGERS ================= */}

      {/* FINGER 1: THUMB (Angled outward at natural ~35° combat stance) */}
      <g id="thumb-extended">
        {/* Thumb Proximal Plate (X: 38 to 68, Y: 172 to 212) */}
        <path d="M60 215 C45 200, 36 182, 38 168 L56 162 L68 185 Z" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Thumb Distal Phalanx & Tip (X: 18 to 44, Y: 136 to 172) */}
        <path
          d="M38 168 C30 158, 18 148, 22 136 C28 132, 40 138, 46 150 L56 162 Z"
          fill={`url(#${prefix}_armorHighlight)`}
          stroke="#4D536B"
          strokeWidth="1.8"
        />
        <path d="M22 140 C28 135, 36 140, 42 148" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
        <line x1="34" y1="165" x2="52" y2="160" stroke={accentPrimary} strokeWidth="1.2" />
      </g>

      {/* FINGER 2: INDEX FINGER (X: 66 to 94, Y: 44 to 150) */}
      <g id="index-finger">
        {/* Proximal segment (Y: 114 to 150) */}
        <rect x="67" y="114" width="26" height="34" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Middle segment (Y: 78 to 112) */}
        <rect x="68" y="78" width="24" height="34" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Distal Tip segment (Y: 44 to 76) */}
        <path d="M69 76 L69 56 C69 46, 89 46, 89 56 L89 76 Z" fill={`url(#${prefix}_armorHighlight)`} stroke="#4D536B" strokeWidth="1.8" />
        <path d="M72 52 C76 47, 82 47, 86 52" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" />
        {/* Flex Joint Line */}
        <line x1="70" y1="78" x2="88" y2="78" stroke={accentPrimary} strokeWidth="1.2" />
        <line x1="69" y1="113" x2="91" y2="113" stroke={accentPrimary} strokeWidth="1.2" />
      </g>

      {/* FINGER 3: MIDDLE FINGER (Apex of hand, X: 96 to 128, Y: 24 to 146) */}
      <g id="middle-finger">
        {/* Proximal segment (Y: 106 to 146) */}
        <rect x="97" y="106" width="30" height="38" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Middle segment (Y: 66 to 104) */}
        <rect x="98" y="66" width="28" height="38" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Distal Tip segment (Tallest apex, Y: 24 to 64) */}
        <path d="M99 64 L99 38 C99 24, 125 24, 125 38 L125 64 Z" fill={`url(#${prefix}_armorHighlight)`} stroke="#4D536B" strokeWidth="1.8" />
        <path d="M103 32 C108 26, 116 26, 121 32" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
        {/* Energy Spine Line */}
        <line x1="112" y1="28" x2="112" y2="146" stroke={`url(#${prefix}_energyGlow)`} strokeWidth="1.8" />
        <line x1="100" y1="65" x2="124" y2="65" stroke={accentPrimary} strokeWidth="1.2" />
        <line x1="99" y1="105" x2="125" y2="105" stroke={accentPrimary} strokeWidth="1.2" />
      </g>

      {/* FINGER 4: RING FINGER (X: 130 to 158, Y: 42 to 148) */}
      <g id="ring-finger">
        {/* Proximal segment (Y: 110 to 148) */}
        <rect x="131" y="110" width="26" height="36" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Middle segment (Y: 74 to 108) */}
        <rect x="132" y="74" width="24" height="34" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Distal Tip segment (Y: 42 to 72) */}
        <path d="M133 72 L133 54 C133 42, 153 42, 153 54 L153 72 Z" fill={`url(#${prefix}_armorHighlight)`} stroke="#4D536B" strokeWidth="1.8" />
        <path d="M136 49 C140 44, 146 44, 150 49" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" />
        <line x1="134" y1="73" x2="152" y2="73" stroke={accentPrimary} strokeWidth="1.2" />
        <line x1="133" y1="109" x2="155" y2="109" stroke={accentPrimary} strokeWidth="1.2" />
      </g>

      {/* FINGER 5: PINKY FINGER (X: 160 to 186, Y: 74 to 156) */}
      <g id="pinky-finger">
        {/* Proximal segment (Y: 126 to 156) */}
        <rect x="161" y="126" width="24" height="28" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Middle segment (Y: 98 to 124) */}
        <rect x="162" y="98" width="22" height="26" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Distal Tip segment (Y: 74 to 96) */}
        <path d="M163 96 L163 84 C163 74, 181 74, 181 84 L181 96 Z" fill={`url(#${prefix}_armorHighlight)`} stroke="#4D536B" strokeWidth="1.8" />
        <path d="M166 80 C169 76, 175 76, 178 80" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
        <line x1="164" y1="97" x2="180" y2="97" stroke={accentPrimary} strokeWidth="1" />
        <line x1="163" y1="125" x2="183" y2="125" stroke={accentPrimary} strokeWidth="1" />
      </g>

      {/* Outer Silhouette Edge Highlights */}
      <path d="M22 136 C28 132, 40 138, 46 150 L56 162" stroke={accentPrimary} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <path d="M181 84 L181 156 C194 185, 192 225, 186 258" stroke={accentPrimary} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );

  // GESTURE 3: SCISSORS (Tactical Extended "V" Blades with Locked Ring/Pinky)
  const renderScissorsHand = () => (
    <svg viewBox="0 0 240 320" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {renderDefs()}
      {renderWristBracer()}

      {/* Palm Base Carbon Hull */}
      <path
        d="M52 260 C42 220, 44 175, 54 148 C60 144, 180 144, 188 152 C198 175, 198 220, 188 260 Z"
        fill={`url(#${prefix}_carbonUnder)`}
        stroke="#0A0B0E"
        strokeWidth="2.5"
      />

      {/* Metacarpal Dorsal Armor Plate */}
      <path
        d="M60 258 L180 258 L184 195 L168 178 L72 178 L58 195 Z"
        fill={`url(#${prefix}_armorPlate)`}
        stroke="#2E3345"
        strokeWidth="1.5"
      />

      {/* Center Tactical Crest Line */}
      <path d="M102 230 L120 242 L138 230 L120 214 Z" fill="#13141B" stroke="#2D3141" strokeWidth="1" />
      <line x1="120" y1="242" x2="120" y2="258" stroke={`url(#${prefix}_energyGlow)`} strokeWidth="2" />

      {/* ================= FOLDED RING & PINKY FINGERS (Clamped down) ================= */}
      {/* Ring Finger Curled Fold (X: 124 to 156, Y: 148 to 195) */}
      <g id="folded-ring">
        <rect x="126" y="148" width="30" height="24" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#0A0B0E" strokeWidth="1.5" />
        <rect x="128" y="172" width="28" height="22" rx="2" fill={`url(#${prefix}_knuckleGrad)`} stroke="#0A0B0E" strokeWidth="1.5" />
      </g>

      {/* Pinky Finger Curled Fold (X: 156 to 182, Y: 154 to 198) */}
      <g id="folded-pinky">
        <rect x="156" y="154" width="26" height="22" rx="2" fill={`url(#${prefix}_armorPlate)`} stroke="#0A0B0E" strokeWidth="1.5" />
        <rect x="157" y="176" width="24" height="20" rx="2" fill={`url(#${prefix}_knuckleGrad)`} stroke="#0A0B0E" strokeWidth="1.5" />
      </g>

      {/* ================= EXTENDED "V" BLADES (Index & Middle Fingers) ================= */}

      {/* BLADE 1: INDEX FINGER (Angled slightly left, forming left edge of V) */}
      <g id="index-blade">
        {/* Proximal segment (Y: 108 to 154) */}
        <path d="M68 152 L62 112 L86 106 L92 148 Z" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Middle segment (Y: 68 to 110) */}
        <path d="M62 110 L56 72 L80 66 L86 104 Z" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Distal Blade Tip (Y: 30 to 70) */}
        <path
          d="M56 70 L52 46 C50 32, 70 30, 76 42 L80 68 Z"
          fill={`url(#${prefix}_armorHighlight)`}
          stroke="#4D536B"
          strokeWidth="1.8"
        />
        {/* Razor Edge Specular Highlight */}
        <path d="M52 42 C56 36, 68 36, 73 42" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
        {/* Illuminated Cutting Edge Conduit along inner gap */}
        <line x1="77" y1="44" x2="88" y2="148" stroke={`url(#${prefix}_energyGlow)`} strokeWidth="2" strokeLinecap="round" />
        <line x1="58" y1="72" x2="82" y2="68" stroke={accentPrimary} strokeWidth="1.2" />
        <line x1="64" y1="111" x2="88" y2="106" stroke={accentPrimary} strokeWidth="1.2" />
      </g>

      {/* BLADE 2: MIDDLE FINGER (Angled slightly right, forming sharp V apex) */}
      <g id="middle-blade">
        {/* Proximal segment (Y: 104 to 150) */}
        <path d="M96 148 L104 104 L130 110 L122 152 Z" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Middle segment (Y: 64 to 106) */}
        <path d="M106 102 L114 64 L138 70 L130 108 Z" fill={`url(#${prefix}_armorPlate)`} stroke="#2E3345" strokeWidth="1.5" />
        {/* Distal Blade Tip (Y: 26 to 66) */}
        <path
          d="M116 64 L122 38 C126 24, 146 28, 144 42 L138 68 Z"
          fill={`url(#${prefix}_armorHighlight)`}
          stroke="#4D536B"
          strokeWidth="1.8"
        />
        {/* Razor Edge Specular Highlight */}
        <path d="M124 36 C130 30, 140 32, 142 38" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
        {/* Illuminated Cutting Edge Conduit along inner gap */}
        <line x1="120" y1="40" x2="98" y2="146" stroke={`url(#${prefix}_energyGlow)`} strokeWidth="2" strokeLinecap="round" />
        <line x1="114" y1="65" x2="138" y2="70" stroke={accentPrimary} strokeWidth="1.2" />
        <line x1="104" y1="103" x2="130" y2="109" stroke={accentPrimary} strokeWidth="1.2" />
      </g>

      {/* THE THUMB CLAMP (Wraps across and locks down Ring/Pinky fingers securely) */}
      <g id="thumb-clamp-scissor">
        {/* Thenar muscle base on left */}
        <path
          d="M44 196 C36 178, 48 160, 68 158 C80 162, 92 172, 94 192 C86 214, 60 220, 44 196 Z"
          fill={`url(#${prefix}_carbonUnder)`}
          stroke="#0A0B0E"
          strokeWidth="2"
        />

        {/* Thumb Armored Proximal Phalanx */}
        <path
          d="M50 188 C52 168, 70 160, 94 165 L124 172 C126 188, 118 200, 96 206 L64 206 Z"
          fill={`url(#${prefix}_armorPlate)`}
          stroke="#383D50"
          strokeWidth="2"
        />

        {/* Thumb Distal Phalanx & Clamping Tip */}
        <path
          d="M102 168 L142 176 C150 179, 154 190, 146 198 C136 206, 118 206, 104 200 L98 182 Z"
          fill={`url(#${prefix}_armorHighlight)`}
          stroke="#4D536B"
          strokeWidth="1.8"
        />

        {/* Specular Highlight along Thumb Ridge */}
        <path d="M58 182 C68 170, 88 166, 132 175" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

        {/* Thumb Hinge Joint Detail */}
        <circle cx="98" cy="186" r="3" fill="#12131A" stroke={accentPrimary} strokeWidth="1.2" />
        <line x1="70" y1="192" x2="90" y2="192" stroke={`url(#${prefix}_energyGlow)`} strokeWidth="1.2" />
      </g>

      {/* High-Contrast Outer Edge Rim Highlights */}
      <path d="M52 46 L62 152 C46 182, 44 220, 52 260" stroke={accentPrimary} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <path d="M144 42 L136 148 C160 160, 190 190, 186 260" stroke={accentPrimary} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );

  // Router for the 3 Gestures (rock, paper, scissors)
  const renderHandSvg = () => {
    if (normGesture === 'paper') {
      return renderPaperHand();
    }
    if (normGesture === 'scissors' || normGesture === 'scissor') {
      return renderScissorsHand();
    }
    // Default: Rock / Combat Fist
    return renderRockFist();
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center transition-transform duration-200 ${
        isTop ? 'rotate-180' : ''
      }`}
    >
      <div
        className={`w-36 h-48 sm:w-48 sm:h-64 transition-all duration-200 ${
          isClutch
            ? isTop
              ? 'rival-clutch-glow scale-[1.03]'
              : 'player-clutch-glow scale-[1.03]'
            : 'hover:scale-[1.02]'
        }`}
      >
        {renderHandSvg()}
      </div>

      {label && (
        <div
          className={`mt-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border shadow-lg font-['Space_Grotesk',sans-serif] ${
            isTop
              ? 'rotate-180 bg-red-950/90 border-red-500/60 text-red-300 shadow-red-900/40'
              : 'bg-orange-950/90 border-[#FF5500]/60 text-orange-300 shadow-orange-950/40'
          }`}
        >
          {label}
        </div>
      )}
    </div>
  );
}
