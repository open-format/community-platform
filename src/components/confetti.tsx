import ReactConfetti from "react-confetti";

interface ConfettiProps {
  isVisible: boolean;
}

export function Confetti({ isVisible }: ConfettiProps) {
  if (!isVisible) return null;

  return (
    <ReactConfetti
      width={window.innerWidth}
      height={window.innerHeight}
      style={{ position: "fixed", top: 0, left: 0, zIndex: 100 }}
      confettiSource={{
        x: 0,
        y: window.innerHeight,
        w: window.innerWidth,
        h: 0,
      }}
      numberOfPieces={500}
      recycle={false}
      initialVelocityY={{ min: -30, max: -10 }}
      gravity={0.3}
    />
  );
}
