const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/setGameState\(/g, 'updateGameState(');
code = code.replace(/const \[gameState, updateGameState\] = useState/g, 'const [gameState, setGameState] = useState');
code = code.replace(/updateGameState\(state\);/g, 'setGameState(state);');

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
