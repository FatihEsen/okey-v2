import React from "react";
import "./_group.css";
import { Button } from "@/components/ui/button";

const COLORS = {
  red: "#e63946",
  yellow: "#e9c46a",
  black: "#264653",
  blue: "#457b9d"
};

const Tile = ({ number, color, faceDown = false, isJoker = false }: { number?: number, color?: keyof typeof COLORS, faceDown?: boolean, isJoker?: boolean }) => {
  if (faceDown) {
    return (
      <div className="tile-physical w-10 h-14 bg-gradient-to-br from-green-800 to-green-900 border-2 border-green-950 flex items-center justify-center">
        <div className="w-8 h-12 border border-green-950/50 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="tile-physical w-10 h-14 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 transition-transform duration-200">
      <span 
        className="text-2xl font-bold tile-engraved" 
        style={{ color: isJoker ? COLORS.red : color ? COLORS[color] : 'black' }}
      >
        {isJoker ? "★" : number}
      </span>
    </div>
  );
};

export function PhysicalTable() {
  const handTiles = [
    { number: 1, color: "red" }, { number: 2, color: "red" }, { number: 3, color: "red" },
    { number: 5, color: "black" }, { number: 5, color: "yellow" }, { number: 5, color: "blue" },
    { number: 10, color: "yellow" }, { number: 11, color: "yellow" }, { number: 12, color: "yellow" }, { number: 13, color: "yellow" },
    { number: 7, color: "blue" }, { number: 8, color: "blue" }, { number: 9, color: "blue" },
    { number: 13, color: "black" }, { number: 13, color: "red" }, { isJoker: true },
    { number: 2, color: "black" }, { number: 3, color: "black" }, { number: 4, color: "black" },
    { number: 9, color: "red" }, { number: 9, color: "black" }
  ] as const;

  return (
    <div className="okey-physical-table w-full h-screen felt-texture overflow-hidden flex flex-col font-['Inter'] relative p-4">
      
      {/* Top Opponent */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 transform rotate-180 scale-75">
        <div className="rack-wood h-16 w-[600px] flex items-end px-4 pb-2 gap-1 justify-center">
          {Array(14).fill(0).map((_, i) => <Tile key={i} faceDown />)}
        </div>
      </div>

      {/* Left Opponent */}
      <div className="absolute left-[-200px] top-1/2 -translate-y-1/2 flex gap-1 transform rotate-90 scale-75">
        <div className="rack-wood h-16 w-[600px] flex items-end px-4 pb-2 gap-1 justify-center">
          {Array(14).fill(0).map((_, i) => <Tile key={i} faceDown />)}
        </div>
      </div>

      {/* Right Opponent */}
      <div className="absolute right-[-200px] top-1/2 -translate-y-1/2 flex gap-1 transform -rotate-90 scale-75">
        <div className="rack-wood h-16 w-[600px] flex items-end px-4 pb-2 gap-1 justify-center">
          {Array(14).fill(0).map((_, i) => <Tile key={i} faceDown />)}
        </div>
      </div>

      {/* Center Table Area */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Draw & Discard Piles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-8 p-6 bg-black/10 rounded-full blur-[2px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-8 z-10">
           <div className="relative">
             <div className="absolute top-1 left-1"><Tile faceDown /></div>
             <div className="absolute top-2 left-2"><Tile faceDown /></div>
             <div className="relative"><Tile faceDown /></div>
           </div>
           <div>
             <Tile number={7} color="black" />
           </div>
        </div>
        
        {/* Opened Sets */}
        <div className="absolute bottom-1/4 left-1/4 flex gap-2 rotate-[-5deg]">
          <Tile number={4} color="blue" />
          <Tile number={5} color="blue" />
          <Tile number={6} color="blue" />
        </div>
        <div className="absolute top-1/3 right-1/4 flex gap-2 rotate-[10deg]">
          <Tile number={11} color="red" />
          <Tile number={11} color="black" />
          <Tile number={11} color="yellow" />
        </div>
      </div>

      {/* Player Area */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
        
        {/* Controls */}
        <div className="flex gap-4">
          <Button variant="secondary" className="wood-texture border-none text-white font-bold hover:brightness-110 h-12 px-8 shadow-xl">Draw</Button>
          <Button variant="secondary" className="wood-texture border-none text-white font-bold hover:brightness-110 h-12 px-8 shadow-xl">Discard</Button>
          <Button variant="secondary" className="wood-texture border-none text-white font-bold hover:brightness-110 h-12 px-8 shadow-xl">Open Sets</Button>
          <Button variant="secondary" className="wood-texture border-none text-white font-bold hover:brightness-110 h-12 px-8 shadow-xl">Undo</Button>
        </div>

        {/* Rack */}
        <div className="rack-wood h-20 px-6 flex items-end pb-3 gap-1 shadow-2xl relative">
          {handTiles.map((t, i) => (
             <Tile key={i} number={t.number} color={t.color} isJoker={t.isJoker} />
          ))}
          {/* Rack front lip */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/50 to-transparent rounded-b-md pointer-events-none"></div>
        </div>
      </div>

      {/* Game Info Panel */}
      <div className="absolute top-4 left-4 wood-texture p-4 rounded-xl text-white/90 shadow-2xl w-64 border border-white/10">
        <h3 className="font-bold text-xl mb-4 font-['Playfair_Display'] border-b border-white/20 pb-2">Scores</h3>
        <div className="space-y-2 mb-6">
          <div className="flex justify-between font-bold"><span>You</span><span>-34</span></div>
          <div className="flex justify-between opacity-80"><span>Ahmet</span><span>-12</span></div>
          <div className="flex justify-between opacity-80"><span>Mehmet</span><span>-45</span></div>
          <div className="flex justify-between opacity-80"><span>Ayşe</span><span>0</span></div>
        </div>
        
        <h3 className="font-bold text-lg mb-2 font-['Playfair_Display'] border-b border-white/20 pb-2">Log</h3>
        <div className="text-sm opacity-80 space-y-1 font-mono">
          <p>&gt; Ahmet drew tile</p>
          <p>&gt; Ahmet discarded Red 4</p>
          <p>&gt; You drew Red 4</p>
        </div>
      </div>
    </div>
  );
}
