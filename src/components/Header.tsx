import React from "react";
import { Zap, Sun, BatteryCharging, Radio, Volume2, Sparkles } from "lucide-react";

interface HeaderProps {
  onOpenAIAssistant: () => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAIAssistant,
  historyCount,
  onOpenHistory,
}) => {
  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6 fill-amber-400/20 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Studio Giọng Đọc Kỹ Sư Điện
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                  Gemini 3.1 Flash TTS
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Nam Việt Nam 30–40 tuổi</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 flex items-center gap-1 font-medium">
                <Sun className="w-3.5 h-3.5" /> Điện mặt trời & <BatteryCharging className="w-3.5 h-3.5" /> BESS
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">Chuẩn Video YouTube / Reels</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-open-ai-assistant"
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Soạn & Tối Ưu Kịch Bản</span>
          </button>

          <button
            id="btn-open-history"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all active:scale-95"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lịch Sử Bản Thu</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
