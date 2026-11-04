import confetti from 'canvas-confetti';

export function fireCuteConfetti(x?: number, y?: number) {
  const origin = x !== undefined && y !== undefined 
    ? { x: x / window.innerWidth, y: y / window.innerHeight }
    : { x: 0.5, y: 0.6 };

  confetti({
    particleCount: 45,
    spread: 60,
    origin,
    colors: ['#f472b6', '#c084fc', '#38bdf8', '#34d399', '#fde047', '#fb923c'],
    ticks: 200,
    gravity: 1.1,
    scalar: 0.9,
    shapes: ['circle'],
  });
}

export function fireBigCelebration() {
  const count = 160;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
