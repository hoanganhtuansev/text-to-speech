export interface ScriptPreset {
  id: string;
  title: string;
  category: "Solar & BESS" | "Peak Shaving" | "Grid Overload" | "Shorts & Reels" | "Technical Guide";
  description: string;
  text: string;
  durationEstimate: string;
  keywords: string[];
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: "male" | "female";
  vibe: string;
  description: string;
  recommendedFor: string;
  badge?: string;
}

export interface AudioGenerationResult {
  id: string;
  audioDataUrl: string;
  text: string;
  voiceUsed: string;
  timestamp: number;
  durationSeconds?: number;
  sampleRate?: number;
  speed: number;
  presetTitle?: string;
}

export interface PersonaConfig {
  voiceName: string;
  speed: number; // 0.8 to 1.5
  emphasisStrength: "medium" | "high";
  customPrompt: string;
}
