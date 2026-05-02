/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameState, Player, Tile, Combination, GameAction, Color } from "../types";
import { isWildcard, getEffectiveTile, calculateSetScore, isValidGroup, isValidRun, findBestSets, findPairs, isPlayableAnywhere, isRealOkey } from "./okeyEngine";
import { canOpenWithSets, canOpenWithPairs } from "./okeyOpening";

// Basic AI logic for making a move
export const aiTakeTurn = (gameState: GameState, aiPlayer: Player): GameAction | null => {
  // 1. Try to open if possible
  if (!aiPlayer.hasOpened) {
    const possibleSets = findBestSets(aiPlayer.hand, gameState.okeyTile);
    const { valid: canOpenSets, totalScore } = canOpenWithSets(possibleSets, gameState);
    if (canOpenSets) {
      return { type: 'OPEN_HAND', combinations: possibleSets, openType: 'sets' };
    }

    const possiblePairs = findPairs(aiPlayer.hand, gameState.okeyTile);
    const { valid: canOpenPairs, count } = canOpenWithPairs(possiblePairs, gameState);
    if (canOpenPairs) {
      const combinations: Combination[] = possiblePairs.map(p => ({ tiles: p, type: 'pair', score: 0 }));
      return { type: 'OPEN_HAND', combinations, openType: 'pairs' };
    }
  }

  // 2. Discard a tile — güvenli seçim:
  //    - Asla OKEY (gerçek okey) atma
  //    - Mümkünse "işler" taş atma (rakibe yarar, ceza yazar)
  //    - Aday yoksa en yüksek değerli ölü taşı at
  const hand = aiPlayer.hand.filter((t): t is Tile => t !== null);
  if (hand.length === 0) return null;

  const sortedHand = [...hand].sort(
    (a, b) => getEffectiveTile(b, gameState.okeyTile).number - getEffectiveTile(a, gameState.okeyTile).number
  );

  const safe = sortedHand.find(
    t => !isRealOkey(t, gameState.okeyTile) && !isPlayableAnywhere(t, gameState.players, gameState.okeyTile)
  );
  if (safe) return { type: 'DISCARD_TILE', tileId: safe.id };

  const nonOkey = sortedHand.find(t => !isRealOkey(t, gameState.okeyTile));
  if (nonOkey) return { type: 'DISCARD_TILE', tileId: nonOkey.id };

  return { type: 'DISCARD_TILE', tileId: sortedHand[0].id };
};

// Logic for AI to decide whether to draw from deck or discard pile
export const aiDecideDraw = (gameState: GameState, aiPlayer: Player): GameAction => {
  // Simple strategy: always draw from deck unless discard pile has a very useful tile
  // For now, always draw from deck
  return { type: 'DRAW_TILE' };
};
