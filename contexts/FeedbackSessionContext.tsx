"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

interface FeedbackSessionContextType {
  sessionId: string;
  resetSession: () => void;
}

const FeedbackSessionContext = createContext<FeedbackSessionContextType>({
  sessionId: "",
  resetSession: () => {},
});

export function FeedbackSessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // Check for existing session ID in localStorage
    const existingSessionId = localStorage.getItem("feedbackSessionId");
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      // Create new session ID
      const newSessionId = uuidv4();
      localStorage.setItem("feedbackSessionId", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  const resetSession = () => {
    const newSessionId = uuidv4();
    localStorage.setItem("feedbackSessionId", newSessionId);
    setSessionId(newSessionId);
  };

  return (
    <FeedbackSessionContext.Provider value={{ sessionId, resetSession }}>
      {children}
    </FeedbackSessionContext.Provider>
  );
}

export const useFeedbackSession = () => useContext(FeedbackSessionContext);
