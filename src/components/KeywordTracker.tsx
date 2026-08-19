import React from "react";
import { CheckCircle2, AlertCircle, Plus, Info } from "lucide-react";

interface KeywordTrackerProps {
  text: string;
  onInsertKeyword: (keyword: string) => void;
}

const REQUIRED_KEYWORDS = [
  { term: "điện mặt trời", label: "điện mặt trời", tip: "Nhấn mạnh nguồn phát năng lượng sạch" },
  { term: "BESS", label: "BESS", tip: "Battery Energy Storage System (Hệ thống pin lưu trữ)" },
  { term: "đầy 100 phần trăm", label: "đầy 100 phần trăm", tip: "Trạng thái nạp pin tối đa (SOC 100%)" },
  { term: "điện dư", label: "điện dư", tip: "Công suất phát vượt quá tải tiêu thụ" },
  { term: "bán lên lưới", label: "bán lên lưới", tip: "Phát điện ngược vào lưới truyền tải" },
  { term: "thiếu điện", label: "thiếu điện", tip: "Thời điểm phụ tải vượt quá nguồn cấp" },
  { term: "lấy điện từ lưới", label: "lấy điện từ lưới", tip: "Mua điện bổ sung từ điện lưới EVN" },
];

export const KeywordTracker: React.FC<KeywordTrackerProps> = ({ text, onInsertKeyword }) => {
  const normalizedText = text.toLowerCase();

  return (
    <div id="keyword-tracker-card" className="bg-slate-900/90 rounded-xl border border-slate-800 p-3.5 text-xs">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Từ Khóa Kỹ Thuật Trọng Tâm</span>
          <span className="text-[11px] text-slate-400">(Tự động nhận diện & nhấn giọng)</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
          <Info className="w-3 h-3" />
          <span>Gemini TTS sẽ tự động tăng ngữ điệu nhấn khi gặp các từ này</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {REQUIRED_KEYWORDS.map((item) => {
          const isPresent =
            normalizedText.includes(item.term.toLowerCase()) ||
            (item.term === "đầy 100 phần trăm" && (normalizedText.includes("100%") || normalizedText.includes("100 phần trăm")));

          return (
            <div
              key={item.term}
              className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                isPresent
                  ? "bg-emerald-950/40 border-emerald-700/60 text-emerald-300"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
              }`}
            >
              {isPresent ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500/70 flex-shrink-0" />
              )}
              <span>{item.label}</span>
              {!isPresent && (
                <button
                  type="button"
                  onClick={() => onInsertKeyword(item.term)}
                  title={`Chèn từ "${item.term}" vào vị trí con trỏ`}
                  className="opacity-60 hover:opacity-100 p-0.5 hover:bg-slate-700 rounded text-slate-300 transition-opacity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
