import React, { ReactNode } from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import { SpeechProvider, useSpeech } from "@/contexts/SpeechContext";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

// Mock the useVoiceAssistant hook
jest.mock("@/hooks/useVoiceAssistant", () => ({
  useVoiceAssistant: jest.fn(),
}));

// Mock the WebSocketContext
jest.mock("@/contexts/WebSocketContext", () => {
  const originalModule = jest.requireActual("@/contexts/WebSocketContext");

  return {
    ...originalModule,
    // Provide a mock implementation of the WebSocketProvider
    WebSocketProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    // Skip the actual WebSocket connection logic
    useWebSocket: jest.fn().mockReturnValue({
      webSocketStatus: "open",
      isError: false,
      errorMessage: "",
      connectWebSocket: jest.fn().mockResolvedValue(undefined),
      disconnectWebSocket: jest.fn(),
      sendMessage: jest.fn(),
      registerMessageHandler: jest.fn().mockReturnValue(jest.fn()),
      waitForConnection: jest.fn().mockResolvedValue(undefined),
    }),
  };
});

describe("SpeechContext", () => {
  const mockStartRecording = jest.fn();
  const mockStopRecordingAndProcess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    (useVoiceAssistant as jest.Mock).mockReturnValue({
      isRecording: false,
      isProcessing: false,
      isPlaying: false,
      isError: false,
      errorMessage: "",
      webSocketStatus: "closed",
      transcription: "",
      startRecording: mockStartRecording,
      stopRecordingAndProcess: mockStopRecordingAndProcess,
      disconnectWebSocket: jest.fn(),
    });
  });

  it("provides expected context values", () => {
    const { result } = renderHook(() => useSpeech(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <WebSocketProvider autoConnect={false}>
          <SpeechProvider>{children}</SpeechProvider>
        </WebSocketProvider>
      ),
    });

    expect(result.current).toEqual({
      isRecording: false,
      isProcessing: false,
      isPlaying: false,
      isError: false,
      errorMessage: "",
      webSocketStatus: "closed",
      transcription: "",
      startRecording: expect.any(Function),
      stopRecordingAndProcess: expect.any(Function),
      disconnectWebSocket: expect.any(Function),
    });
  });

  it("calls startRecording from the hook when startRecording is called", () => {
    const { result } = renderHook(() => useSpeech(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <WebSocketProvider autoConnect={false}>
          <SpeechProvider>{children}</SpeechProvider>
        </WebSocketProvider>
      ),
    });

    act(() => {
      result.current.startRecording();
    });

    expect(mockStartRecording).toHaveBeenCalledTimes(1);
  });

  it("calls stopRecordingAndProcess from the hook when stopRecordingAndProcess is called", () => {
    const { result } = renderHook(() => useSpeech(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <WebSocketProvider autoConnect={false}>
          <SpeechProvider>{children}</SpeechProvider>
        </WebSocketProvider>
      ),
    });

    act(() => {
      result.current.stopRecordingAndProcess();
    });

    expect(mockStopRecordingAndProcess).toHaveBeenCalledTimes(1);
  });

  it("reflects the isRecording state from the hook", () => {
    // Mock recording state
    (useVoiceAssistant as jest.Mock).mockReturnValue({
      isRecording: true,
      isProcessing: false,
      isPlaying: false,
      isError: false,
      errorMessage: "",
      webSocketStatus: "open",
      transcription: "",
      startRecording: mockStartRecording,
      stopRecordingAndProcess: mockStopRecordingAndProcess,
      disconnectWebSocket: jest.fn(),
    });

    const { result } = renderHook(() => useSpeech(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <WebSocketProvider autoConnect={false}>
          <SpeechProvider>{children}</SpeechProvider>
        </WebSocketProvider>
      ),
    });

    expect(result.current.isRecording).toBe(true);
  });

  it("throws an error when used outside of provider", () => {
    const { result } = renderHook(() => useSpeech());

    expect(result.error).toEqual(Error("useSpeech must be used within a SpeechProvider"));
  });
});
