const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We want to replace `setGameState(` with `updateGameState(`
// EXCEPT for `const [gameState, setGameState] = useState`
// and `setGameState(state);` inside socket listener.

code = code.replace(/setGameState\(/g, 'updateGameState(');
code = code.replace(/const \[gameState, updateGameState\] = useState/g, 'const [gameState, setGameState] = useState');
code = code.replace(/updateGameState\(state\);/g, 'setGameState(state);'); // inside socket listener

// Add the updateGameState definition right after the socket states
const updateFunc = `
  const updateGameState = useCallback((newState: React.SetStateAction<GameState | null>) => {
    setGameState((prev) => {
      const computedState = typeof newState === 'function' ? (newState as any)(prev) : newState;
      if (computedState && socket && roomId) {
         socket.emit('gameAction', { roomId, action: { type: 'SYNC_STATE', newState: computedState } });
      }
      return computedState;
    });
  }, [socket, roomId]);
`;

code = code.replace('const [socket, setSocket] = useState<Socket | null>(null);', 'const [socket, setSocket] = useState<Socket | null>(null);\n' + updateFunc);

fs.writeFileSync('src/App.tsx', code);
