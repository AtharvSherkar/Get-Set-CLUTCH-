// client/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import RegistrationView from './components/RegistrationView';
import DuelArena from './components/DuelArena';
import WaitingRoom from './components/WaitingRoom';
import AdminPanel from './components/AdminPanel';
import ProjectorView from './components/ProjectorView';
import FinaleCallModal from './components/FinaleCallModal';
import { sound } from './utils/audio';

// Resolves the backend server URL with maximum flexibility:
// 1. URL search param: ?server=https://...
// 2. localStorage: 'clutch_server_url'
// 3. Environment variables: VITE_SERVER_URL or REACT_APP_SERVER_URL
// 4. Vite dev default: http://localhost:3001
const getInitialServerUrl = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const params = new URLSearchParams(window.location.search);
    const paramServer = params.get('server');
    if (paramServer && paramServer.trim() !== '') {
      localStorage.setItem('clutch_server_url', paramServer.trim());
      return paramServer.trim();
    }
    const saved = localStorage.getItem('clutch_server_url');
    if (saved && saved.trim() !== '') return saved.trim();
  } catch (e) {
    // fallback
  }

  const envUrl =
    import.meta.env?.VITE_SERVER_URL ||
    import.meta.env?.REACT_APP_SERVER_URL ||
    (typeof window !== 'undefined' ? window.__CLUTCH_SERVER_URL__ : undefined);

  if (envUrl && envUrl.trim() !== '') return envUrl.trim();

  if (window.location.port === '5173') {
    return `http://${window.location.hostname}:3001`;
  }
  return undefined;
};

