/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Color, Tile, Player, Combination, GameMode, GameState, GamePhase } from "../types";

export const COLORS = [Color.RED, Color.YELLOW, Color.BLACK, Color.BLUE];

/**
 * Generates a standard 106 tile deck
 */
export const createDeck = (): Tile[] => {
  const deck: Tile[] = [];
  let id = 0;
  for (const color of COLORS) {
    for (let num = 1; num <= 13; num++) {
      deck.push({ id: `tile-${id++}`, number: num, color, isOkey: false, isIndicator: false });
      deck.push({ id: `tile-${id++}`, number: num, color, isOkey: false, isIndicator: false });
    }
  }
  deck.push({ id: `tile-${id++}`, number: 0, color: Color.JOKER, isOkey: false, isIndicator: false });
  deck.push({ id: `tile-${id++}`, number: 0, color: Color.JOKER, isOkey: false, isIndicator: false });
  return deck;
};

export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const determineOkey = (indicator: Tile) => {
  let okeyNum = indicator.number + 1;
  if (okeyNum > 13) okeyNum = 1;
  return { number: okeyNum, color: indicator.color };
};

export const isRealOkey = (tile: Tile | null | undefined, okeyTile: { number: number; color: Color } | null): boolean => {
  if (!tile) return false;
  return !!(okeyTile && tile.number === okeyTile.number && tile.color === okeyTile.color);
};

export const isFakeOkey = (tile: Tile | null | undefined): boolean => {
  return tile?.color === Color.JOKER;
};

export const isWildcard = (tile: Tile | null | undefined, okeyTile: { number: number; color: Color } | null): boolean => {
  if (!tile) return false;
  // Sadece gerçek okey wildcard'dır
  return isRealOkey(tile, okeyTile);
};


export const getEffectiveTile = (tile: Tile, okeyTile: { number: number; color: Color } | null): { number: number, color: Color } => {
  // Joker, okey'nin yerini tutar - okey'nin sayı/rengi olarak davranır
  if (isFakeOkey(tile) && okeyTile) {
    return { number: okeyTile.number, color: okeyTile.color };
  }
  return { number: tile.number, color: tile.color };
};

export const getTileScore = (tile: Tile, okeyTile: { number: number; color: Color } | null): number => {
  if (isRealOkey(tile, okeyTile)) return 101;
  // Sahte Okey (Joker), okeyin değerine sahiptir.
  if (isFakeOkey(tile) && okeyTile) return okeyTile.number;
  return tile.number;
};


export const calculateDiscardPenalty = (tile: Tile, gameState: GameState, player: Player): { penalty: number; reason: string | null } => {
  let penalty = 0;
  let reason: string | null = null;

  if (isPlayableAnywhere(tile, gameState.players, gameState.okeyTile)) {
    penalty += 101;
    reason = `${player.name} işler taş attığı için 101 ceza aldı!`;
  }

  if (isRealOkey(tile, gameState.okeyTile)) {
    penalty += 101;
    const okeyReason = `${player.name} OKEY attığı için 101 ceza aldı!`;
    reason = reason ? `${reason}\n${okeyReason}` : okeyReason;
  }

  return { penalty, reason };
};

export const calculateSetScore = (set: Combination, okeyTile: { number: number; color: Color } | null): number => {
    // Önce setin geçerliliğini teyit et
    if (set.type === "group" && !isValidGroup(set.tiles, okeyTile)) return 0;
    if (set.type === "run" && !isValidRun(set.tiles, okeyTile)) return 0;

    let score = 0;
    if (set.type === "group") {
        const normalTile = set.tiles.find(t => !isWildcard(t, okeyTile));
        if (!normalTile) return 0;
        const effective = getEffectiveTile(normalTile, okeyTile);
        let val = effective.number;
        score = val * set.tiles.length;
    } else {
        const startNum = getRunStartNum(set.tiles, okeyTile);
        let sum = 0;
        for (let i = 0; i < set.tiles.length; i++) {
            sum += (startNum + i);
        }
        score = sum;
        score += 0.01; 
    }
    
    const okeyCount = set.tiles.filter(t => isWildcard(t, okeyTile)).length;
    if (okeyCount > 1) {
        score -= 0.1; 
    }
    return score;
};

export const isValidGroup = (tiles: Tile[], okeyTile: { number: number; color: Color } | null): boolean => {
  if (tiles.length < 3 || tiles.length > 4) return false;
  const normalTiles = tiles.filter(t => !isWildcard(t, okeyTile)).map(t => getEffectiveTile(t, okeyTile));
  if (normalTiles.length === 0) return true;
  const number = normalTiles[0].number;
  if (normalTiles.some(t => t.number !== number)) return false;
  const colors = normalTiles.map(t => t.color);
  if (new Set(colors).size !== colors.length) return false;
  return true;
};

export const getRunStartNum = (tiles: Tile[], okeyTile: { number: number; color: Color } | null): number => {
    const normalTiles = tiles.filter(t => !isWildcard(t, okeyTile));
    if (normalTiles.length === 0) return 1;
    const minNormal = Math.min(...normalTiles.map(t => getEffectiveTile(t, okeyTile).number));
    const firstNormalIdx = tiles.findIndex(t => !isWildcard(t, okeyTile));
    let startNum = minNormal - firstNormalIdx;
    
    // Seri 1-13 sınırları içinde kalacak şekilde ayarla
    if (startNum + tiles.length - 1 > 13) startNum = 13 - tiles.length + 1;
    if (startNum < 1) startNum = 1;
    return startNum;
};

