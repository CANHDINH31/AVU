import confetti from "canvas-confetti";

export function burstEmojiAt(x: number, y: number, icon: string) {
  confetti({
    particleCount: 15,
    spread: 40,
    origin: {
      x: x / window.innerWidth,
      y: y / window.innerHeight,
    },
    scalar: 1.2,
    ticks: 120,
    gravity: 1.0,
    startVelocity: 25,
    decay: 0.92,
    shapes: [confetti.shapeFromText({ text: icon })],
  });
}