export default function App() {
  const [serverUrl, setServerUrl] = useState(getInitialServerUrl);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [tournamentState, setTournamentState] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [activeView, setActiveView] = useState('PLAYER'); // 'PLAYER' | 'ADMIN' | 'PROJECTOR'
  const [reactions, setReactions] = useState([]);
  const [cheers, setCheers] = useState([]);

  const socketRef = useRef(null);

  // Sync URL routing for /admin, /projector, /join, /waiting-room
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('admin') || hash.includes('admin')) {
        setActiveView('ADMIN');
      } else if (path.includes('projector') || hash.includes('projector')) {
        setActiveView('PROJECTOR');
      } else {
        setActiveView('PLAYER');
      }
    };
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  // Initialize Socket connection
  useEffect(() => {
    const s = io(serverUrl, {
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });
    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      console.log('Connected to CLUTCH server:', s.id);
      setIsConnected(true);
      setConnectionError(null);
      const savedPlayer = sessionStorage.getItem('clutch_player');
      if (savedPlayer) {
        try {
          const parsed = JSON.parse(savedPlayer);
          s.emit('reconnect_player', { oldSocketId: parsed.id });
        } catch (e) {
          console.error(e);
        }
      }
    });

    s.on('connect_error', (err) => {
      console.warn('Socket connect error:', err?.message);
      setIsConnected(false);
      setConnectionError(err?.message || 'Connection failed');
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('tournament_state', (state) => {
      setTournamentState(state);

      setCurrentPlayer((prev) => {
        if (!prev) return null;
        const updated = state.players?.find(
          (p) => p.id === prev.id || (prev.name && p.name === prev.name)
        );
        if (updated) {
          sessionStorage.setItem('clutch_player', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    });

    s.on('registered_success', (player) => {
      setCurrentPlayer(player);
      sessionStorage.setItem('clutch_player', JSON.stringify(player));
    });

    s.on('new_reaction', (reaction) => {
      if (!reaction || !reaction.id) return;
      setReactions((prev) => [...prev, reaction]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 2200);
    });

    s.on('new_cheer', (cheer) => {
      setCheers((prev) => [...prev.slice(-30), cheer]);
    });

    return () => {
      s.disconnect();
    };
  }, [serverUrl]);

  // Update backend server URL dynamically
  const handleUpdateServerUrl = (newUrl) => {
    if (!newUrl) return;
    try {
      localStorage.setItem('clutch_server_url', newUrl.trim());
    } catch (e) {}
    setServerUrl(newUrl.trim());
    window.location.reload();
  };

  // User actions
  const handleRegister = (data, callbacks = {}) => {
    if (!socket || !socket.connected) {
      callbacks.onError?.('Game server is offline or unreachable. Please connect a backend.');
      return;
    }
    socket.emit('register_player', data);
    try {
      window.history.pushState(null, '', '/waiting-room');
    } catch (e) {
      // fallback
    }
  };

  const handleDemoRegister = (data) => {
    const demoPlayer = {
      id: `demo_${Date.now()}`,
      name: data.name,
      avatar: data.avatar,
      studentId: `DEMO-${Math.floor(100 + Math.random() * 900)}`,
      status: 'active',
      isBot: false,
      score: 0,
      roundStreak: 0,
      registeredAt: Date.now()
    };
    setCurrentPlayer(demoPlayer);
    sessionStorage.setItem('clutch_player', JSON.stringify(demoPlayer));
  };
  const handleSubmitMove = (move) => socket?.emit('submit_move', { move });
  const handleSendReaction = (emoji, senderName) => socket?.emit('send_reaction', { emoji, senderName });
  const handleSendCheer = (text, senderName) => socket?.emit('send_cheer', { text, senderName });
  const handleAcceptFinale = () => socket?.emit('accept_finale');

  // Admin Orchestration actions
  const handleStartRound = () => socket?.emit('admin_start_round');
  const handleTogglePause = () => socket?.emit('admin_toggle_pause');
  const handleAddBots = (count) => socket?.emit('admin_add_bots', { count });
  const handleClearBots = () => socket?.emit('admin_clear_bots');
  const handleKickPlayer = (socketId) => socket?.emit('admin_kick_player', { socketId });
  const handleForceAdvance = (socketId) => socket?.emit('admin_force_advance', { socketId });
  const handleTriggerFinale = () => socket?.emit('admin_trigger_finale');
  const handleDeclareChampion = (championId) => socket?.emit('admin_declare_champion', { championId });
  const handleResetTournament = () => socket?.emit('admin_reset_tournament');
  const handleToggleAutoAdvance = () => socket?.emit('admin_toggle_auto_advance');

  // Current match resolution
  const currentMatch = tournamentState?.matches?.find(
    (m) =>
      currentPlayer &&
      (m.player1.id === currentPlayer.id || m.player2.id === currentPlayer.id)
  );

  const status = tournamentState?.status || 'REGISTRATION';
  const isFinalist = tournamentState?.finalists?.some(
    (f) => f.id === currentPlayer?.id
  );

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col font-['Outfit',sans-serif] selection:bg-[#FF5500] selection:text-white">
      {/* Top Navigation Bar with View Switcher */}
      <Navbar
        tournamentState={tournamentState}
        currentPlayer={currentPlayer}
        activeView={activeView}
        isConnected={isConnected}
        onSelectView={(view) => {
          sound.playClick();
          setActiveView(view);
          window.location.hash = view.toLowerCase();
        }}
      />

      {/* Main Body View Switching */}
      <main className="flex-1 flex flex-col items-center justify-start pb-8">
        {/* VIEW 1: ORGANIZER ADMIN PANEL */}
        {activeView === 'ADMIN' && (
          <AdminPanel
            tournamentState={tournamentState}
            onStartRound={handleStartRound}
            onTogglePause={handleTogglePause}
            onAddBots={handleAddBots}
            onClearBots={handleClearBots}
            onKickPlayer={handleKickPlayer}
            onForceAdvance={handleForceAdvance}
            onTriggerFinale={handleTriggerFinale}
            onDeclareChampion={handleDeclareChampion}
            onResetTournament={handleResetTournament}
            onToggleAutoAdvance={handleToggleAutoAdvance}
          />
        )}

        {/* VIEW 2: AUDITORIUM PROJECTOR / BIG SCREEN MODE */}
        {activeView === 'PROJECTOR' && (
          <ProjectorView tournamentState={tournamentState} />
        )}

        {/* VIEW 3: PLAYER EXPERIENCE */}
        {activeView === 'PLAYER' && (
          <>
            {/* If player is not yet registered */}
            {!currentPlayer ? (
              <RegistrationView
                onRegister={handleRegister}
                onDemoRegister={handleDemoRegister}
                isConnected={isConnected}
                connectionError={connectionError}
                serverUrl={serverUrl}
                onUpdateServerUrl={handleUpdateServerUrl}
                tournamentState={tournamentState}
                currentPlayer={currentPlayer}
              />
            ) : (
              /* If player is registered */
              <>
                {/* Active Match Duel Arena: When player is in combat during Countdown or Evaluating */}
                {currentPlayer.status === 'active' &&
                currentMatch &&
                (status === 'MATCHMAKING' ||
                  status === 'COUNTDOWN' ||
                  status === 'LOCKED' ||
                  status === 'EVALUATING') ? (
                  <DuelArena
                    socket={socket}
                    currentMatch={currentMatch}
                    currentPlayer={currentPlayer}
                    tournamentState={tournamentState}
                    onSubmitMove={handleSubmitMove}
                  />
                ) : (
                  /* Dedicated Waiting Room & Spectator Arena (before round 1, between rounds, or when eliminated) */
                  <WaitingRoom
                    tournamentState={tournamentState}
                    currentPlayer={currentPlayer}
                    reactions={reactions}
                    cheers={cheers}
                    onSendReaction={handleSendReaction}
                    onSendCheer={handleSendCheer}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* 2-PLAYER FINALE SEQUENCE: "CALL FROM CLUTCH" */}
      {status === 'FINALE_STAGE' && isFinalist && (
        <FinaleCallModal
          finalists={tournamentState?.finalists}
          currentPlayer={currentPlayer}
          onAcceptFinale={handleAcceptFinale}
        />
      )}

      {/* GLOBAL EPHEMERAL REACTION EMOJIS (Appears ONLY on active user tap, auto-purged on finish) */}
      {reactions.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {reactions.map((r) => (
            <div
              key={r.id}
              style={{ left: `${r.x}%`, bottom: '90px' }}
              className="absolute text-3xl sm:text-4xl animate-float-emoji filter drop-shadow-[0_0_12px_rgba(255,85,0,0.6)]"
            >
              {r.emoji}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