export const isValidRun = (tiles: Tile[], okeyTile: { number: number; color: Color } | null): boolean => {
  if (tiles.length < 3) return false;
  const normalTiles = tiles.filter(t => !isWildcard(t, okeyTile));
  if (normalTiles.length === 0) return true;
  
  const effNormal = normalTiles.map(t => getEffectiveTile(t, okeyTile));
  const color = effNormal[0].color;
  if (effNormal.some(t => t.color !== color)) return false;

  // Sıralama doğrulaması ve duplicate kontrolü
  const startNum = getRunStartNum(tiles, okeyTile);
  const endNum = startNum + tiles.length - 1;

  if (startNum < 1 || endNum > 13) return false;

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    if (isWildcard(tile, okeyTile)) continue;
    
    const eff = getEffectiveTile(tile, okeyTile);
    if (eff.number !== startNum + i) return false;
  }

  return true;
};

const getCombinations = <T>(array: T[], k: number): T[][] => {
  const result: T[][] = [];
  const f = (start: number, prev: T[]) => {
    if (prev.length === k) { result.push(prev); return; }
    for (let i = start; i < array.length; i++) f(i + 1, [...prev, array[i]]);
  };
  f(0, []);
  return result;
};

const generateTileCombos = (tilesBySlot: Tile[][]): Tile[][] => {
  if (tilesBySlot.length === 0) return [[]];
  const firstSlot = tilesBySlot[0];
  const rest = generateTileCombos(tilesBySlot.slice(1));
  const result: Tile[][] = [];
  for (const t of firstSlot) {
    for (const r of rest) {
      result.push([t, ...r]);
    }
  }
  return result;
};

export const findBestSets = (hand: (Tile | null)[], okeyTile: { number: number; color: Color } | null): Combination[] => {
  const tiles = hand.filter((t): t is Tile => t !== null);
  const allCandidates: Combination[] = [];
  const wildcards = tiles.filter(t => isWildcard(t, okeyTile));

  for (let num = 1; num <= 13; num++) {
    const tilesOfNum = tiles.filter(t => !isWildcard(t, okeyTile) && getEffectiveTile(t, okeyTile).number === num);
    const tilesByColor: Record<string, Tile[]> = { [Color.RED]: [], [Color.YELLOW]: [], [Color.BLACK]: [], [Color.BLUE]: [] };
    tilesOfNum.forEach(t => tilesByColor[getEffectiveTile(t, okeyTile).color].push(t));

    for (let len = 3; len <= 4; len++) {
      const colorCombos = getCombinations(COLORS, len);
      for (const colors of colorCombos) {
        const slots = colors.map(c => tilesByColor[c]);
        const emptySlotCount = slots.filter(s => s.length === 0).length;
        if (emptySlotCount > wildcards.length) continue;

        const filledSlots = slots.filter(s => s.length > 0);
        const tileCombos = generateTileCombos(filledSlots);
        const okeyCombos = emptySlotCount > 0 ? getCombinations(wildcards, emptySlotCount) : [[]];

        for (const tCombo of tileCombos) {
          for (const okeys of okeyCombos) {
            const setTiles = [...tCombo, ...okeys];
            if (!isValidGroup(setTiles, okeyTile)) continue;
            const score = calculateSetScore({ tiles: setTiles, type: "group", score: 0 }, okeyTile);
            if (score > 0) allCandidates.push({ tiles: setTiles, type: "group", score });
          }
        }
      }
    }
  }

    for (const color of COLORS) {
    const colorTiles = tiles.filter(t => !isWildcard(t, okeyTile) && getEffectiveTile(t, okeyTile).color === color);
    const tilesByNum: Tile[][] = Array.from({ length: 14 }, () => []);
    colorTiles.forEach(t => tilesByNum[getEffectiveTile(t, okeyTile).number].push(t));

    for (let len = 3; len <= 13; len++) {
      for (let startNum = 1; startNum <= 13 - len + 1; startNum++) {
        const slots: Tile[][] = [];
        let neededWilds = 0;
        for (let n = startNum; n < startNum + len; n++) {
          if (tilesByNum[n].length > 0) {
            slots.push(tilesByNum[n]);
          } else {
            slots.push([]); // Placeholder
            neededWilds++;
          }
        }

        if (neededWilds > wildcards.length) continue;

        const filledSlots = slots.map((s, i) => ({ s, i })).filter(x => x.s.length > 0);
        const tCombos = generateTileCombos(filledSlots.map(x => x.s));
        const okeyCombos = neededWilds > 0 ? getCombinations(wildcards, neededWilds) : [[]];

        for (const tCombo of tCombos) {
          for (const okeys of okeyCombos) {
            const finalTiles: Tile[] = new Array(len);
            let tIdx = 0;
            let oIdx = 0;
            for (let i = 0; i < len; i++) {
              if (slots[i].length > 0) finalTiles[i] = tCombo[tIdx++];
              else finalTiles[i] = okeys[oIdx++];
            }
            if (!isValidRun(finalTiles, okeyTile)) continue;
            const score = calculateSetScore({ tiles: finalTiles, type: "run", score: 0 }, okeyTile);
            if (score > 0) allCandidates.push({ tiles: finalTiles, type: "run", score });
          }
        }
      }
    }
  }

  allCandidates.sort((a, b) => b.score - a.score);
  let bestResult: Combination[] = [];
  let bestScore = 0;
  const usedIds = new Set<string>();
  const suffixMax = new Array(allCandidates.length + 1).fill(0);
  for (let i = allCandidates.length - 1; i >= 0; i--) suffixMax[i] = suffixMax[i + 1] + allCandidates[i].score;

  function backtrack(idx: number, current: Combination[], score: number) {
    if (score > bestScore) { bestScore = score; bestResult = [...current]; }
    if (idx >= allCandidates.length || score + suffixMax[idx] <= bestScore) return;
    for (let i = idx; i < allCandidates.length; i++) {
      const candidate = allCandidates[i];
      if (candidate.tiles.some(t => usedIds.has(t.id))) continue;
      candidate.tiles.forEach(t => usedIds.add(t.id));
      current.push(candidate);
      backtrack(i + 1, current, score + candidate.score);
      current.pop();
      candidate.tiles.forEach(t => usedIds.delete(t.id));
    }
  }
  backtrack(0, [], 0);
  return bestResult;
};

