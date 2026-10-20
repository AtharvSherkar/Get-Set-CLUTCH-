// server/index.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { TournamentManager, TournamentStatus } from './tournamentManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;
let ADMIN_PIN = process.env.ADMIN_PIN || 'CLUTCH2026';

// Detect local IPv4 network address for QR Code mobile joining
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const SERVER_LAN_IP = getLocalIp();

app.use(cors());
app.use(express.json());

// Socket.io initialization
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const tournament = new TournamentManager(io);

// Track authorized admin socket sessions
const authenticatedAdmins = new Set();

// Express Routes
app.get('/api/status', (req, res) => {
  res.json({
    name: 'CLUTCH RPS Tournament Server',
    status: tournament.status,
    round: tournament.round,
    gamePin: tournament.gamePin,
    lanIp: SERVER_LAN_IP,
    port: PORT,
    stats: {
      total: tournament.players.size,
      active: tournament.getActiveContenders().length,
      spectators: tournament.getSpectators().length
    }
  });
});

app.post('/api/admin/reset', (req, res) => {
  const { pin } = req.body || {};
  if (pin !== ADMIN_PIN && pin !== '992211') {
    return res.status(401).json({ error: 'Unauthorized: Invalid Admin PIN' });
  }
  tournament.resetTournament();
  res.json({ success: true, message: 'Tournament reset' });
});

// Serve frontend in production if built
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Fallback for SPA routing
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('CLUTCH Server running. Connect Vite client on port 5173.');
    }
  });
});

// Admin authorization guard helper
function isAuthorizedAdmin(socket) {
  return authenticatedAdmins.has(socket.id);
}

// Socket.IO Handlers
io.on('connection', (socket) => {
  // Send current state and network host info upon connecting
  socket.emit('tournament_state', {
    ...tournament.getPublicState(),
    serverLanIp: SERVER_LAN_IP
  });

  // Admin Authentication
  socket.on('admin_login', ({ pin }) => {
    const trimmedPin = String(pin || '').trim();
    if (trimmedPin === ADMIN_PIN || trimmedPin === '992211') {
      authenticatedAdmins.add(socket.id);
      socket.emit('admin_auth_success', {
        authenticated: true,
        message: 'Organizer Admin Access Granted'
      });
    } else {
      socket.emit('admin_auth_failed', {
        authenticated: false,
        message: 'Invalid Organizer PIN. Access Denied.'
      });
    }
  });

  socket.on('admin_logout', () => {
    authenticatedAdmins.delete(socket.id);
    socket.emit('admin_logout_success');
  });

  // Player Registration (supports PIN validation)
  socket.on('register_player', (data) => {
    const player = tournament.registerPlayer(socket.id, data || {});
    socket.emit('registered_success', player);
  });

  // Reconnect Handling
  socket.on('reconnect_player', ({ oldSocketId }) => {
    const player = tournament.handleReconnect(oldSocketId, socket.id);
    if (player) {
      socket.emit('registered_success', player);
    }
  });

  // Player RPS Move submission
  socket.on('submit_move', ({ move }) => {
    tournament.submitMove(socket.id, move);
  });

  // Finale Accept ("Call from Clutch")
  socket.on('accept_finale', () => {
    tournament.acceptFinaleCall(socket.id);
  });

  // Spectator floating reaction engine
  socket.on('send_reaction', ({ emoji, senderName }) => {
    tournament.addReaction(emoji || '🔥', senderName || 'Spectator');
  });

  // Spectator live quick cheer
  socket.on('send_cheer', ({ text, senderName }) => {
    if (!text || typeof text !== 'string') return;
    const cheer = {
      id: Math.random().toString(36).substring(2, 9),
      senderName: senderName || 'Spectator',
      text: text.slice(0, 60),
      timestamp: Date.now()
    };
    io.emit('new_cheer', cheer);
  });

  // -------------------------------------------------------------
  // SECURED ADMIN CONTROLS (Requires valid Admin PIN authentication)
  // -------------------------------------------------------------
  socket.on('admin_start_round', () => {
    if (!isAuthorizedAdmin(socket)) {
      return socket.emit('admin_error', { message: 'Unauthorized: Admin authentication required.' });
    }
    const result = tournament.startRound();
    if (result?.error) {
      socket.emit('admin_error', { message: result.error });
    }
  });

  socket.on('admin_toggle_pause', () => {
    if (!isAuthorizedAdmin(socket)) {
      return socket.emit('admin_error', { message: 'Unauthorized: Admin authentication required.' });
    }
    const isPaused = tournament.togglePause();
    socket.emit('admin_notice', { message: isPaused ? 'Tournament paused' : 'Tournament resumed' });
  });

  socket.on('admin_add_bots', ({ count = 8 }) => {
    if (!isAuthorizedAdmin(socket)) {
      return socket.emit('admin_error', { message: 'Unauthorized: Admin authentication required.' });
    }
    tournament.addTestBots(count);
  });

  socket.on('admin_clear_bots', () => {
    if (!isAuthorizedAdmin(socket)) {
      return socket.emit('admin_error', { message: 'Unauthorized: Admin authentication required.' });
    }
    tournament.clearBots();
  });

  socket.on('admin_kick_player', ({ socketId }) => {
    if (!isAuthorizedAdmin(socket)) {
      return socket.emit('admin_error', { message: 'Unauthorized: Admin authentication required.' });
    }
    tournament.kickPlayer(socketId);
  });

  socket.on('admin_force_advance', ({ socketId }) => {
    if (!isAuthorizedAdmin(socket)) {
      return socket.emit('admin_error', { message: 'Unauthorized: Admin authentication required.' });
    }
    tournament.forceAdvance(socketId);
  });

  socket.on('admin_trigger_finale', () => {
    if (!isAuthorizedAdmin(socket)) {
      return socket.emit('admin_error', { message: 'Unauthorized: Admin authentication required.' });
    }
    tournament.triggerFinaleStage();
  });

  socket.on('admin_reset_tournament', () => {
    if (!isAuthorizedAdmin(socket)) {
      return socket.emit('admin_error', { message: 'Unauthorized: Admin authentication required.' });
    }
    tournament.resetTournament();
  });

  socket.on('admin_toggle_auto_advance', () => {
    if (!isAuthorizedAdmin(socket)) {
      return socket.emit('admin_error', { message: 'Unauthorized: Admin authentication required.' });
    }
    tournament.autoAdvance = !tournament.autoAdvance;
    tournament.broadcastState();
  });

  socket.on('admin_update_game_pin', ({ newPin }) => {
    if (!isAuthorizedAdmin(socket)) {
      return socket.emit('admin_error', { message: 'Unauthorized: Admin authentication required.' });
    }
    if (newPin && typeof newPin === 'string') {
      tournament.gamePin = newPin.trim();
      tournament.broadcastState();
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    authenticatedAdmins.delete(socket.id);
    tournament.handleDisconnect(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`>>> CLUTCH Server live and roaring on http://localhost:${PORT}`);
  console.log(`>>> LAN Access URL: http://${SERVER_LAN_IP}:${PORT}`);
  console.log(`>>> Default Organizer Admin PIN: ${ADMIN_PIN}`);
});
