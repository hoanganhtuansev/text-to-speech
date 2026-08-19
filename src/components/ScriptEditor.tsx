import React, { useRef, useState } from "react";
import {
  FileText,
  Clock,
  Type,
  Copy,
  Check,
  Trash2,
  Sparkles,
  PlusCircle,
  Wand2,
  Sun,
  BatteryCharging,
} from "lucide-react";

interface ScriptEditorProps {
  text: string;
  onChangeText: (text: string) => void;
  onOptimizeWithAI: () => void;
  isOptimizing: boolean;
  onInsertText: (snippet: string) => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  text,
  onChangeText,
  onOptimizeWithAI,
  isOptimizing,
  onInsertText,
}) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  // In brisk conversational Vietnamese (~150 words per minute for shorts/reels)
  const estimatedSeconds = Math.max(1, Math.round((wordCount / 150) * 60));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClear = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ kịch bản này không?")) {
      onChangeText("");
    }
  };

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) {
      onChangeText(text + " " + snippet);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newText = text.substring(0, start) + snippet + text.substring(end);
    onChangeText(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + snippet.length, start + snippet.length);
      }
    }, 50);
  };

  return (
    <div id="script-editor-container" className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-3.5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Kịch Bản Đọc Lời Thoại (Script)
            </h2>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Type className="w-3.5 h-3.5 text-slate-500" />
            <span>{wordCount} từ</span>
            <span className="text-slate-600">|</span>
            <span>{charCount} ký tự</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Thời lượng ước tính: ~{estimatedSeconds}s</span>
          </div>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="script-input-textarea"
          rows={9}
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Nhập hoặc dán kịch bản kỹ sư điện tại đây (ví dụ: giải thích hệ thống điện mặt trời, pin lưu trữ BESS, sạc đầy 100 phần trăm, bán lên lưới, lấy điện từ lưới...)"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 leading-relaxed focus:outline-none focus:border-amber-500/90 focus:ring-2 focus:ring-amber-500/20 font-sans resize-y selection:bg-amber-500/30"
        />
      </div>

      {/* Quick Insert Technical Snippets Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <PlusCircle className="w-3 h-3 text-amber-400" />
            Chèn nhanh thuật ngữ kỹ thuật:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            "điện mặt trời",
            "BESS",
            "đầy 100 phần trăm",
            "điện dư",
            "bán lên lưới",
            "thiếu điện",
            "lấy điện từ lưới",
            "Inverter",
            "Zero Export",
            "Smart Meter",
            "50 kWp",
            "100 kWh",
          ].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => insertSnippet(term)}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-medium transition-all active:scale-95"
            >
              + {term}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Action Buttons Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-ai-optimize-script"
            onClick={onOptimizeWithAI}
            disabled={isOptimizing || !text.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            {isOptimizing ? (
              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Tối Ưu Ngữ Điệu Giọng Kỹ Sư (AI)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text.trim()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-all disabled:opacity-40"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!text.trim()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs border border-slate-700 hover:border-rose-800/60 transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
