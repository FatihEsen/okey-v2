import { useCallback, useRef, useState } from "react";

export type SoundKey = "draw" | "discard" | "open" | "win" | "penalty";

export function useSound() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("okey101_sound") !== "off";
    } catch {
      return true;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const toggleSound = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("okey101_sound", next ? "on" : "off");
      } catch {}
      return next;
    });
  }, []);

  const playTone = useCallback(
    (
      frequency: number,
      duration: number,
      type: OscillatorType = "sine",
      volume: number = 0.25,
      delay: number = 0
    ) => {
      if (!enabled) return;
      try {
        const ctx = getCtx();
        const t = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, t);
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.start(t);
        osc.stop(t + duration);
      } catch {}
    },
    [enabled, getCtx]
  );

  const sounds: Record<SoundKey, () => void> = {
    draw: () => {
      playTone(420, 0.07, "triangle", 0.16);
    },
    discard: () => {
      playTone(280, 0.1, "sine", 0.18);
      playTone(220, 0.09, "sine", 0.12, 0.07);
    },
    open: () => {
      playTone(523, 0.1, "sine", 0.26);
      playTone(659, 0.1, "sine", 0.26, 0.1);
      playTone(784, 0.18, "sine", 0.26, 0.2);
    },
    win: () => {
      [523, 659, 784, 1047, 784, 1047].forEach((freq, i) => {
        playTone(freq, 0.22, "sine", 0.32, i * 0.1);
      });
    },
    penalty: () => {
      playTone(180, 0.14, "sawtooth", 0.2);
      playTone(150, 0.18, "sawtooth", 0.2, 0.12);
    },
  };

  return { sounds, enabled, toggleSound };
}