export const findPairs = (hand: (Tile | null)[], okeyTile: { number: number; color: Color } | null, allowOkeyWithNormal: boolean = true): Tile[][] => {
  const tiles = hand.filter((t): t is Tile => t !== null);
  const pairs: Tile[][] = [];
  const usedIds = new Set<string>();
  
  // 1) Normal ve Sahte Okey'leri eşleştir (getEffectiveTile sayesinde sahte okeyler normal taş gibi davranır)
  const normalAndFakeTiles = tiles.filter(t => !isWildcard(t, okeyTile));
  const realOkeys = tiles.filter(t => isRealOkey(t, okeyTile));

  for (let i = 0; i < normalAndFakeTiles.length; i++) {
    if (usedIds.has(normalAndFakeTiles[i].id)) continue;
    for (let j = i + 1; j < normalAndFakeTiles.length; j++) {
      if (usedIds.has(normalAndFakeTiles[j].id)) continue;
      const t1 = getEffectiveTile(normalAndFakeTiles[i], okeyTile);
      const t2 = getEffectiveTile(normalAndFakeTiles[j], okeyTile);
      if (t1.number === t2.number && t1.color === t2.color) {
        pairs.push([normalAndFakeTiles[i], normalAndFakeTiles[j]]);
        usedIds.add(normalAndFakeTiles[i].id);
        usedIds.add(normalAndFakeTiles[j].id);
        break;
      }
    }
  }

  // 2) Gerçek okeyleri kendi aralarında eşleştir (2 okey = 1 çift)
  const availableOkeys = realOkeys.filter(t => !usedIds.has(t.id));
  for (let i = 0; i < availableOkeys.length - 1; i += 2) {
    pairs.push([availableOkeys[i], availableOkeys[i + 1]]);
    usedIds.add(availableOkeys[i].id);
    usedIds.add(availableOkeys[i + 1].id);
  }

  // 3) Kalan gerçek okey'leri, eşi olmayan farklı bir taşla çift oluştur (Opsiyonel)
  if (allowOkeyWithNormal) {
    const remainingOkeys = availableOkeys.filter(t => !usedIds.has(t.id));
    const lonelyTiles = normalAndFakeTiles.filter(t => !usedIds.has(t.id));
    for (const okey of remainingOkeys) {
      const partner = lonelyTiles.find(t => !usedIds.has(t.id));
      if (!partner) break;
      pairs.push([partner, okey]);
      usedIds.add(partner.id);
      usedIds.add(okey.id);
    }
  }

  return pairs;
};

export const calculateHandTotal = (hand: (Tile | null)[], okeyTile: { number: number; color: Color } | null): number => {
  return hand.reduce((sum, tile) => sum + (tile ? getTileScore(tile, okeyTile) : 0), 0);
};


export const sortByPairs = (hand: (Tile | null)[], okeyTile: { number: number; color: Color } | null): (Tile | null)[] => {
  const tiles = hand.filter((t): t is Tile => t !== null);
  const pairs = findPairs(tiles, okeyTile, false);
  const pairedIds = new Set(pairs.flat().map(t => t.id));
  const remainingTiles = tiles.filter(t => !pairedIds.has(t.id)).sort((a,b) => a.number - b.number);
  
  const result: (Tile | null)[] = new Array(30).fill(null);
  let pos = 0;
  pairs.forEach(pair => {
    if (pos + 1 < 30) {
      result[pos++] = pair[0];
      result[pos++] = pair[1];
      pos++; 
    }
  });
  
  remainingTiles.forEach(t => {
    if (pos < 30) result[pos++] = t;
  });
  return result;
};

