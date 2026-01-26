declare module 'mespeak' {
  interface MeSpeakOptions {
    amplitude?: number;
    pitch?: number;
    speed?: number;
    voice?: string;
    wordgap?: number;
    variant?: string;
    linebreak?: number;
    capitals?: number;
    punctuation?: boolean;
    rawdata?: boolean | string;
    log?: boolean;
  }

  interface MeSpeak {
    loadConfig(url: string, callback?: (success: boolean, message: string) => void): void;
    loadVoice(url: string, callback?: (success: boolean, message: string) => void): void;
    speak(text: string, options?: MeSpeakOptions, callback?: (success: boolean, id: number) => void): number;
    stop(id?: number): void;
    isConfigLoaded(): boolean;
    isVoiceLoaded(voice?: string): boolean;
    getDefaultVoice(): string;
    setDefaultVoice(voice: string): void;
  }

  const meSpeak: MeSpeak;
  export default meSpeak;
}
