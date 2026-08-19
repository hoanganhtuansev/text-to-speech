import React, { useState } from "react";
import { X, Sparkles, Wand2, Sun, BatteryCharging, Check, RefreshCw, Zap } from "lucide-react";

interface ScriptAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScript: (script: string) => void;
}

const SAMPLE_TOPICS = [
  "Cách hệ thống điện mặt trời và BESS tự động phối hợp khi cúp điện",
  "Tại sao sạc BESS đầy 100% vào buổi trưa lại giúp tiết kiệm tiền điện tối đa",
  "Giải pháp Zero-Export kết hợp BESS khi chưa được bán điện lên lưới",
  "So sánh chi phí lấy điện từ lưới giờ cao điểm và dùng pin lưu trữ BESS",
  "Nguyên lý chống quá tải máy biến áp nhờ trạm pin lưu trữ năng lượng tập trung",
];

export const ScriptAIAssistant: React.FC<ScriptAIAssistantProps> = ({
  isOpen,
  onClose,
  onApplyScript,
}) => {
  const [topic, setTopic] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (customTopic?: string) => {
    const selectedTopic = customTopic || topic;
    if (!selectedTopic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/script-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          topic: selectedTopic,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo kịch bản");
      }

      setGeneratedScript(data.script);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra khi tạo kịch bản AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedScript) {
      onApplyScript(generatedScript);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="ai-assistant-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Trợ Lý AI Soạn Kịch Bản Kỹ Sư Điện
              </h2>
              <p className="text-xs text-slate-400">
                Tự động viết lời thoại chuẩn phong cách kỹ sư 30–40 tuổi cho video ngắn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggested Topics */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Chọn nhanh chủ đề kỹ thuật:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_TOPICS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTopic(item);
                  handleGenerate(item);
                }}
                className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-950/40 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-700/60 transition-all"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Hoặc nhập chủ đề kỹ thuật theo ý bạn:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Lợi ích của pin lithium BESS khi hòa lưới điện mặt trời..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isLoading || !topic.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              <span>Tạo Kịch Bản</span>
            </button>
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Generated Script Result */}
        {generatedScript && (
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Kịch bản đã tạo chuẩn ngữ điệu:
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {generatedScript.split(/\s+/).length} từ • ~{Math.round((generatedScript.split(/\s+/).length / 150) * 60)}s
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-48 overflow-y-auto">
              {generatedScript}
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Tạo Bản Khác</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-md transition-all"
              >
                Đưa Vào Trình Đọc Lời Thoại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
