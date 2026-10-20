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

// Socket server URL configuration (connects to port 3001 when on Vite dev port 5173, otherwise same origin)
const SOCKET_URL = window.location.port === '5173'
  ? `http://${window.location.hostname}:3001`
  : undefined;

export default function App() {
  const [socket, setSocket] = useState(null);
  const [tournamentState, setTournamentState] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [activeView, setActiveView] = useState('PLAYER'); // 'PLAYER' | 'ADMIN' | 'PROJECTOR'
  const [reactions, setReactions] = useState([]);
  const [cheers, setCheers] = useState([]);

  const socketRef = useRef(null);

  // Sync hash routing if user opens /#admin or /#projector
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin') setActiveView('ADMIN');
      else if (hash === '#projector') setActiveView('PROJECTOR');
      else if (hash === '#player') setActiveView('PLAYER');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Initialize Socket connection
  useEffect(() => {
    const s = io(SOCKET_URL, {
      reconnectionAttempts: 15,
      reconnectionDelay: 1000
    });
    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      console.log('Connected to CLUTCH server:', s.id);
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
      setReactions((prev) => [...prev.slice(-30), reaction]);
    });

    s.on('new_cheer', (cheer) => {
      setCheers((prev) => [...prev.slice(-30), cheer]);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // User actions
  const handleRegister = (data) => socket?.emit('register_player', data);
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
                  status === 'EVALUATING') ? (
                  <DuelArena
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
    </div>
  );
}
