import React from "react";
import { X, Play, Download, Trash2, Clock, Volume2, Radio } from "lucide-react";
import { AudioGenerationResult } from "../types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: AudioGenerationResult[];
  onSelectAudio: (audio: AudioGenerationResult) => void;
  onClearHistory: () => void;
  currentAudioId?: string;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectAudio,
  onClearHistory,
  currentAudioId,
}) => {
  if (!isOpen) return null;

  const handleDownload = (audio: AudioGenerationResult, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = audio.audioDataUrl;
    a.download = `giong-ky-su-${audio.voiceUsed}-${new Date(audio.timestamp).toISOString().slice(0, 10)}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="history-drawer-panel"
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Lịch Sử Bản Thu Giọng Đọc
            </h2>
            <span className="text-xs text-slate-400">({history.length})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of recordings */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Volume2 className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
              <p className="text-xs">Chưa có bản thu nào được tạo trong phiên này.</p>
              <p className="text-[11px] text-slate-600">Nhấn nút "Tạo Audio" để tổng hợp giọng kỹ sư điện.</p>
            </div>
          ) : (
            history.map((item) => {
              const isCurrent = currentAudioId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectAudio(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                    isCurrent
                      ? "bg-amber-950/20 border-amber-500/80 shadow-sm"
                      : "bg-slate-950 hover:bg-slate-850 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-200 line-clamp-1">
                      {item.presetTitle || "Kịch bản tùy chỉnh"}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                      {item.voiceUsed}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {item.text}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDownload(item, e)}
                        title="Tải file WAV"
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" /> Nghe lại
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-rose-400/80 hover:text-rose-300 flex items-center gap-1 p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ lịch sử</span>
            </button>
            <span className="text-[11px] text-slate-500 font-mono">
              Lưu trữ cục bộ
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
