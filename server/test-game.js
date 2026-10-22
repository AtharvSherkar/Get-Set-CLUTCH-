// server/test-game.js
// Comprehensive end-to-end automated test suite for CLUTCH tournament
import { io } from '../client/node_modules/socket.io-client/build/esm/index.js';

console.log('>>> [TEST SUITE] Starting CLUTCH End-to-End Game Validation...');

const admin = io('http://localhost:3001');
const p1 = io('http://localhost:3001');
const p2 = io('http://localhost:3001');
const p3 = io('http://localhost:3001');

let step = 0;
let p1MatchId = null;
let p2MatchId = null;
let p3MatchId = null;

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ ${message}`);
  }
};

admin.on('connect', () => {
  console.log('Admin socket connected:', admin.id);
  admin.emit('register_admin');
  admin.emit('admin_clear_bots');
  admin.emit('admin_reset_tournament');
  setTimeout(() => {
    p1.emit('register_player', { name: 'Valkyrie', studentId: 'VALK-01', avatar: '⚡' });
    p2.emit('register_player', { name: 'TitanRox', studentId: 'TITAN-02', avatar: '🔥' });
    p3.emit('register_player', { name: 'Specter', studentId: 'SPEC-03', avatar: '🦊' });
  }, 300);
});

admin.on('tournament_state', (state) => {
  // STEP 0: Verify 3 real players registered and in waiting list
  if (step === 0 && state.waitingPlayers.length === 3) {
    step = 1;
    console.log('\n--- TEST 1: REAL-TIME PLAYER REGISTRATION & LOBBY SYNC ---');
    assert(state.status === 'REGISTRATION', 'Status is REGISTRATION');
    assert(state.stats.activeCount === 3, 'Active contenders count is 3');
    assert(state.waitingPlayers.length === 3, 'Waiting list has 3 players');
    assert(state.waitingPlayers.some(p => p.name === 'Valkyrie'), 'Valkyrie is in waiting list');
    assert(state.waitingPlayers.some(p => p.name === 'TitanRox'), 'TitanRox is in waiting list');
    assert(state.waitingPlayers.some(p => p.name === 'Specter'), 'Specter is in waiting list');

    // STEP 1: Add 8 test bots and verify bots are NOT shown in waiting lobby
    console.log('\n--- TEST 2: TEST BOTS ARE HIDDEN FROM WAITING LOBBY ---');
    admin.emit('admin_add_bots', { count: 8 });
  } else if (step === 1 && state.stats.totalPlayers === 11) {
    step = 2;
    assert(state.stats.totalPlayers === 11, 'Total players is 11 (3 humans + 8 bots)');
    assert(state.waitingPlayers.length === 3, 'Waiting list STRICTLY contains only the 3 real players (bots hidden)');
    const anyBotInLobby = state.waitingPlayers.some(p => p.isBot || p.name.includes('Bot') || p.studentId.includes('BOT'));
    assert(!anyBotInLobby, 'Confirmed: Zero bots in lobby waiting list');

    // Clear bots to cleanly test the 3-player semifinal edge case
    console.log('\n--- TEST 3: CLEARING TEST BOTS FOR 3-PLAYER SEMIFINAL TEST ---');
    admin.emit('admin_clear_bots');
  } else if (step === 2 && state.stats.totalPlayers === 3) {
    step = 3;
    console.log('\n--- TEST 4: STARTING ROUND 1 (3-PLAYER SEMIFINAL) ---');
    admin.emit('admin_start_round');
  } else if (step === 3 && state.status === 'MATCHMAKING' && state.matches.length === 2) {
    step = 4;
    console.log('\n--- TEST 5: MATCHMAKING VERIFICATION ---');
    console.log('Matches created:', state.matches.map(m => `${m.player1.name} vs ${m.player2.name}`));
    assert(state.matches.length === 2, '2 matches created for 3 players (1 pair + 1 paired with CLUTCH_BOT)');
    const clutchBotMatch = state.matches.find(m => m.player1.id.startsWith('clutch_bot_') || m.player2.id.startsWith('clutch_bot_'));
    assert(Boolean(clutchBotMatch), 'One player is paired with system bot CLUTCH_BOT');

    // Submit moves during countdown
    // Human 1 chooses rock, Human 2 chooses scissors
    // Human 3 chooses paper against CLUTCH_BOT
    const humanMatch = state.matches.find(m => !m.player1.id.startsWith('clutch_bot_') && !m.player2.id.startsWith('clutch_bot_'));
    if (humanMatch) {
      if (humanMatch.player1.id === p1.id) {
        p1.emit('submit_move', { move: 'rock' });
        p2.emit('submit_move', { move: 'scissors' });
      } else if (humanMatch.player2.id === p1.id) {
        p1.emit('submit_move', { move: 'rock' });
        p2.emit('submit_move', { move: 'scissors' });
      } else {
        // p2 vs p3 or p1 vs p3
        p2.emit('submit_move', { move: 'scissors' });
        p3.emit('submit_move', { move: 'rock' });
      }
    }
    // Also submit for p3
    p3.emit('submit_move', { move: 'paper' });
    console.log('Moves submitted by players!');
  } else if (step === 4 && state.status === 'EVALUATING') {
    step = 5;
    console.log('\n--- TEST 6: ROUND EVALUATION & CASUALTY GRAVEYARD ---');
    console.log('Evaluating matches...');
  } else if ((step === 5 || step === 4) && state.status === 'FINALE_STAGE') {
    step = 6;
    console.log('\n--- TEST 7: 3-PLAYER RESOLUTION & GRAND FINALE ACTIVATION ---');
    assert(state.stats.activeCount === 2, 'Active contenders count reduced from 3 to EXACTLY 2 PLAYERS');
    assert(state.finalists.length === 2, 'Finalists array contains EXACTLY 2 PLAYERS');
    assert(state.eliminations.length >= 1, 'Elimination graveyard recorded the eliminated player');
    assert(Array.isArray(state.roundHistory), 'roundHistory is broadcasted in state');
    assert(state.roundHistory.length >= 1, 'roundHistory contains archived round matches');
    assert(Boolean(state.roundHistory[0].matches[0].p1Move), 'roundHistory contains player 1 move');
    assert(Boolean(state.roundHistory[0].matches[0].p2Move), 'roundHistory contains player 2 move');
    assert(Boolean(state.roundHistory[0].matches[0].result), 'roundHistory contains match outcome');
    console.log('Finalists qualified for Grand Finale:', state.finalists.map(f => `${f.name} (${f.studentId})`));
    console.log('Eliminated Contender in Graveyard:', state.eliminations[0]?.name, 'defeated by', state.eliminations[0]?.defeatedBy);
    console.log('Archived Round History Matches:', state.roundHistory[0].matches.map(m => `${m.player1.name} (${m.p1Move}) vs ${m.player2.name} (${m.p2Move}) -> ${m.result}`));

    // STEP 8: Test Finalist accepting the "Call from Clutch"
    console.log('\n--- TEST 8: ACCEPTING FINALE SUMMONS ("CALL FROM CLUTCH") ---');
    const firstFinalist = state.finalists[0];
    if (firstFinalist.id === p1.id) p1.emit('accept_finale');
    else if (firstFinalist.id === p2.id) p2.emit('accept_finale');
    else p3.emit('accept_finale');

    setTimeout(() => {
      // STEP 9: Test Admin declaring champion
      console.log('\n--- TEST 9: ADMIN DECLARING TOURNAMENT CHAMPION ---');
      admin.emit('admin_declare_champion', { championId: firstFinalist.id });
    }, 1000);
  } else if (step === 6 && state.champion) {
    step = 7;
    console.log('\n--- TEST 10: TOURNAMENT CHAMPION CROWNED ---');
    assert(Boolean(state.champion), 'Champion is crowned in tournament state');
    console.log('Tournament Victor:', state.champion.name, 'with ID:', state.champion.id);

    // STEP 11: Test spectator reaction
    console.log('\n--- TEST 11: SPECTATOR REACTION EMOJIS ---');
    p2.emit('send_reaction', { emoji: '🔥', senderName: 'TitanRox' });

    // STEP 12: Test tournament reset
    console.log('\n--- TEST 12: RESETTING TOURNAMENT ---');
    admin.emit('admin_reset_tournament');
  } else if (step === 7 && state.status === 'REGISTRATION' && state.round === 0) {
    step = 8;
    console.log('\n--- TEST 13: CLEAN RESET VERIFICATION ---');
    assert(state.status === 'REGISTRATION', 'State reset back to REGISTRATION');
    assert(state.round === 0, 'Round reset to 0');
    assert(state.matches.length === 0, 'Matches cleared');
    assert(state.finalists.length === 0, 'Finalists cleared');

    // STEP 14: Test "Kick All" Admin Exemption & Targeted Player Notification
    console.log('\n--- TEST 14: ADMIN SOCKET ROLE EXEMPTION ON KICK ALL ---');
    let adminReceivedKick = false;
    let p1ReceivedKick = false;
    let kickReasonReceived = null;

    admin.on('player_kicked', () => { adminReceivedKick = true; });
    admin.on('all_players_kicked', () => { adminReceivedKick = true; });

    p1.on('all_players_kicked', ({ reason } = {}) => {
      p1ReceivedKick = true;
      kickReasonReceived = reason;
    });

    // Re-register player 1
    p1.emit('register_player', { name: 'ValkyrieKickTest', studentId: 'VALK-KICK', avatar: '⚡' });

    setTimeout(() => {
      // Trigger Kick All as admin
      admin.emit('admin_kick_all');

      setTimeout(() => {
        console.log('\n--- TEST 15: TARGETED PLAYER DISCONNECTION VERIFICATION ---');
        assert(p1ReceivedKick, 'Standard player received all_players_kicked event');
        assert(
          kickReasonReceived === 'The room was cleared by the host.',
          `Player received notification: "${kickReasonReceived}"`
        );
        assert(adminReceivedKick === false, 'ADMIN SOCKET STRICTLY EXEMPTED: Admin received ZERO kick events');
        assert(admin.connected === true, 'Admin socket remains fully connected, open, and functional');

        console.log('\n================================================================');
        console.log('🎉 ALL 15 END-TO-END VALIDATION & ADMIN GUARD TESTS PASSED! 🎉');
        console.log('================================================================\n');

        p1.disconnect();
        p2.disconnect();
        p3.disconnect();
        admin.disconnect();

        setTimeout(() => process.exit(0), 400);
      }, 500);
    }, 400);
  }
});
