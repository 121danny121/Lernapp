let ctx: AudioContext | null = null;

/** Kurzer, leiser Zweiklang bei richtiger Antwort (nur wenn Töne eingeschaltet sind). */
export function playCorrect(): void {
  try {
    ctx ??= new AudioContext();
    const now = ctx.currentTime;
    [660, 880].forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.0001, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.15, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.25);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.3);
    });
  } catch {
    // Ton ist nur Zugabe – Fehler ignorieren.
  }
}
