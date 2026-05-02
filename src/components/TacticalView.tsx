import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Color, Tile, GameState, GamePhase, GameMode, Combination } from "../types";
import { calculateHandTotal, isWildcard, getEffectiveTile, canProcessTile } from "../logic/okeyEngine";

// ─── Tile Color Helpers ──────────────────────────────────────────────────────

const DOT_COLOR: Record<Color, string> = {
  [Color.RED]:    "#dc2626",
  [Color.YELLOW]: "#d97706",
  [Color.BLUE]:   "#2563eb",
  [Color.BLACK]:  "#111827",
  [Color.JOKER]:  "#7c3aed",
};

const TEXT_COLOR_CLASS: Record<Color, string> = {
  [Color.RED]:    "text-red-600",
  [Color.YELLOW]: "text-amber-600",
  [Color.BLUE]:   "text-blue-700",
  [Color.BLACK]:  "text-gray-900",
  [Color.JOKER]:  "text-purple-700",
};

// ─── Tactical Tile ────────────────────────────────────────────────────────────

interface TTileProps {
  tile: Tile;
  selected?: boolean;
  onClick?: () => void;
  size?: "xs" | "sm" | "md";
  okeyTile?: { number: number; color: Color } | null;
  disabled?: boolean;
}

const TTile = ({ tile, selected = false, onClick, size = "sm", okeyTile, disabled }: TTileProps) => {
  const isJoker = tile.color === Color.JOKER;
  const isOkey  = okeyTile && tile.color === okeyTile.color && tile.number === okeyTile.number;

  const sz = {
    xs: "w-7 h-9 text-[10px]",
    sm: "w-9 h-12 text-xs",
    md: "w-11 h-14 text-sm",
  }[size];

  const dotSz = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
  }[size];

  const label = isJoker ? "J" : isOkey ? "★" : tile.number;

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={[
        "relative border-2 flex items-center justify-center font-mono font-bold select-none transition-transform",
        sz,
        selected
          ? "bg-black text-white border-black -translate-y-1 shadow-lg"
          : `bg-white border-black ${onClick && !disabled ? "cursor-pointer hover:-translate-y-px" : ""}`,
        isOkey && !selected ? "border-amber-500" : "",
      ].join(" ")}
    >
      {!isJoker && (
        <span
          className={`absolute top-0.5 left-0.5 rounded-full ${dotSz}`}
          style={{ backgroundColor: selected ? "rgba(255,255,255,0.5)" : DOT_COLOR[tile.color] }}
        />
      )}
      <span className={selected ? "text-white" : isOkey ? "text-amber-600" : TEXT_COLOR_CLASS[tile.color]}>
        {label}
      </span>
    </div>
  );
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TacticalViewProps {
  gameState: GameState;
  selectedTiles: string[];
  totalRounds: number;
  onTileClick: (tile: Tile) => void;
  onDrawFromDeck: () => void;
  onDrawFromDiscard: () => void;
  onDiscardSelected: () => void;
  onTryToOpen: () => void;
  onTryToOpenPairs: () => void;
  onUndoOpen: () => void;
  onProcessTile: (targetPlayerId: string, setIdx: number, type: "set" | "pair") => void;
  onReturnDrawnTile: () => void;
  onNewRound: () => void;
  onNewGame: () => void;
  onSwitchTheme: () => void;
  setTotalRounds: (n: number) => void;
  calculateFinalScores: (gs: GameState, winnerId: string | null, last: Tile | null) => Record<string, number>;
  getFinishType: (gs: GameState, winnerId: string | null, last: Tile | null) => string;
  getScoreExplanation: (score: number, isWinner: boolean, hasOpened: boolean, ft?: string) => string;
  onHandReorder: (newHand: (Tile | null)[]) => void;
  onSortSets: () => void;
  onSortPairs: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TacticalView(props: TacticalViewProps) {
  const {
    gameState, selectedTiles, totalRounds,
    onTileClick, onDrawFromDeck, onDrawFromDiscard, onDiscardSelected,
    onTryToOpen, onTryToOpenPairs, onUndoOpen, onProcessTile,
    onReturnDrawnTile, onNewRound, onNewGame, onSwitchTheme,
    setTotalRounds, calculateFinalScores, getFinishType, getScoreExplanation,
    onHandReorder, onSortSets, onSortPairs,
  } = props;

  // ── Manuel taş taşıma: seçili taş varken boş slota tıklanınca oraya git ──
  const handleSlotClick = (slotIdx: number) => {
    const tile = me.hand[slotIdx];
    if (tile) {
      onTileClick(tile);
    } else if (selectedTiles.length === 1) {
      const srcIdx = me.hand.findIndex(t => t?.id === selectedTiles[0]);
      if (srcIdx !== -1) {
        const newHand = [...me.hand];
        newHand[slotIdx] = newHand[srcIdx];
        newHand[srcIdx] = null;
        onHandReorder(newHand);
      }
    }
  };

  const logEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [gameState.logs]);

  const me = gameState.players[0];
  const ai1 = gameState.players[1];
  const ai2 = gameState.players[2];
  const ai3 = gameState.players[3];
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = gameState.currentPlayerIndex === 0;
  const topDiscard = gameState.discardPile.length > 0 ? gameState.discardPile[gameState.discardPile.length - 1] : null;
  const handTiles = me.hand.filter((t): t is Tile => t !== null);
  const handValue = calculateHandTotal(me.hand, gameState.okeyTile);

  const allOpenedSets: { player: typeof me; setIdx: number; set: Combination }[] = [];
  gameState.players.forEach(p =>
    p.openedSets.forEach((s, i) => allOpenedSets.push({ player: p, setIdx: i, set: s }))
  );

  const canDraw    = isMyTurn && gameState.phase === GamePhase.DRAWING;
  const canDiscard = isMyTurn && gameState.phase === GamePhase.PLAYING && selectedTiles.length === 1;
  const canOpen    = isMyTurn && gameState.phase === GamePhase.PLAYING;

  const penaltyTotal = me.score;

  const gameId = `#${Math.abs(gameState.logs.length * 12345 + gameState.roundNumber * 9999).toString().slice(0, 10).padEnd(10, "0")}`;

  const scoreRows = gameState.players.map(p => {
    const cumul = gameState.cumulativeScores[p.id] ?? 0;
    return { name: p.name.replace("Sen", "P1").replace("AI ", "P"), cumul, score: p.score };
  });

  return (
    <div className="min-h-screen bg-white text-black font-mono text-[13px] flex flex-col select-none overflow-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="px-4 pt-3 pb-2 border-b-2 border-black flex justify-between items-end uppercase tracking-widest">
        <div>
          <div className="text-xl font-bold leading-none">TACTICAL 101</div>
          <div className="text-[10px] text-gray-500 mt-0.5">ID: {gameId}</div>
        </div>
        <div className="flex items-end gap-8 text-right">
          <div>
            <div>ROUND: {gameState.roundNumber}/{totalRounds}</div>
            <div>PENALTY: {penaltyTotal}</div>
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={totalRounds}
              onChange={e => setTotalRounds(Number(e.target.value))}
              className="border border-black px-1 py-0.5 text-[10px] font-mono uppercase bg-white"
            >
              {[1, 3, 5, 7].map(n => <option key={n} value={n}>{n} EL</option>)}
            </select>
            <button
              onClick={onNewGame}
              className="border border-black px-2 py-0.5 text-[10px] uppercase hover:bg-black hover:text-white transition-colors"
            >
              NEW GAME
            </button>
            <button
              onClick={onSwitchTheme}
              className="border border-black px-2 py-0.5 text-[10px] uppercase hover:bg-black hover:text-white transition-colors"
            >
              CLASSIC ↩
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0">

        {/* ── MAIN PLAY AREA ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col border-r-2 border-black min-w-0">

          {/* Opponents */}
          <div className="border-b border-dashed border-black px-4 py-2 flex justify-between text-[11px] uppercase">
            {[ai1, ai2, ai3].map((ai, i) => {
              const pos = ["P2: AI_WEST", "P3: AI_NORTH", "P4: AI_EAST"][i];
              const handCount = ai.hand.filter(t => t !== null).length;
              const isActive = gameState.currentPlayerIndex === i + 1;
              return (
                <div key={ai.id} className={`${i === 1 ? "text-center" : i === 2 ? "text-right" : ""} ${isActive ? "font-bold" : ""}`}>
                  <div className={isActive ? "underline" : ""}>{pos}{isActive ? " ◀" : ""}</div>
                  <div>HAND: {handCount}</div>
                  <div className={ai.score > 0 ? "text-red-600" : "text-gray-700"}>
                    SCORE: {ai.score > 0 ? `+${ai.score}` : ai.score}
                  </div>
                  {ai.hasOpened && <div className="text-[9px] text-gray-500">[OPEN]</div>}
                </div>
              );
            })}
          </div>

          {/* Table center: draw pile + opened sets + discard */}
          <div className="flex-1 flex items-center justify-around px-4 py-3 min-h-0">

            {/* Draw pile */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-[10px] uppercase tracking-widest text-gray-500">Draw Pile</div>
              <button
                onClick={canDraw ? onDrawFromDeck : undefined}
                disabled={!canDraw}
                className={[
                  "w-12 h-16 border-2 flex items-center justify-center transition-colors",
                  canDraw
                    ? "bg-black text-white border-black hover:bg-gray-800 cursor-pointer"
                    : "bg-black text-white border-black opacity-70 cursor-default",
                ].join(" ")}
              >
                <span className="text-sm font-bold">{gameState.deck.length}</span>
              </button>
            </div>

            {/* Opened sets */}
            <div className="flex flex-col items-center gap-2 flex-1 px-4">
              <div className="text-[10px] uppercase tracking-widest text-gray-500">Opened Sets</div>
              {allOpenedSets.length === 0 ? (
                <div className="text-[10px] text-gray-400 border border-dashed border-gray-300 px-4 py-2">NONE YET</div>
              ) : (
                <div className="flex flex-wrap justify-center gap-2 max-h-36 overflow-y-auto">
                  {allOpenedSets.map(({ player, setIdx, set }) => (
                    <div key={`${player.id}-${setIdx}`} className="flex flex-col items-start gap-0.5">
                      <div className="text-[8px] text-gray-400 uppercase">{player.name}</div>
                      <div
                        className={[
                          "flex border border-black p-0.5 gap-0.5 transition-colors",
                          isMyTurn && me.hasOpened && gameState.phase === GamePhase.PLAYING
                            ? "hover:bg-gray-50 cursor-pointer"
                            : "",
                        ].join(" ")}
                        onClick={() => {
                          if (!isMyTurn || !me.hasOpened || gameState.phase !== GamePhase.PLAYING) return;
                          if (selectedTiles.length === 1) onProcessTile(player.id, setIdx, "set");
                        }}
                      >
                        {set.tiles.map((t, ti) => (
                          <TTile key={t.id + ti} tile={t} size="xs" okeyTile={gameState.okeyTile} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discard pile */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="text-[10px] uppercase tracking-widest text-gray-500">Discard Pile</div>
              {topDiscard ? (
                <button
                  onClick={canDraw ? onDrawFromDiscard : undefined}
                  disabled={!canDraw}
                  className={canDraw ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-default"}
                >
                  <TTile tile={topDiscard} size="md" okeyTile={gameState.okeyTile} />
                </button>
              ) : (
                <div className="w-11 h-14 border-2 border-dashed border-gray-300 flex items-center justify-center text-[9px] text-gray-400">
                  EMPTY
                </div>
              )}
            </div>
          </div>

          {/* ── PLAYER HAND ─────────────────────────────────────────── */}
          <div className="border-t-2 border-black px-4 pt-2 pb-2">
            <div className="flex justify-between items-center mb-1.5 uppercase text-[11px]">
              <div className={`font-bold ${isMyTurn ? "underline" : ""}`}>
                P1: YOU{isMyTurn ? " (ACTIVE)" : ""}
                {me.hasOpened && <span className="ml-2 text-[9px] text-gray-500">[OPEN]</span>}
                {me.mustOpen && !me.hasOpened && <span className="ml-2 text-[9px] text-amber-600">[MUST OPEN]</span>}
              </div>
              <div>HAND VALUE: {handValue} | BARAJ: {gameState.currentOpenScore || 101}</div>
            </div>

            {/* 2-row rack — 15 slots per row, mirrors classic Rack */}
            {/* Click tile to select; click empty slot to move selected tile there */}
            <div
              className="p-1 border border-black bg-gray-50"
              style={{ display: "grid", gridTemplateColumns: "repeat(15, minmax(0,1fr))", gap: "2px" }}
            >
              {Array.from({ length: 30 }, (_, slotIdx) => {
                const tile = me.hand[slotIdx] ?? null;
                const isSelected = tile ? selectedTiles.includes(tile.id) : false;
                const isDropTarget = !tile && selectedTiles.length === 1 && isMyTurn;
                if (!tile) {
                  return (
                    <div
                      key={slotIdx}
                      onClick={() => handleSlotClick(slotIdx)}
                      className={[
                        "border rounded-sm transition-colors",
                        isDropTarget
                          ? "border-black bg-gray-200 cursor-pointer"
                          : "border-dashed border-gray-300",
                      ].join(" ")}
                      style={{ height: "44px" }}
                    />
                  );
                }
                return (
                  <TTile
                    key={tile.id}
                    tile={tile}
                    size="sm"
                    selected={isSelected}
                    okeyTile={gameState.okeyTile}
                    onClick={() => handleSlotClick(slotIdx)}
                    disabled={!isMyTurn || gameState.phase === GamePhase.DRAWING}
                  />
                );
              })}
            </div>
          </div>

          {/* ── ACTION BUTTONS ──────────────────────────────────────── */}
          <div className="border-t border-black px-4 pt-2 pb-1 flex flex-wrap gap-1.5">
            <Btn label="DRAW DECK"     onClick={onDrawFromDeck}     disabled={!canDraw} />
            <Btn label="DRAW DISCARD"  onClick={onDrawFromDiscard}  disabled={!canDraw || !topDiscard} />
            <Btn label="DISCARD"       onClick={onDiscardSelected}  disabled={!canDiscard} />
            <Btn label="OPEN SETS"     onClick={onTryToOpen}        disabled={!canOpen} solid />
            <Btn label="OPEN PAIRS"    onClick={onTryToOpenPairs}   disabled={!canOpen} solid />
            <Btn label="UNDO"          onClick={onUndoOpen}         disabled={!isMyTurn || !me.canUndoOpen} dashed />
            {!!me.drawnFromDiscardTile && (
              <Btn label="GERİ BIRAK" onClick={onReturnDrawnTile} disabled={!isMyTurn} dashed />
            )}
          </div>
          {/* ── SORT BUTTONS ────────────────────────────────────────── */}
          <div className="px-4 pb-2 flex gap-1.5">
            <Btn label="SORT SETS"  onClick={onSortSets}  disabled={false} />
            <Btn label="SORT PAIRS" onClick={onSortPairs} disabled={false} />
          </div>

          {/* Phase indicator */}
          <div className="border-t border-dashed border-gray-300 px-4 py-1 text-[9px] text-gray-500 uppercase tracking-widest">
            {isMyTurn
              ? gameState.phase === GamePhase.DRAWING
                ? "▶ YOUR TURN — DRAW A TILE"
                : gameState.phase === GamePhase.PLAYING
                ? "▶ YOUR TURN — SELECT ACTION"
                : "▶ WAITING..."
              : `▶ ${currentPlayer.name.toUpperCase()} IS THINKING...`}
          </div>
        </div>

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <div className="w-72 flex flex-col shrink-0">

          {/* SYS.LOG */}
          <div className="flex-1 flex flex-col border-b-2 border-black min-h-0">
            <div className="px-3 py-1.5 border-b border-black text-[10px] font-bold uppercase tracking-widest">
              SYS.LOG
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 text-[9px] leading-relaxed font-mono text-gray-600">
              {gameState.logs.map((log, i) => {
                const isLast = i === gameState.logs.length - 1;
                const isPenalty = log.toLowerCase().includes("ceza");
                return (
                  <div
                    key={i}
                    className={[
                      isLast ? "text-black font-bold" : "",
                      isPenalty ? "text-red-600" : "",
                    ].join(" ")}
                  >
                    [{String(i + 1).padStart(3, "0")}] {log.toUpperCase()}
                  </div>
                );
              })}
              <div ref={logEndRef} />
            </div>
            <div className="px-3 py-1.5 border-t border-black text-[10px] text-gray-500 flex gap-1">
              <span>&gt;</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>

          {/* SCORE.TRK */}
          <div className="flex flex-col">
            <div className="px-3 py-1.5 border-b border-black text-[10px] font-bold uppercase tracking-widest">
              SCORE.TRK
            </div>
            <div className="px-3 py-2">
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="border-b border-dashed border-gray-400">
                    <th className="py-1 text-left font-bold">P</th>
                    <th className="py-1 text-left font-bold">THIS RND</th>
                    <th className="py-1 text-left font-bold">CUMULATIVE</th>
                  </tr>
                </thead>
                <tbody>
                  {gameState.players.map((p, i) => {
                    const cumul = gameState.cumulativeScores[p.id] ?? 0;
                    const label = i === 0 ? "P1 (YOU)" : `P${i + 1}`;
                    return (
                      <tr key={p.id} className={`border-b border-dotted border-gray-200 ${i === 0 ? "font-bold" : ""}`}>
                        <td className="py-1">{label}</td>
                        <td className={`py-1 ${p.score > 0 ? "text-red-600" : "text-gray-700"}`}>
                          {p.score > 0 ? `+${p.score}` : p.score}
                        </td>
                        <td className={`py-1 ${cumul > 0 ? "text-red-600" : "text-gray-700"}`}>
                          {cumul > 0 ? `+${cumul}` : cumul}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Indicator */}
            <div className="px-3 pb-2 flex items-center gap-2 border-t border-dashed border-gray-300 pt-2">
              <span className="text-[9px] uppercase text-gray-500">INDICATOR:</span>
              {gameState.indicator && (
                <TTile tile={gameState.indicator} size="xs" okeyTile={null} />
              )}
              <span className="text-[9px] uppercase text-gray-500">OKEY:</span>
              {gameState.okeyTile && (
                <div className="text-[10px] font-bold">
                  {gameState.okeyTile.number}{gameState.okeyTile.color[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── WIN MODAL ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {gameState.phase === GamePhase.FINISHED && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="relative bg-white border-2 border-black w-full max-w-md font-mono"
            >
              {/* Modal header */}
              <div className="border-b-2 border-black px-6 py-3 flex justify-between items-center uppercase tracking-widest">
                <span className="font-bold text-sm">
                  {gameState.winnerId ? "ROUND COMPLETE" : "GAME OVER"}
                </span>
                <span className="text-[10px] text-gray-500">
                  EL {gameState.roundNumber}/{totalRounds}
                </span>
              </div>

              <div className="px-6 py-4">
                <div className="text-center mb-4 text-[11px] uppercase tracking-widest text-gray-600">
                  {gameState.winnerId
                    ? `WINNER: ${gameState.players.find(p => p.id === gameState.winnerId)?.name.toUpperCase()}`
                    : gameState.noOneOpened
                    ? "NO OPENER — ALL PLAYERS PENALIZED"
                    : "DECK EXHAUSTED"}
                </div>

                {/* Score breakdown */}
                <table className="w-full text-[10px] border-collapse mb-4">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="py-1 text-left">PLAYER</th>
                      <th className="py-1 text-right">THIS ROUND</th>
                      <th className="py-1 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const lastDiscard = gameState.discardPile.length > 0 ? gameState.discardPile[gameState.discardPile.length - 1] : null;
                      const finals = calculateFinalScores(gameState, gameState.winnerId, lastDiscard);
                      const ft = getFinishType(gameState, gameState.winnerId, lastDiscard);
                      return gameState.players.map(p => {
                        const score = finals[p.id] ?? 0;
                        const isWinner = p.id === gameState.winnerId;
                        const prevCumul = gameState.cumulativeScores[p.id] ?? 0;
                        const newCumul = prevCumul + score;
                        return (
                          <tr key={p.id} className={`border-b border-dashed border-gray-300 ${isWinner ? "font-bold" : ""}`}>
                            <td className="py-1.5">
                              {p.name.toUpperCase()}
                              {isWinner && " ★"}
                            </td>
                            <td className={`py-1.5 text-right ${score < 0 ? "text-emerald-700" : score > 0 ? "text-red-600" : "text-gray-500"}`}>
                              {score > 0 ? `+${score}` : score}
                            </td>
                            <td className={`py-1.5 text-right ${newCumul < 0 ? "text-emerald-700" : newCumul > 0 ? "text-red-600" : "text-gray-500"}`}>
                              {newCumul > 0 ? `+${newCumul}` : newCumul}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>

                {/* Actions */}
                <div className="flex gap-2">
                  {gameState.roundNumber < totalRounds && (
                    <button
                      onClick={onNewRound}
                      className="flex-1 py-2 border-2 border-black bg-black text-white uppercase text-[11px] tracking-widest font-bold hover:bg-gray-800 transition-colors"
                    >
                      NEXT ROUND →
                    </button>
                  )}
                  <button
                    onClick={onNewGame}
                    className={[
                      "py-2 border-2 border-black uppercase text-[11px] tracking-widest font-bold transition-colors",
                      gameState.roundNumber < totalRounds
                        ? "px-4 bg-white text-black hover:bg-gray-100"
                        : "flex-1 bg-black text-white hover:bg-gray-800",
                    ].join(" ")}
                  >
                    NEW GAME
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Small Button Helper ──────────────────────────────────────────────────────

function Btn({
  label, onClick, disabled, solid, dashed, outline,
}: {
  label: string; onClick: () => void; disabled?: boolean;
  solid?: boolean; dashed?: boolean; outline?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        "flex-1 py-1.5 text-[10px] uppercase tracking-widest font-bold border-2 transition-colors",
        dashed ? "border-dashed" : "",
        solid && !disabled
          ? "bg-black text-white border-black hover:bg-gray-800"
          : !disabled
          ? "bg-white text-black border-black hover:bg-gray-100"
          : "bg-white text-gray-400 border-gray-300 cursor-default",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