export const sortBySets = (hand: (Tile | null)[], okeyTile: { number: number; color: Color } | null): (Tile | null)[] => {
  const tiles = hand.filter((t): t is Tile => t !== null);
  const sets = findBestSets(tiles, okeyTile);
  const usedIds = new Set(sets.flatMap(s => s.tiles).map(t => t.id));
  const remainingTiles = tiles.filter(t => !usedIds.has(t.id));

  const result: (Tile | null)[] = new Array(30).fill(null);

  // 1. Irkartaları sırala ve EN SAĞDAN yerleştir — setlerle asla karışmasın
  const leftovers = [...remainingTiles].sort((a, b) => {
    const effA = getEffectiveTile(a, okeyTile);
    const effB = getEffectiveTile(b, okeyTile);
    if (effA.color !== effB.color) return COLORS.indexOf(effA.color) - COLORS.indexOf(effB.color);
    return effA.number - effB.number;
  });

  let rightPos = 29;
  for (let i = leftovers.length - 1; i >= 0; i--) {
    result[rightPos--] = leftovers[i];
  }
  // rightPos artık setlerin kullanabileceği son slot (dahil)
  const setsBoundary = rightPos;

  // 2. Setleri soldan yerleştir
  let pos = 0;
  for (const set of sets) {
    const tiles = set.tiles;
    const chunks: Tile[][] = [];
    
    if (tiles.length >= 6) {
      let n = tiles.length;
      let offset = 0;
      while (n > 0) {
        let size = (n % 3 === 0) ? 3 : 4;
        chunks.push(tiles.slice(offset, offset + size));
        offset += size;
        n -= size;
      }
    } else {
      chunks.push(tiles);
    }

    for (const chunk of chunks) {
      if (pos + chunk.length > setsBoundary) break;
      chunk.forEach(t => { result[pos++] = t; });
      if (pos <= setsBoundary) pos++; // gruplar arası boşluk
    }
  }

  return result;
};

export const calculatePenalty = (player: Player, isHandFinished: boolean, gameState: GameState): number => {
  if (!player.hasOpened) return 202;
  const sum = player.hand.reduce((s, t) => s + (t ? getTileScore(t, gameState.okeyTile) : 0), 0);
  return player.openedWithType === 'pairs' ? sum * 2 : sum;
};

export const canProcessTile = (tile: Tile, set: Combination, okeyTile: { number: number; color: Color } | null): boolean => {
  const newTiles = [...set.tiles, tile];
  if (set.type === "group") {
    return isValidGroup(newTiles, okeyTile);
  }
  
  // Seri için hem uçlara ekleme kontrolü hem de genel geçerlilik kontrolü
  const startNum = getRunStartNum(set.tiles, okeyTile);
  const endNum = startNum + set.tiles.length - 1;

  const effectiveTile = getEffectiveTile(tile, okeyTile);
  
  // Okey ise uçlardan birine ekleyebilmeli
  if (isWildcard(tile, okeyTile)) {
    if (startNum <= 1 && endNum >= 13) return false;
  } else {
    // Normal taş ise rengi tutmalı ve tam uca gelmeli
    const runColor = getEffectiveTile(set.tiles.find(t => !isWildcard(t, okeyTile))!, okeyTile).color;
    if (effectiveTile.color !== runColor) return false;
    if (effectiveTile.number !== startNum - 1 && effectiveTile.number !== endNum + 1) return false;
  }

  // Son olarak oluşan yeni setin geçerli olduğunu teyit et (duplicate vb. için)
  // Not: startNum - 1 durumunda yeni startNum bir azalacağı için isValidRun doğru çalışır.
  // Ancak push her zaman sona eklediği için, eğer başa ekleniyorsa sorting gerekebilir.
  // canProcessTile sadece "eklenebilir mi" sorusuna cevap verir.
  
  if (effectiveTile.number === startNum - 1) {
      return isValidRun([tile, ...set.tiles], okeyTile);
  }
  return isValidRun([...set.tiles, tile], okeyTile);
};

export const canSwapOkey = (tile: Tile, set: Combination, okeyTile: { number: number; color: Color } | null): boolean => {
  if (isWildcard(tile, okeyTile)) return false;
  if (!set.tiles.some(t => isWildcard(t, okeyTile))) return false;

  if (set.type === "group") {
    const normalTiles = set.tiles.filter(t => !isWildcard(t, okeyTile));
    if (normalTiles.length === 0) return false;
    const eff = getEffectiveTile(tile, okeyTile);
    const groupNumber = getEffectiveTile(normalTiles[0], okeyTile).number;
    if (eff.number !== groupNumber) return false;
    
    // Grupta zaten var olan bir rengi ekleyemeyiz
    const existingColors = normalTiles.map(t => getEffectiveTile(t, okeyTile).color);
    if (existingColors.includes(eff.color)) return false;

    // YENİ KURAL: Okeyi almak için grubun tüm 4 rengi tamamlanmalıdır
    const colorsAfterSwap = [...existingColors, eff.color];
    const allColors = [Color.RED, Color.YELLOW, Color.BLACK, Color.BLUE];
    return allColors.every(c => colorsAfterSwap.includes(c));
  }

  // Run: okeyin tam olarak temsil ettiği sayı+renk ile eşleşmeli.
  const normalIdx = set.tiles.findIndex(t => !isWildcard(t, okeyTile));
  if (normalIdx === -1) return false;

  const anchorNumber = getEffectiveTile(set.tiles[normalIdx], okeyTile).number;
  const runColor = getEffectiveTile(set.tiles[normalIdx], okeyTile).color;

  // Koyulan taşın rengi run'ın rengiyle aynı mı?
  if (tile.color !== runColor) return false;

  // Setteki okeylerin temsil ettiği beklenen sayıları bul
  const okeyExpectedNumbers = set.tiles
    .map((t, idx) => ({ isWild: isWildcard(t, okeyTile), expectedNum: anchorNumber + (idx - normalIdx) }))
    .filter(x => x.isWild)
    .map(x => x.expectedNum);

  return okeyExpectedNumbers.includes(tile.number);
};

