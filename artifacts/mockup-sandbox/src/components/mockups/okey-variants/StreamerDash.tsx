import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Users, Tv, MessageSquare, Play, RefreshCcw, Hand, AlertCircle, Eye, Disc } from 'lucide-react';
import './_group.css';

interface Tile {
  id: string;
  number: number;
  color: 'red' | 'yellow' | 'black' | 'blue';
  isJoker?: boolean;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  handCount: number;
  status: 'THINKING...' | 'WAITING' | 'OPENED!' | 'PLAYING';
  isStreamer?: boolean;
}

interface GameEvent {
  id: string;
  time: string;
  player: string;
  action: string;
  detail: string;
  type: 'draw' | 'discard' | 'open' | 'system';
}

const COLORS = {
  red: 'text-red-500',
  yellow: 'text-yellow-500',
  black: 'text-zinc-300',
  blue: 'text-blue-500',
};

const BG_COLORS = {
  red: 'bg-red-500/20 border-red-500/50',
  yellow: 'bg-yellow-500/20 border-yellow-500/50',
  black: 'bg-zinc-500/20 border-zinc-500/50',
  blue: 'bg-blue-500/20 border-blue-500/50',
};

const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'xQc_OW', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xqc', score: 145, handCount: 21, status: 'PLAYING', isStreamer: true },
  { id: '2', name: 'HasanAbi', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hasan', score: 98, handCount: 21, status: 'WAITING' },
  { id: '3', name: 'Pokimane', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=poki', score: -34, handCount: 18, status: 'OPENED!' },
  { id: '4', name: 'DisguisedToast', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=toast', score: 210, handCount: 21, status: 'WAITING' },
];

const MOCK_EVENTS: GameEvent[] = [
  { id: '1', time: '14:02', player: 'Pokimane', action: 'opened series', detail: '101 points', type: 'open' },
  { id: '2', time: '14:03', player: 'DisguisedToast', action: 'drew from deck', detail: '', type: 'draw' },
  { id: '3', time: '14:03', player: 'DisguisedToast', action: 'discarded', detail: 'Red 7', type: 'discard' },
  { id: '4', time: '14:04', player: 'xQc_OW', action: 'took from discard', detail: 'Red 7', type: 'draw' },
  { id: '5', time: '14:05', player: 'xQc_OW', action: 'is thinking...', detail: '', type: 'system' },
];

const generateMockHand = (): Tile[] => {
  const colors: ('red' | 'yellow' | 'black' | 'blue')[] = ['red', 'yellow', 'black', 'blue'];
  const hand: Tile[] = [];
  for (let i = 0; i < 21; i++) {
    hand.push({
      id: `t-${i}`,
      number: Math.floor(Math.random() * 13) + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  return hand.sort((a, b) => a.color.localeCompare(b.color) || a.number - b.number);
};

export function StreamerDash() {
  const [hand] = useState<Tile[]>(generateMockHand());
  const [events, setEvents] = useState<GameEvent[]>(MOCK_EVENTS);

  return (
    <div className="streamer-theme min-h-screen bg-background text-foreground flex overflow-hidden font-sans select-none">
      
      {/* Main Stage Area */}
      <div className="flex-1 flex flex-col relative bg-grid-pattern">
        
        {/* Stream Overlay Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 bg-gradient-to-b from-background/90 to-transparent">
          <div className="flex items-center gap-3 bg-card/60 backdrop-blur-md p-2 rounded-xl border border-white/10">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
            <span className="font-bold tracking-wider text-sm">LIVE</span>
            <div className="flex items-center gap-1 text-muted-foreground ml-2 text-sm">
              <Eye className="w-4 h-4" />
              <span>24,591</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50 text-xs py-1 px-3">
              ROUND 4/10
            </Badge>
            <Badge variant="outline" className="bg-secondary/20 text-secondary border-secondary/50 text-xs py-1 px-3">
              PENALTY: 101
            </Badge>
          </div>
        </div>

        {/* Top Players Bar */}
        <div className="flex justify-center gap-4 pt-16 px-6 z-10">
          {MOCK_PLAYERS.map(player => (
            <Card key={player.id} className={`w-48 bg-card/80 backdrop-blur-sm border-white/5 overflow-hidden transition-all duration-300 ${player.status === 'PLAYING' ? 'ring-2 ring-primary neon-border transform -translate-y-2' : ''}`}>
              <div className="p-3 flex items-center gap-3">
                <Avatar className={`w-12 h-12 border-2 ${player.status === 'PLAYING' ? 'border-primary' : 'border-muted'}`}>
                  <AvatarImage src={player.avatar} />
                  <AvatarFallback>{player.name.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate flex items-center gap-1">
                    {player.name}
                    {player.isStreamer && <Tv className="w-3 h-3 text-primary" />}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs font-mono ${player.score < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {player.score > 0 ? '+' : ''}{player.score}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1 h-4 bg-muted text-muted-foreground">
                      {player.handCount}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className={`text-[10px] text-center py-1 font-bold tracking-widest ${
                player.status === 'PLAYING' ? 'bg-primary text-primary-foreground' : 
                player.status === 'OPENED!' ? 'bg-secondary text-secondary-foreground' : 
                'bg-muted/50 text-muted-foreground'
              }`}>
                {player.status}
              </div>
            </Card>
          ))}
        </div>

        {/* Center Table Area */}
        <div className="flex-1 flex items-center justify-center relative p-8">
          {/* Table Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex gap-12 items-center relative z-10">
            {/* Discard Pile */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Discard</span>
              <div className="w-16 h-24 bg-card border-2 border-primary/50 rounded-lg flex items-center justify-center tile-shadow relative group cursor-pointer hover:border-primary transition-colors">
                <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className={`text-3xl font-bold ${COLORS.red}`}>7</span>
              </div>
            </div>

            {/* Draw Pile */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Deck</span>
              <div className="w-16 h-24 bg-muted border border-white/10 rounded-lg flex items-center justify-center tile-shadow relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <Disc className="w-8 h-8 text-white/20 group-hover:text-white/40 transition-colors" />
                <Badge className="absolute -top-2 -right-2 bg-background border border-white/10 text-xs">84</Badge>
              </div>
            </div>

            {/* Opened Area (Abstracted for mockup) */}
            <div className="w-64 h-32 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center bg-card/30 backdrop-blur-sm">
              <div className="text-center text-muted-foreground">
                <Trophy className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">Table Sets</p>
                <p className="text-[10px]">Pokimane (101)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Player Action Bar & Hand */}
        <div className="bg-card/90 backdrop-blur-xl border-t border-white/10 p-6 z-20">
          
          <div className="flex justify-between items-end mb-6">
            <div className="flex gap-3">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 px-8 text-lg rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                <Hand className="mr-2 h-5 w-5" /> OPEN SERIES
              </Button>
              <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 font-bold h-14 px-8 text-lg rounded-xl">
                OPEN PAIRS
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl bg-muted/50 hover:bg-muted">
                <RefreshCcw className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl bg-muted/50 hover:bg-muted">
                <AlertCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Racks / Hand */}
          <div className="bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner flex flex-wrap gap-2 justify-center min-h-[140px]">
            {hand.map((tile, i) => (
              <div 
                key={tile.id} 
                className={`w-12 h-16 rounded-md flex flex-col items-center justify-center bg-zinc-100 tile-shadow cursor-grab active:cursor-grabbing hover:-translate-y-2 transition-transform ${i === 4 ? 'mb-4' : ''}`}
              >
                <span className={`text-2xl font-black ${COLORS[tile.color]}`}>{tile.number}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Right Sidebar - Event Feed / Chat */}
      <div className="w-80 border-l border-white/10 bg-card/50 backdrop-blur-xl flex flex-col z-20">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-sm tracking-wider">EVENT FEED</h3>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {events.map((ev, i) => (
              <div key={ev.id} className="animate-chat-enter text-sm flex gap-3" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-muted-foreground font-mono text-xs pt-1">{ev.time}</div>
                <div className="flex-1">
                  <span className={`font-bold ${ev.player === 'xQc_OW' ? 'text-primary' : 'text-zinc-300'}`}>
                    {ev.player}
                  </span>
                  <span className="text-muted-foreground ml-2">{ev.action}</span>
                  {ev.detail && (
                    <div className="mt-1">
                      <Badge variant="outline" className={`bg-black/50 border-white/10 text-xs ${ev.type === 'open' ? 'border-primary/50 text-primary' : ''}`}>
                        {ev.detail}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="bg-background border border-white/10 rounded-lg p-3 text-xs text-muted-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Waiting for your move...
          </div>
        </div>
      </div>

    </div>
  );
}
