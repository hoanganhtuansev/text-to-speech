import React, { useState } from "react";
import { VOICE_OPTIONS } from "../data/presets";
import { User, Sliders, ChevronDown, ChevronUp, Sparkles, Volume2, ShieldAlert } from "lucide-react";

interface VoiceSettingsProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  customPrompt: string;
  onChangeCustomPrompt: (prompt: string) => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  selectedVoice,
  onSelectVoice,
  speed,
  onChangeSpeed,
  customPrompt,
  onChangeCustomPrompt,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div id="voice-settings-container" className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Thiết Lập Giọng Kỹ Sư Điện
            </h2>
            <p className="text-xs text-slate-400">
              Giọng nam Việt Nam 30–40 tuổi • Phong cách kỹ sư giải thích đại chúng
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
          ● Đang kích hoạt
        </span>
      </div>

      {/* Voice Selection Grid */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2.5">
          Chọn Chất Giọng (Mô hình Gemini 3.1 Flash TTS):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {VOICE_OPTIONS.map((voice) => {
            const isSelected = selectedVoice === voice.id;
            return (
              <button
                key={voice.id}
                type="button"
                id={`voice-btn-${voice.id}`}
                onClick={() => onSelectVoice(voice.id)}
                className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-br from-amber-500/15 via-slate-800 to-slate-900 border-amber-500/80 shadow-md shadow-amber-500/10"
                    : "bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full flex items-center justify-center border ${
                        isSelected ? "border-amber-400 bg-amber-400" : "border-slate-600 bg-transparent"
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? "text-amber-300" : "text-slate-200"}`}>
                      {voice.name}
                    </span>
                  </div>
                  {voice.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {voice.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {voice.description}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="text-cyan-400 font-medium">{voice.vibe}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Pacing / Energy Info */}
      <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Nhịp Điệu Đọc Video (Pacing)
          </span>
          <span className="text-[11px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50">
            Hơi nhanh, cuốn hút (YouTube/Reels)
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Gemini TTS tự động điều tiết tốc độ nói tự nhiên, hơi nhanh nhẹ để giữ chân người xem video ngắn, dứt khoát ở các mệnh đề và ngắt nghỉ ngắn giữa các ý kỹ thuật.
        </p>
      </div>

      {/* Advanced Prompt Tuning Accordion */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Chỉ dẫn phong cách kỹ sư (System Persona Prompt)
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-2.5 space-y-2">
            <textarea
              id="custom-persona-prompt"
              rows={4}
              value={customPrompt}
              onChange={(e) => onChangeCustomPrompt(e.target.value)}
              placeholder="Nhập prompt chỉ đạo phong cách đọc cho Gemini TTS..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono leading-relaxed focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 resize-y"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>Đã nạp sẵn chỉ đạo: Nam kỹ sư điện 30-40 tuổi, thân thiện, rõ ràng, nhấn mạnh từ khóa kỹ thuật.</span>
              <button
                type="button"
                onClick={() => onChangeCustomPrompt("")}
                className="text-amber-400/80 hover:text-amber-300 hover:underline"
              >
                Đặt lại mặc định
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