export const canSwapOkeyInPair = (tile: Tile, pair: Tile[], okeyTile: { number: number; color: Color } | null): boolean => {
  const okeyIdx = pair.findIndex(t => isWildcard(t, okeyTile));
  if (okeyIdx === -1) return false;
  const normalTile = pair.find(t => !isWildcard(t, okeyTile));
  if (!normalTile) return false;
  
  const effTile = getEffectiveTile(tile, okeyTile);
  const effNormal = getEffectiveTile(normalTile, okeyTile);
  
  return effTile.number === effNormal.number && effTile.color === effNormal.color;
};


export const canProcessPair = (pair: Tile[], okeyTile: { number: number; color: Color } | null): boolean => {
  if (pair.length !== 2) return false;
  const eff1 = getEffectiveTile(pair[0], okeyTile);
  const eff2 = getEffectiveTile(pair[1], okeyTile);
  return eff1.number === eff2.number && eff1.color === eff2.color;
};

export const isPlayableAnywhere = (tile: Tile, players: Player[], okeyTile: { number: number; color: Color } | null): boolean => {
  for (const player of players) {
    for (const set of player.openedSets) {
      if (canProcessTile(tile, set, okeyTile)) return true;
      if (canSwapOkey(tile, set, okeyTile)) return true;
    }
    for (const pair of player.openedPairs) {
      if (canSwapOkeyInPair(tile, pair, okeyTile)) return true;
    }
  }
  return false;
};

export const checkWin = (player: Player): boolean => player.hand.every(t => t === null);

