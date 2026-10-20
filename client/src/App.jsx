// client/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import RegistrationView from './components/RegistrationView';
import DuelArena from './components/DuelArena';
import SpectatorLobby from './components/SpectatorLobby';
import FinaleCallModal from './components/FinaleCallModal';
import AdminConsole from './components/AdminConsole';
import { sound } from './utils/audio';

// Socket server URL configuration
const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [tournamentState, setTournamentState] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [cheers, setCheers] = useState([]);

  const socketRef = useRef(null);

  // Initialize Socket connection
  useEffect(() => {
    const s = io(SOCKET_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      console.log('Connected to CLUTCH server:', s.id);
      // Attempt reconnect if session player exists
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

      // Keep currentPlayer synced with server state
      setCurrentPlayer((prev) => {
        if (!prev) return null;
        const updated = state.players?.find((p) => p.id === prev.id || (prev.name && p.name === prev.name));
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

  // Player registration handler
  const handleRegister = (data) => {
    if (socket) {
      socket.emit('register_player', data);
    }
  };

  // Move submission handler
  const handleSubmitMove = (move) => {
    if (socket) {
      socket.emit('submit_move', { move });
    }
  };

  // Reaction handler
  const handleSendReaction = (emoji, senderName) => {
    if (socket) {
      socket.emit('send_reaction', { emoji, senderName });
    }
  };

  // Cheer handler
  const handleSendCheer = (text, senderName) => {
    if (socket) {
      socket.emit('send_cheer', { text, senderName });
    }
  };

  // Finale accept handler
  const handleAcceptFinale = () => {
    if (socket) {
      socket.emit('accept_finale');
    }
  };

  // Admin Orchestration handlers
  const handleStartRound = () => socket?.emit('admin_start_round');
  const handleTogglePause = () => socket?.emit('admin_toggle_pause');
  const handleAddBots = (count) => socket?.emit('admin_add_bots', { count });
  const handleClearBots = () => socket?.emit('admin_clear_bots');
  const handleKickPlayer = (socketId) => socket?.emit('admin_kick_player', { socketId });
  const handleForceAdvance = (socketId) => socket?.emit('admin_force_advance', { socketId });
  const handleTriggerFinale = () => socket?.emit('admin_trigger_finale');
  const handleResetTournament = () => socket?.emit('admin_reset_tournament');
  const handleToggleAutoAdvance = () => socket?.emit('admin_toggle_auto_advance');

  // Identify current match for local player
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
      {/* Top Esports Navigation Bar */}
      <Navbar
        tournamentState={tournamentState}
        currentPlayer={currentPlayer}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminOpen={isAdminOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {/* VIEW 1: REGISTRATION */}
        {!currentPlayer ? (
          <RegistrationView
            onRegister={handleRegister}
            tournamentState={tournamentState}
            currentPlayer={currentPlayer}
          />
        ) : (
          /* VIEW 2: REGISTERED PLAYER / TOURNAMENT IN PROGRESS */
          <>
            {/* If in Active Match during Countdown / Evaluation */}
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
              /* Waiting Lobby & Spectator Feed for Eliminated or Waiting Players */
              <SpectatorLobby
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
      </main>

      {/* 2-PLAYER FINALE SEQUENCE MODAL: "CALL FROM CLUTCH" */}
      {status === 'FINALE_STAGE' && isFinalist && (
        <FinaleCallModal
          finalists={tournamentState?.finalists}
          currentPlayer={currentPlayer}
          onAcceptFinale={handleAcceptFinale}
        />
      )}

      {/* ADMIN CONSOLE MODAL */}
      <AdminConsole
        tournamentState={tournamentState}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
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
    </div>
  );
}
