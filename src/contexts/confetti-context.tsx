import { Confetti } from "@/components/confetti";
import { type ReactNode, createContext, useCallback, useContext, useState } from "react";

interface ConfettiContextType {
  triggerConfetti: () => void;
}

const ConfettiContext = createContext<ConfettiContextType | undefined>(undefined);

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  const triggerConfetti = useCallback(() => {
    setIsVisible(true);
    // Auto-hide after 5 seconds
    setTimeout(() => setIsVisible(false), 5000);
  }, []);

  return (
    <ConfettiContext.Provider value={{ triggerConfetti }}>
      {children}
      {/* Render the Confetti component here so it's always available */}
      <Confetti isVisible={isVisible} />
    </ConfettiContext.Provider>
  );
}

export function useConfetti() {
  const context = useContext(ConfettiContext);
  if (context === undefined) {
    throw new Error("useConfetti must be used within a ConfettiProvider");
  }
  return context;
}