export const aiTakeTurn = (gameState: GameState): Partial<GameState> | null => {
  const player = gameState.players[gameState.currentPlayerIndex];
  if (!player.isAI) return null;

  const logs = [...gameState.logs];
  const deck = [...gameState.deck];
  const discardPile = [...gameState.discardPile];
  const players = [...gameState.players];
  const currentPlayer = { ...players[gameState.currentPlayerIndex] };

  const topDiscard = discardPile[discardPile.length - 1];
  let drewFromDiscard = false;

  if (topDiscard && !currentPlayer.hasOpened) {
     const currentTiles = currentPlayer.hand.filter((t): t is Tile => t !== null);
     const tempHand = [...currentTiles, topDiscard];
     const sets = findBestSets(tempHand, gameState.okeyTile);
     const totalScore = sets.reduce((s, set) => s + set.score, 0);
     const minScore = gameState.mode === GameMode.FOLDING ? gameState.currentOpenScore + 1 : 101;
     
     if (totalScore >= minScore) {
        drewFromDiscard = true;
        discardPile.pop();
        const emptyIdx = currentPlayer.hand.indexOf(null);
        if (emptyIdx !== -1) currentPlayer.hand[emptyIdx] = topDiscard;
        else currentPlayer.hand.push(topDiscard);
        logs.push(`${currentPlayer.name} yerden ${topDiscard.number} ${topDiscard.color} aldı.`);
     }
  }

  if (!drewFromDiscard) {
    const drawn = deck.pop();
    if (drawn) {
      const emptyIdx = currentPlayer.hand.indexOf(null);
      if (emptyIdx !== -1) currentPlayer.hand[emptyIdx] = drawn;
      else currentPlayer.hand.push(drawn);
      logs.push(`${currentPlayer.name} desteden taş çekti.`);
    } else {
      const hasAnyOpened = players.some(p => p.hasOpened);
      return {
        phase: GamePhase.FINISHED,
        noOneOpened: !hasAnyOpened,
        logs: [...logs, hasAnyOpened ? `Deste bitti. Oyun sona erdi.` : `Deste bitti. Kimse açmadı — herkes 202 ceza alır!`]
      };
    }
  }

  const currentTiles = currentPlayer.hand.filter((t): t is Tile => t !== null);
  const sets = findBestSets(currentTiles, gameState.okeyTile);
  const totalScore = sets.reduce((s, set) => s + set.score, 0);
  const pairs = findPairs(currentTiles, gameState.okeyTile);

  const minScore = currentPlayer.hasOpened ? 0 : (gameState.mode === GameMode.FOLDING ? gameState.currentOpenScore + 1 : 101);
  const minPairs = currentPlayer.hasOpened 
    ? (gameState.currentOpenPairs > 0 ? 1 : 5)
    : (gameState.mode === GameMode.FOLDING ? gameState.currentOpenPairs + 1 : 5);

  if (totalScore >= minScore && sets.length > 0 && currentPlayer.openedWithType !== 'pairs') {
    if (!currentPlayer.hasOpened) {
      currentPlayer.hasOpened = true;
      currentPlayer.openedWithType = 'sets';
      
      // Split long sets (6+)
      const finalSets: Combination[] = [];
      sets.forEach(s => {
        if (s.tiles.length >= 6) {
          let n = s.tiles.length;
          let offset = 0;
          while (n > 0) {
            let size = (n % 3 === 0) ? 3 : 4;
            const chunk = s.tiles.slice(offset, offset + size);
            finalSets.push({ tiles: chunk, type: s.type, score: calculateSetScore({ tiles: chunk, type: s.type, score: 0 }, gameState.okeyTile) });
            offset += size;
            n -= size;
          }
        } else {
          finalSets.push(s);
        }
      });

      currentPlayer.openedSets = finalSets;
      currentPlayer.lastOpenScore = totalScore;
      currentPlayer.openedThisTurn = true;
    } else {
      const finalSets: Combination[] = [];
      sets.forEach(s => {
        if (s.tiles.length >= 6) {
          let n = s.tiles.length;
          let offset = 0;
          while (n > 0) {
            let size = (n % 3 === 0) ? 3 : 4;
            const chunk = s.tiles.slice(offset, offset + size);
            finalSets.push({ tiles: chunk, type: s.type, score: calculateSetScore({ tiles: chunk, type: s.type, score: 0 }, gameState.okeyTile) });
            offset += size;
            n -= size;
          }
        } else {
          finalSets.push(s);
        }
      });
      currentPlayer.openedSets = [...currentPlayer.openedSets, ...finalSets];
    }

    sets.forEach(set => {
      set.tiles.forEach(t => {
        if (!t) return;
        const idx = currentPlayer.hand.findIndex(ht => ht?.id === t.id);
        if (idx !== -1) currentPlayer.hand[idx] = null;
      });
    });
    const remainingScore = calculateHandTotal(currentPlayer.hand, gameState.okeyTile);
    logs.push(`${currentPlayer.name} elini açtı. Kalan puan: ${remainingScore}`);
  } else if (pairs.length >= minPairs) {
    if (!currentPlayer.hasOpened) {
      currentPlayer.hasOpened = true;
      currentPlayer.openedWithType = 'pairs';
      currentPlayer.openedPairs = pairs;
      currentPlayer.lastOpenScore = pairs.length;
    } else {
      currentPlayer.openedPairs = [...currentPlayer.openedPairs, ...pairs];
    }
    pairs.forEach(pair => {
      pair.forEach(t => {
        if (!t) return;
        const idx = currentPlayer.hand.findIndex(ht => ht?.id === t.id);
        if (idx !== -1) currentPlayer.hand[idx] = null;
      });
    });
    logs.push(`${currentPlayer.name} ${pairs.length} çift ile el açtı.`);
  }

  if (currentPlayer.hasOpened) {
    players.forEach((targetPlayer) => {
      if (currentPlayer.openedWithType !== 'pairs') {
        targetPlayer.openedSets.forEach((set) => {
          let progress = true;
          while (progress) {
            progress = false;
            for (let hIdx = 0; hIdx < currentPlayer.hand.length; hIdx++) {
              const tile = currentPlayer.hand[hIdx];
              if (!tile) continue;

              // 1. İşleme (Add to end)
              if (canProcessTile(tile, set, gameState.okeyTile)) {
                set.tiles.push(tile);
                // Sıralama
                if (set.type === "run") {
                  // Improved re-sorting for AI runs
                  const startNum = getRunStartNum(set.tiles, gameState.okeyTile);
                  const normals = set.tiles.filter(t => t && !isWildcard(t, gameState.okeyTile));
                  const wildcards = set.tiles.filter(t => t && isWildcard(t, gameState.okeyTile));
                  
                  const sorted: Tile[] = [];
                  let wIdx = 0;
                  for (let i = 0; i < set.tiles.length; i++) {
                    const expectedNum = startNum + i;
                    const normalTile = normals.find(t => t && getEffectiveTile(t, gameState.okeyTile).number === expectedNum);
                    if (normalTile) {
                      sorted.push(normalTile);
                    } else if (wIdx < wildcards.length) {
                      sorted.push(wildcards[wIdx++]);
                    } else {
                      // Fallback: if we somehow have a gap but no wildcards left, 
                      // try to just push whatever is left or skip to avoid undefined
                      const remainingTile = set.tiles.find(rt => rt && !sorted.includes(rt));
                      if (remainingTile) sorted.push(remainingTile);
                    }
                  }
                  // Final safety check: remove any undefined that might have sneaked in
                  set.tiles = sorted.filter((t): t is Tile => !!t);
                } else {
                  const colorOrder = [Color.RED, Color.YELLOW, Color.BLACK, Color.BLUE, Color.JOKER];
                  set.tiles.sort((a, b) => {
                    if (isWildcard(a, gameState.okeyTile)) return 1;
                    if (isWildcard(b, gameState.okeyTile)) return -1;
                    return colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
                  });
                }
                currentPlayer.hand[hIdx] = null;
                logs.push(`${currentPlayer.name}, ${targetPlayer.name}'in perine taş işledi.`);
                progress = true;
                break;
              }

              // 2. Okey Değiştirme (Swap Okey)
              if (canSwapOkey(tile, set, gameState.okeyTile)) {
                // Hangi okey ile yer değiştireceğini bul
                let okeyIdx = -1;
                if (set.type === "run") {
                  const nIdx = set.tiles.findIndex(t => !isWildcard(t, gameState.okeyTile));
                  const anchorNum = getEffectiveTile(set.tiles[nIdx], gameState.okeyTile).number;
                  okeyIdx = set.tiles.findIndex((t, idx) => isWildcard(t, gameState.okeyTile) && (anchorNum + (idx - nIdx)) === tile.number);
                } else {
                  okeyIdx = set.tiles.findIndex(t => isWildcard(t, gameState.okeyTile));
                }

                if (okeyIdx !== -1) {
                  const swappedOkey = set.tiles[okeyIdx];
                  set.tiles[okeyIdx] = tile;
                  currentPlayer.hand[hIdx] = swappedOkey; // Okeyi eline al
                  logs.push(`${currentPlayer.name}, ${targetPlayer.name}'in perinden okeyi aldı.`);
                  progress = true;
                  break;
                }
              }
            }
          }
        });
      }

      targetPlayer.openedPairs.forEach((pair) => {
        let progress = true;
        while (progress) {
          progress = false;
          for (let hIdx = 0; hIdx < currentPlayer.hand.length; hIdx++) {
            const tile = currentPlayer.hand[hIdx];
            if (tile && canSwapOkeyInPair(tile, pair, gameState.okeyTile)) {
              const okeyIdx = pair.findIndex(t => isWildcard(t, gameState.okeyTile));
              const okeyTileInPair = pair[okeyIdx];
              pair[okeyIdx] = tile;
              currentPlayer.hand[hIdx] = okeyTileInPair;
              logs.push(`${currentPlayer.name}, ${targetPlayer.name}'in çiftinden okeyi aldı.`);
              progress = true;
              break;
            }
          }
        }
      });
    });
  }

  // AI tüm taşlarını setlere işlediyse → discard olmadan kazandı
  if (currentPlayer.hasOpened && currentPlayer.hand.every(t => t === null)) {
    const isHandFinish = currentPlayer.openedThisTurn === true;
    const winMsg = isHandFinish
      ? `${currentPlayer.name} ELDEN bitirdi! (-202, ×2 ceza)`
      : `${currentPlayer.name} oyunu bitirdi! (-101)`;
    players[gameState.currentPlayerIndex] = currentPlayer;
    return {
      players,
      deck,
      discardPile,
      logs: [...logs, winMsg],
      phase: GamePhase.FINISHED,
      winnerId: currentPlayer.id,
      hasHandFinish: isHandFinish,
    };
  }

  // Elde bir taşın seri/grup potansiyeli var mı?
  const hasComboPotential = (tile: Tile, hand: (Tile | null)[]): boolean => {
    if (isWildcard(tile, gameState.okeyTile)) return true;
    const others = hand.filter((t): t is Tile => t !== null && t.id !== tile.id && !isWildcard(t, gameState.okeyTile));
    // Grup potansiyeli: aynı sayı farklı renk (1 taş bile yeterli)
    if (others.some(t => t.number === tile.number && t.color !== tile.color)) return true;
    // Seri potansiyeli: aynı renk, ±2 mesafede en az 1 taş
    if (others.some(t => t.color === tile.color && Math.abs(t.number - tile.number) <= 2)) return true;
    return false;
  };

  let discardIdx = -1;
  const handTiles = currentPlayer.hand.filter((t): t is Tile => t !== null);
  const safeTiles = handTiles.filter(t => !isWildcard(t, gameState.okeyTile) && !isPlayableAnywhere(t, players, gameState.okeyTile));

  if (safeTiles.length > 0) {
    // Potansiyelsiz (yalnız) taşlar → en küçüğünü at
    const isolated = safeTiles.filter(t => !hasComboPotential(t, currentPlayer.hand));
    const pool = isolated.length > 0 ? isolated : safeTiles;
    const tileToDiscard = pool.reduce((min, t) => t.number < min.number ? t : min);
    discardIdx = currentPlayer.hand.findIndex(t => t?.id === tileToDiscard.id);
  } else {
    // Tüm taşlar potansiyelli veya wildcard — en küçük normal taşı at
    discardIdx = currentPlayer.hand.findIndex(t => t !== null && !isWildcard(t, gameState.okeyTile));
    if (discardIdx === -1) discardIdx = currentPlayer.hand.findIndex(t => t !== null);
  }

  // Atılacak taş bulunamadıysa (olağandışı durum) el boş sayılır
  if (discardIdx === -1) {
    players[gameState.currentPlayerIndex] = currentPlayer;
    return {
      players,
      deck,
      discardPile,
      logs: [...logs, `${currentPlayer.name} elinde atılacak taş kalmadı.`],
      phase: GamePhase.FINISHED,
      winnerId: currentPlayer.id,
    };
  }

  const discarded = currentPlayer.hand[discardIdx]!;
  currentPlayer.hand[discardIdx] = null;
  currentPlayer.lastDiscardedTile = discarded;
  discardPile.push(discarded);
  logs.push(`${currentPlayer.name} ${discarded.number} ${discarded.color} attı.`);

  const penalty = calculateDiscardPenalty(discarded, { ...gameState, players }, currentPlayer);
  if (penalty.penalty > 0) {
    currentPlayer.score += penalty.penalty;
    if (penalty.reason) logs.push(penalty.reason);
  }

  players[gameState.currentPlayerIndex] = currentPlayer;

  if (currentPlayer.hand.every(t => t === null)) {
    const isOkeyFinish = isWildcard(discarded, gameState.okeyTile);
    // Elden bitirme: AI bu turda ilk kez açıp aynı turda bitirdiyse
    const isHandFinish = currentPlayer.openedThisTurn === true;
    let winMsg = `${currentPlayer.name} oyunu bitirdi! (-101)`;
    if (isHandFinish && isOkeyFinish) winMsg = `${currentPlayer.name} ELDEN + OKEY ile bitirdi! (-404, ×4 ceza)`;
    else if (isHandFinish) winMsg = `${currentPlayer.name} ELDEN bitirdi! (-202, ×2 ceza)`;
    else if (isOkeyFinish) winMsg = `${currentPlayer.name} OKEY ile bitirdi! (-202, ×2 ceza)`;

    return {
      players,
      discardPile,
      logs: [...logs, winMsg],
      phase: GamePhase.FINISHED,
      winnerId: currentPlayer.id,
      hasHandFinish: isHandFinish,
    };
  }

  const isDeckEmpty = deck.length === 0;
  const hasAnyOpened = players.some(p => p.hasOpened);

  return {
    players,
    deck,
    discardPile,
    logs: isDeckEmpty 
      ? [...logs, hasAnyOpened ? "Deste bitti. Oyun sona erdi." : "Deste bitti. Kimse açmadı — herkes 202 ceza alır!"] 
      : logs,
    currentPlayerIndex: (gameState.currentPlayerIndex + 1) % 4,
    phase: isDeckEmpty ? GamePhase.FINISHED : GamePhase.DRAWING,
    noOneOpened: isDeckEmpty ? !hasAnyOpened : gameState.noOneOpened,
    currentOpenScore: Math.max(gameState.currentOpenScore, currentPlayer.hasOpened && currentPlayer.openedWithType === 'sets' ? currentPlayer.lastOpenScore : 0),
    currentOpenPairs: Math.max(gameState.currentOpenPairs, currentPlayer.hasOpened && currentPlayer.openedWithType === 'pairs' ? currentPlayer.lastOpenScore : 0),
    hasDoubleOpen: gameState.hasDoubleOpen || players.some(p => p.openedWithType === 'pairs' && p.hasOpened),
    hasOkeyDiscard: gameState.hasOkeyDiscard || isRealOkey(discarded, gameState.okeyTile),
  };
};

