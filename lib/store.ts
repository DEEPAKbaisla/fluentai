import { create } from "zustand";

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  speakingStatus: "idle" | "listening" | "thinking" | "speaking";
  setSpeakingStatus: (status: "idle" | "listening" | "thinking" | "speaking") => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  currentTranscript: string;
  setCurrentTranscript: (transcript: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  isRecording: false,
  setIsRecording: (recording) => set({ isRecording: recording }),
  speakingStatus: "idle",
  setSpeakingStatus: (status) => set({ speakingStatus: status }),
  isMuted: false,
  setIsMuted: (muted) => set({ isMuted: muted }),
  currentTranscript: "",
  setCurrentTranscript: (transcript) => set({ currentTranscript: transcript }),
}));
