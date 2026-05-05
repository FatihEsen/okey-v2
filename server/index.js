import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameMode, GamePhase } from '../src/types';
import { createDeck, shuffle, determineOkey, sortBySets } from '../src/logic/okeyEngine';
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const rooms = {};
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('createRoom', ({ playerName }) => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms[roomId] = {
            id: roomId,
            players: [{ socketId: socket.id, name: playerName, isReady: true }],
            gameState: null
        };
        socket.join(roomId);
        socket.emit('roomCreated', roomId);
        io.to(roomId).emit('roomUpdated', rooms[roomId]);
    });
    socket.on('joinRoom', ({ roomId, playerName }) => {
        const room = rooms[roomId];
        if (room && room.players.length < 4) {
            room.players.push({ socketId: socket.id, name: playerName, isReady: true });
            socket.join(roomId);
            socket.emit('joinedRoom', roomId);
            io.to(roomId).emit('roomUpdated', room);
        }
        else {
            socket.emit('error', 'Oda dolu veya bulunamadı.');
        }
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const pIdx = room.players.findIndex(p => p.socketId === socket.id);
            if (pIdx !== -1) {
                room.players.splice(pIdx, 1);
                io.to(roomId).emit('roomUpdated', room);
                if (room.players.length === 0) {
                    delete rooms[roomId];
                }
            }
        }
    });
    // Basic game start
    socket.on('startGame', (roomId) => {
        const room = rooms[roomId];
        if (room && room.players.length > 0) { // Can fill with AI later
            const deck = shuffle(createDeck());
            const indicator = deck.pop();
            const okeyTile = determineOkey(indicator);
            // Create Players
            const gamePlayers = [];
            for (let i = 0; i < 4; i++) {
                const realPlayer = room.players[i];
                const isAI = !realPlayer;
                const name = realPlayer ? realPlayer.name : `Bot ${i}`;
                const id = realPlayer ? realPlayer.socketId : `bot-${i}`;
                const tileCount = i === 0 ? 22 : 21;
                const hand = Array.from({ length: 30 }, (_, idx) => idx < tileCount ? deck.pop() : null);
                gamePlayers.push({
                    id,
                    name,
                    hand,
                    openedSets: [],
                    openedPairs: [],
                    score: 0,
                    isAI,
                    hasOpened: false,
                    openedWithType: null,
                    openedWithPairs: false,
                    lastOpenScore: 0,
                    canUndoOpen: false,
                    hasUndoneThisRound: false,
                    currentTurnOpenedTileIds: [],
                    openedThisTurn: false
                });
            }
            // Sort hands
            gamePlayers.forEach(p => {
                p.hand = sortBySets(p.hand, okeyTile);
            });
            room.gameState = {
                mode: GameMode.STANDARD,
                players: gamePlayers,
                currentPlayerIndex: 0,
                deck,
                discardPile: [],
                indicator,
                okeyTile,
                phase: GamePhase.DISCARDING, // Player 0 has 22 tiles, must discard
                lastOpeningScore: 0,
                lastOpeningPairs: 0,
                currentOpenScore: 0,
                currentOpenPairs: 0,
                winnerId: null,
                logs: ["Oyun başladı! Okey: " + okeyTile.number + " " + okeyTile.color],
                hasDoubleOpen: false,
                hasOkeyDiscard: false,
                hasContinuationDiscard: false,
                hasHandFinish: false,
                noOneOpened: false,
                roundNumber: 1,
                cumulativeScores: {}
            };
            io.to(roomId).emit('gameStarted', room.gameState);
        }
    });
    // Action dispatcher
    socket.on('gameAction', ({ roomId, action }) => {
        const room = rooms[roomId];
        if (!room || !room.gameState)
            return;
        // Here we will handle actions by modifying room.gameState
        // For now we just sync the entire state sent from client as a shortcut for fast prototyping,
        // BUT normally server should validate. Since user wants to keep the existing version exactly as is,
        // we can use a hybrid approach where the client calculates the next state and sends it to server,
        // OR server processes it. Let's do client-driven state for now to reuse 100% of App.tsx logic!
        if (action.type === 'SYNC_STATE') {
            room.gameState = action.newState;
            socket.to(roomId).emit('gameStateUpdated', room.gameState); // Broadcast to OTHERS
        }
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
