import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import "./_group.css";

// MOCK DATA
const HAND = [
  { id: 1, color: "red", number: 4 },
  { id: 2, color: "red", number: 5 },
  { id: 3, color: "red", number: 6 },
  { id: 4, color: "black", number: 10 },
  { id: 5, color: "black", number: 10 },
  { id: 6, color: "blue", number: 11 },
  { id: 7, color: "blue", number: 12 },
  { id: 8, color: "blue", number: 13 },
  { id: 9, color: "yellow", number: 1 },
  { id: 10, color: "yellow", number: 2 },
  { id: 11, color: "yellow", number: 3 },
  { id: 12, color: "red", number: 13 },
  { id: 13, color: "black", number: 13 },
  { id: 14, color: "yellow", number: 13 },
  { id: 15, color: "blue", number: 13 },
  { id: 16, color: "red", number: 8 },
  { id: 17, color: "black", number: 8 },
  { id: 18, color: "blue", number: 7 },
  { id: 19, color: "red", number: 9 },
  { id: 20, color: "red", number: 10 },
  { id: 21, color: "joker", number: 0 },
];

const OPEN_SETS = [
  [
    { id: 101, color: "black", number: 1 },
    { id: 102, color: "black", number: 2 },
    { id: 103, color: "black", number: 3 },
  ],
  [
    { id: 104, color: "red", number: 7 },
    { id: 105, color: "yellow", number: 7 },
    { id: 106, color: "blue", number: 7 },
  ],
];

const LOGS = [
  "[12:04:01] SYS: MATCH STARTED.",
  "[12:04:03] P2 DRAWN FROM DECK.",
  "[12:04:04] P2 DISCARDED B-4.",
  "[12:04:06] P3 DRAWN FROM DISCARD (B-4).",
  "[12:04:08] P3 OPENED SERIES (34 PTS).",
  "[12:04:09] P3 DISCARDED R-12.",
  "[12:04:11] P4 DRAWN FROM DECK.",
  "[12:04:12] P4 DISCARDED Y-1.",
  "[12:04:13] P1 (YOU) TURN BEGIN.",
];

export function MinimalTactical() {
  return (
    <div className="minimal-tactical-theme min-h-screen bg-background text-foreground flex flex-col p-4 gap-4 select-none">
      
      {/* HEADER */}
      <header className="flex justify-between items-end border-b-2 border-border pb-2 uppercase text-sm tracking-widest">
        <div>
          <h1 className="text-xl font-bold">TACTICAL 101</h1>
          <div className="text-muted-foreground">ID: #4815162342</div>
        </div>
        <div className="text-right">
          <div>ROUND: 4/10</div>
          <div>PENALTY: 0</div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-[1fr_300px] gap-4 min-h-[500px]">
        {/* MAIN PLAY AREA */}
        <div className="flex flex-col gap-4 border-2 border-border p-4">
          
          {/* OPPONENTS & TABLE */}
          <div className="flex-1 flex flex-col gap-4">
            
            <div className="flex justify-between border-b border-dashed border-border pb-2 text-xs">
              <div className="w-1/3">
                <div className="font-bold">P2: AI_WEST</div>
                <div>HAND: 21</div>
                <div>SCORE: -101</div>
              </div>
              <div className="w-1/3 text-center">
                <div className="font-bold">P3: AI_NORTH</div>
                <div>HAND: 14</div>
                <div>SCORE: 34</div>
              </div>
              <div className="w-1/3 text-right">
                <div className="font-bold">P4: AI_EAST</div>
                <div>HAND: 21</div>
                <div>SCORE: -101</div>
              </div>
            </div>

            {/* TABLE CENTER */}
            <div className="flex-1 flex items-center justify-center gap-12">
              <div className="flex flex-col items-center gap-2">
                <div className="text-xs font-bold">DRAW PILE</div>
                <div className="w-12 h-16 border-2 border-black bg-black flex items-center justify-center">
                  <span className="text-white text-xs">64</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="text-xs font-bold text-center">OPENED SETS</div>
                <div className="flex flex-wrap justify-center gap-4">
                  {OPEN_SETS.map((set, i) => (
                    <div key={i} className="flex border border-black p-1">
                      {set.map((tile) => (
                        <div key={tile.id} className={`tile color-${tile.color} w-8 h-12 text-sm`}>
                          {tile.number}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="text-xs font-bold">DISCARD PILE</div>
                <div className="tile color-yellow w-12 h-16 text-lg">1</div>
              </div>
            </div>

          </div>

          {/* PLAYER HAND AREA */}
          <div className="border-t-2 border-border pt-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-bold">P1: YOU (ACTIVE)</div>
              <div className="text-sm">HAND VALUE: 124</div>
            </div>
            
            <div className="flex flex-wrap gap-1 p-2 bg-muted/30 border border-border min-h-[80px]">
              {HAND.map((tile, i) => (
                <div 
                  key={i} 
                  className={`tile color-${tile.color === 'joker' ? 'black' : tile.color} w-10 h-14 text-lg hover:-translate-y-1 transition-transform cursor-pointer shadow-none`}
                >
                  {tile.color === 'joker' ? 'J' : tile.number}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 border-2 border-black">DRAW</Button>
              <Button variant="outline" className="flex-1 border-2 border-black">DISCARD</Button>
              <Button variant="default" className="flex-1">OPEN SETS</Button>
              <Button variant="default" className="flex-1">OPEN PAIRS</Button>
              <Button variant="outline" className="flex-1 border-black border-dashed">UNDO</Button>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="flex flex-col gap-4">
          <div className="border-2 border-border p-2 flex flex-col h-1/2">
            <div className="text-xs font-bold mb-2 border-b border-border pb-1">SYS.LOG</div>
            <ScrollArea className="flex-1">
              <div className="text-[10px] leading-tight space-y-1 font-mono text-muted-foreground">
                {LOGS.map((log, i) => (
                  <div key={i} className={i === LOGS.length - 1 ? 'text-black font-bold' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-2 text-xs border-t border-border pt-1 flex items-center gap-2">
              <span>&gt;</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>

          <div className="border-2 border-border p-2 flex flex-col h-1/2">
            <div className="text-xs font-bold mb-2 border-b border-border pb-1">SCORE.TRK</div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-dashed border-border">
                  <th className="py-1">P</th>
                  <th className="py-1">R1</th>
                  <th className="py-1">R2</th>
                  <th className="py-1">R3</th>
                  <th className="py-1">TOT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1 font-bold">P1</td>
                  <td>-101</td>
                  <td>34</td>
                  <td>-101</td>
                  <td className="font-bold">-168</td>
                </tr>
                <tr>
                  <td className="py-1">P2</td>
                  <td>-101</td>
                  <td>-101</td>
                  <td>-101</td>
                  <td>-303</td>
                </tr>
                <tr>
                  <td className="py-1">P3</td>
                  <td>56</td>
                  <td>-101</td>
                  <td>-101</td>
                  <td>-146</td>
                </tr>
                <tr>
                  <td className="py-1">P4</td>
                  <td>-101</td>
                  <td>-101</td>
                  <td>42</td>
                  <td>-160</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
