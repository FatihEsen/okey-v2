import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, Check, RotateCcw, X, Layers, LogOut } from "lucide-react";

type TileColor = 'red' | 'yellow' | 'black' | 'blue' | 'joker';

interface Tile {
  id: string;
  number: number;
  color: TileColor;
  isOkey?: boolean;
}

const colors: Record<TileColor, string> = {
  red: 'text-red-500',
  yellow: 'text-amber-500',
  black: 'text-stone-800',
  blue: 'text-blue-500',
  joker: 'text-emerald-500'
};

const bgColors: Record<TileColor, string> = {
  red: 'bg-red-50',
  yellow: 'bg-amber-50',
  black: 'bg-stone-50',
  blue: 'bg-blue-50',
  joker: 'bg-emerald-50'
};

const TileUI = ({ tile, className = "", selected = false, onClick }: { tile: Tile, className?: string, selected?: boolean, onClick?: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center rounded-xl bg-white 
        shadow-[0_4px_0_0_rgba(0,0,0,0.1),inset_0_2px_0_0_rgba(255,255,255,1)] 
        border border-black/5 select-none transition-transform
        ${colors[tile.color]} ${selected ? '-translate-y-4 shadow-[0_8px_0_0_rgba(0,0,0,0.1)] ring-2 ring-primary' : ''}
        ${className}
      `}
    >
      <span className="text-2xl font-bold font-mono tracking-tighter">
        {tile.isOkey ? 'O' : tile.number}
      </span>
      {!tile.isOkey && (
        <span className="text-[10px] font-bold opacity-50 mt-0.5">
          {tile.color.toUpperCase()[0]}
        </span>
      )}
    </div>
  );
};

export function MobileDrawer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const mockHand: Tile[] = [
    { id: '1', number: 1, color: 'red' },
    { id: '2', number: 2, color: 'red' },
    { id: '3', number: 3, color: 'red' },
    { id: '4', number: 7, color: 'yellow' },
    { id: '5', number: 8, color: 'yellow' },
    { id: '6', number: 9, color: 'yellow' },
    { id: '7', number: 11, color: 'black' },
    { id: '8', number: 11, color: 'red' },
    { id: '9', number: 11, color: 'blue' },
    { id: '10', number: 13, color: 'blue' },
    { id: '11', number: 4, color: 'black' },
    { id: '12', number: 5, color: 'black' },
    { id: '13', number: 6, color: 'black' },
    { id: '14', number: 1, color: 'yellow' },
    { id: '15', number: 2, color: 'blue' },
    { id: '16', number: 8, color: 'red' },
    { id: '17', number: 9, color: 'blue' },
    { id: '18', number: 12, color: 'black' },
    { id: '19', number: 13, color: 'red', isOkey: true },
    { id: '20', number: 5, color: 'yellow' },
    { id: '21', number: 6, color: 'blue' },
  ];

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-emerald-900/5 overflow-hidden max-w-sm mx-auto relative font-sans text-slate-800">
      
      {/* Top Bar - Opponents */}
      <div className="flex justify-between items-center p-4 bg-white/50 backdrop-blur-md border-b border-black/5 z-10">
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <Avatar className="w-10 h-10 border-2 border-emerald-500/20">
              <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=ai1" />
              <AvatarFallback>A1</AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-bold mt-1 text-slate-500">21 TILES</span>
          </div>
          <div className="flex flex-col items-center opacity-50">
            <Avatar className="w-8 h-8 border border-black/10">
              <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=ai2" />
              <AvatarFallback>A2</AvatarFallback>
            </Avatar>
            <span className="text-[9px] font-bold mt-1 text-slate-400">14 TILES</span>
          </div>
          <div className="flex flex-col items-center opacity-50">
            <Avatar className="w-8 h-8 border border-black/10">
              <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=ai3" />
              <AvatarFallback>A3</AvatarFallback>
            </Avatar>
            <span className="text-[9px] font-bold mt-1 text-slate-400">14 TILES</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm font-black text-emerald-800">ROUND 4</div>
          <div className="text-xs font-semibold text-emerald-600/70">Okey: <span className="text-red-500">Red 4</span></div>
        </div>
      </div>

      {/* Table Area (60%) */}
      <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-100/50 to-emerald-200/50 flex flex-col p-4">
        
        {/* Opened Sets on Table */}
        <div className="flex-1 overflow-hidden opacity-80 flex flex-wrap gap-2 content-start pt-2">
          <div className="flex gap-0.5 bg-white/40 p-1.5 rounded-xl shadow-sm border border-white">
            <div className="w-6 h-8 bg-white rounded shadow-sm text-center text-xs font-bold text-red-500 flex items-center justify-center">1</div>
            <div className="w-6 h-8 bg-white rounded shadow-sm text-center text-xs font-bold text-red-500 flex items-center justify-center">2</div>
            <div className="w-6 h-8 bg-white rounded shadow-sm text-center text-xs font-bold text-red-500 flex items-center justify-center">3</div>
          </div>
          <div className="flex gap-0.5 bg-white/40 p-1.5 rounded-xl shadow-sm border border-white">
            <div className="w-6 h-8 bg-white rounded shadow-sm text-center text-xs font-bold text-yellow-500 flex items-center justify-center">7</div>
            <div className="w-6 h-8 bg-white rounded shadow-sm text-center text-xs font-bold text-yellow-500 flex items-center justify-center">8</div>
            <div className="w-6 h-8 bg-white rounded shadow-sm text-center text-xs font-bold text-yellow-500 flex items-center justify-center">9</div>
          </div>
        </div>

        {/* Draw / Discard Piles */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center pb-20">
          <div className="flex gap-6 items-center pointer-events-auto">
            {/* Draw Pile */}
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 bg-emerald-500 rounded-2xl blur opacity-20"></div>
              <div className="relative w-20 h-28 bg-emerald-800 rounded-xl shadow-[0_8px_0_0_rgba(6,78,59,1)] border-2 border-emerald-700/50 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                <Layers className="text-emerald-300/50 w-8 h-8" />
                <div className="absolute bottom-2 right-2 text-xs font-black text-emerald-400">42</div>
              </div>
            </div>

            {/* Discard Pile */}
            <div className="relative w-20 h-28">
              <div className="absolute top-1 -left-1 w-20 h-28 bg-white rounded-xl shadow-sm border border-black/5 rotate-[-4deg] flex items-center justify-center text-amber-500">
                <span className="text-2xl font-bold">12</span>
              </div>
              <div className="absolute top-0 left-0 w-20 h-28 bg-white rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.1)] border border-black/5 rotate-3 flex flex-col items-center justify-center text-red-500">
                <span className="text-3xl font-black font-mono tracking-tighter">7</span>
                <span className="text-[10px] font-bold opacity-50 mt-1">R</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Drawer / Player Hand */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-slate-100 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out flex flex-col border-t border-white/50 z-20 ${drawerOpen ? 'h-[75dvh] translate-y-0' : 'h-[35dvh] translate-y-0'}`}
      >
        {/* Drawer Handle */}
        <div 
          className="w-full flex justify-center pt-4 pb-2 cursor-pointer touch-none"
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          <div className="w-16 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Hand Area */}
        <div className="flex-1 overflow-hidden px-4 pb-4">
          <div className="h-full bg-slate-200/50 rounded-2xl p-3 shadow-inner border border-black/5 overflow-y-auto">
            <div className="grid grid-cols-7 gap-1.5 auto-rows-[3.5rem]">
              {mockHand.map((tile, i) => (
                <TileUI 
                  key={i} 
                  tile={tile} 
                  className={`w-full h-full text-base ${i === 3 || i === 4 ? 'ring-2 ring-emerald-500 ring-offset-1 -translate-y-1 shadow-[0_6px_0_0_rgba(0,0,0,0.1)]' : ''}`} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-6 pt-2 flex gap-2">
          <Button variant="outline" className="h-14 rounded-2xl bg-white border-slate-200 shadow-sm flex-1 text-slate-600 font-bold">
            <RotateCcw className="w-4 h-4 mr-2" />
            Sort
          </Button>
          <Button className="h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_0_0_rgba(5,150,105,1)] flex-[2] font-black text-lg">
            <Check className="w-5 h-5 mr-2" />
            Open Sets
          </Button>
        </div>
      </div>

    </div>
  );
}