export interface FinalScores { [playerId: string]: number; }
export type FinishType = "normal" | "okey" | "elden" | "okeyElden";

/**
 * Bitiş türünü belirler:
 * - "normal"    : Klasik perlerle bitiş → kazanan -101, ceza ×1
 * - "okey"      : Son taşı Okey atarak bitiş → kazanan -202, ceza ×2
 * - "elden"     : Hiç yer açmadan tek seferde bitiş → kazanan -202, ceza ×2
 * - "okeyElden" : Hem elden hem okey atarak bitiş → kazanan -404, ceza ×4
 */
export const getFinishType = (
  gameState: GameState,
  finisherId: string | null,
  discardedTile: Tile | null
): FinishType => {
  if (!finisherId) return "normal";
  // hasHandFinish: oyuncu aynı turda hem el açıp hem bitirdiyse (elden bitirme)
  const isHandFinish = gameState.hasHandFinish;
  const isOkeyDiscard = discardedTile ? isWildcard(discardedTile, gameState.okeyTile) : false;
  if (isHandFinish && isOkeyDiscard) return "okeyElden";
  if (isHandFinish) return "elden";
  if (isOkeyDiscard) return "okey";
  return "normal";
};

export const calculateFinalScores = (gameState: GameState, finisherId: string | null, discardedTile: Tile | null): FinalScores => {
  const scores: FinalScores = {};
  const okeyTile = gameState.okeyTile;

  // Kimse açmadan el bitti → herkes 202 ceza alır, kazanan yok
  if (!finisherId && gameState.noOneOpened) {
    gameState.players.forEach(player => {
      scores[player.id] = 202 + (player.score > 0 ? player.score : 0);
    });
    return scores;
  }

  const finishType = getFinishType(gameState, finisherId, discardedTile);

  // Kazananın aldığı puan
  const winnerScore = (() => {
    switch (finishType) {
      case "okeyElden": return -404;
      case "okey":
      case "elden":     return -202;
      default:          return -101;
    }
  })();

  // Diğer oyuncular için ceza çarpanı (bitiş türüne göre)
  const penaltyMultiplier = (() => {
    switch (finishType) {
      case "okeyElden": return 4;
      case "okey":
      case "elden":     return 2;
      default:          return 1;
    }
  })();

  gameState.players.forEach(player => {
    if (player.id === finisherId) {
      scores[player.id] = winnerScore;
    } else {
      if (!player.hasOpened) {
        scores[player.id] = 202 * penaltyMultiplier;
      } else {
        let handTotal = calculateHandTotal(player.hand, okeyTile);
        const hasOkeyInHand = player.hand.some(t => t && isWildcard(t, okeyTile));
        if (hasOkeyInHand) handTotal += 101;
        scores[player.id] = handTotal * penaltyMultiplier;
      }
      if (player.score > 0) scores[player.id] += player.score;
    }
  });
  return scores;
};

export const getScoreExplanation = (score: number, isWinner: boolean, hasOpened: boolean, finishType?: string): string => {
  if (isWinner) {
    switch (finishType) {
      case "okeyElden": return "Elden + Okey ile bitirdi! (×4 ceza)";
      case "okey":      return "Okey atarak bitirdi! (×2 ceza)";
      case "elden":     return "Elden bitirdi! (×2 ceza)";
      default:          return "Normal bitiş!";
    }
  }
  return hasOpened ? "Elindeki taşlar (ceza)" : "Açamadı (ceza)";
};
