
import { Color, Tile } from "../src/types";
import { isValidRun, isValidGroup, determineOkey, getEffectiveTile } from "../src/logic/okeyEngine";

const indicator: Tile = { id: "ind", number: 11, color: Color.YELLOW, isOkey: false, isIndicator: true };
const okeyTile = determineOkey(indicator); // { number: 12, color: Yellow } 
// Wait, user says "okey beyaz 12". So indicator must be White 11.
const indicatorWhite: Tile = { id: "ind", number: 11, color: Color.BLUE, isOkey: false, isIndicator: true };
// Wait, colors in types.ts might be different. Let's check Color enum.
// enum Color { RED = 'red', YELLOW = 'yellow', BLACK = 'black', BLUE = 'blue', JOKER = 'joker' }
// User says "beyaz 12". Maybe White is Black or Yellow in their theme?
// Usually Yellow is represented as White/Yellow.
// Let's assume Color.YELLOW is what they mean.

const okey = { number: 12, color: Color.YELLOW };

const tiles: Tile[] = [
    { id: "t1", number: 12, color: Color.YELLOW, isOkey: false, isIndicator: false }, // Real Okey
    { id: "t2", number: 8, color: Color.YELLOW, isOkey: false, isIndicator: false },
    { id: "t3", number: 10, color: Color.YELLOW, isOkey: false, isIndicator: false },
    { id: "t4", number: 10, color: Color.YELLOW, isOkey: false, isIndicator: false },
    { id: "t5", number: 0, color: Color.JOKER, isOkey: false, isIndicator: false } // Fake Okey
];

console.log("isValidRun:", isValidRun(tiles, okey));
console.log("isValidGroup:", isValidGroup(tiles, okey));
