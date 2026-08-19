import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { PresetSelector } from "./components/PresetSelector";
import { ScriptEditor } from "./components/ScriptEditor";
import { VoiceSettings } from "./components/VoiceSettings";
import { KeywordTracker } from "./components/KeywordTracker";
import { AudioPlayer } from "./components/AudioPlayer";
import { ScriptAIAssistant } from "./components/ScriptAIAssistant";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { SCRIPT_PRESETS, VOICE_OPTIONS } from "./data/presets";
import { AudioGenerationResult, ScriptPreset } from "./types";
import { AlertTriangle, CheckCircle2, Zap, Radio, Sparkles } from "lucide-react";

export default function App() {
  const [currentScript, setCurrentScript] = useState<string>(SCRIPT_PRESETS[0].text);
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(SCRIPT_PRESETS[0].id);
  const [selectedVoice, setSelectedVoice] = useState<string>("Fenrir");
  const [speed, setSpeed] = useState<number>(1.0);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [currentAudio, setCurrentAudio] = useState<AudioGenerationResult | null>(null);
  const [history, setHistory] = useState<AudioGenerationResult[]>([]);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tts_engineer_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
          if (parsed.length > 0) {
            setCurrentAudio(parsed[0]);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelectPreset = (preset: ScriptPreset) => {
    setCurrentPresetId(preset.id);
    setCurrentScript(preset.text);
    showToast(`Đã nạp kịch bản: "${preset.title}"`);
  };

  const handleInsertKeyword = (keyword: string) => {
    setCurrentScript((prev) => prev.trim() + " " + keyword + " ");
    showToast(`Đã thêm từ khóa: "${keyword}"`);
  };

  // Generate TTS Audio via Gemini 3.1 Flash TTS
  const handleGenerateTTS = async () => {
    if (!currentScript.trim()) {
      setError("Vui lòng nhập hoặc chọn kịch bản trước khi tạo giọng đọc.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentScript,
          voiceName: selectedVoice,
          speed: speed,
          customPrompt: customPrompt || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tổng hợp giọng đọc từ Gemini TTS");
      }

      const activePreset = SCRIPT_PRESETS.find((p) => p.id === currentPresetId);

      const newAudioResult: AudioGenerationResult = {
        id: "audio-" + Date.now(),
        audioDataUrl: data.audioDataUrl,
        text: currentScript,
        voiceUsed: selectedVoice,
        timestamp: Date.now(),
        durationSeconds: data.estimatedDurationSeconds || Math.round((currentScript.split(/\s+/).length / 150) * 60),
        sampleRate: data.sampleRate || 24000,
        speed: speed,
        presetTitle: activePreset?.title || "Kịch bản kỹ sư điện",
      };

      setCurrentAudio(newAudioResult);
      const updatedHistory = [newAudioResult, ...history].slice(0, 15);
      setHistory(updatedHistory);
      try {
        localStorage.setItem("tts_engineer_history", JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn("Storage quota exceeded", e);
      }

      showToast(`Tạo thành công giọng đọc kỹ sư (${selectedVoice})!`);
    } catch (err: any) {
      console.error("Generate error:", err);
      setError(err?.message || "Có lỗi xảy ra khi tạo giọng đọc.");
    } finally {
      setIsLoading(false);
    }
  };

  // Optimize script with AI
  const handleOptimizeScript = async () => {
    if (!currentScript.trim()) return;
    setIsOptimizing(true);
    setError(null);

    try {
      const res = await fetch("/api/script-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "optimize",
          currentScript: currentScript,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tối ưu kịch bản.");
      }

      setCurrentScript(data.script);
      showToast("Đã tối ưu hóa câu từ & ngữ điệu kỹ sư điện thành công!");
    } catch (err: any) {
      setError(err?.message || "Có lỗi khi tối ưu kịch bản.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Bạn có muốn xóa toàn bộ lịch sử các bản thu trước đó không?")) {
      setHistory([]);
      try {
        localStorage.removeItem("tts_engineer_history");
      } catch (e) {
        console.error(e);
      }
      showToast("Đã xóa lịch sử bản thu.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 antialiased flex flex-col justify-between">
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-2xl animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main App Bar */}
      <Header
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-700/80 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs text-rose-200 shadow-lg">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-rose-100 mb-0.5">Thông Báo Lỗi:</strong>
                <span>{error}</span>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 text-xs underline flex-shrink-0"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Top Section: Quick Presets */}
        <PresetSelector
          currentPresetId={currentPresetId}
          onSelectPreset={handleSelectPreset}
        />

        {/* Middle Section: 2 Columns (Left: Script & Keywords, Right: Voice & Audio Player) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Script Editor & Keywords (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <ScriptEditor
              text={currentScript}
              onChangeText={(newText) => {
                setCurrentScript(newText);
                setCurrentPresetId(null);
              }}
              onOptimizeWithAI={handleOptimizeScript}
              isOptimizing={isOptimizing}
              onInsertText={(snippet) => setCurrentScript((prev) => prev + " " + snippet)}
            />

            <KeywordTracker
              text={currentScript}
              onInsertKeyword={handleInsertKeyword}
            />
          </div>

          {/* Right Column: Audio Output & Voice Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <AudioPlayer
              currentAudio={currentAudio}
              isLoading={isLoading}
              onGenerate={handleGenerateTTS}
            />

            <VoiceSettings
              selectedVoice={selectedVoice}
              onSelectVoice={(v) => {
                setSelectedVoice(v);
                showToast(`Đã chọn giọng: ${v}`);
              }}
              speed={speed}
              onChangeSpeed={setSpeed}
              customPrompt={customPrompt}
              onChangeCustomPrompt={setCustomPrompt}
            />
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="text-slate-400">Mô hình giọng nói:</span>
            <span className="font-mono text-cyan-400">gemini-3.1-flash-tts-preview</span>
          </div>
          <p className="text-center sm:text-right">
            Được thiết kế cho Kỹ sư Điện & Nhà sáng tạo nội dung Năng Lượng Tái Tạo (Solar & BESS)
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ScriptAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onApplyScript={(script) => {
          setCurrentScript(script);
          setCurrentPresetId(null);
          showToast("Đã nạp kịch bản AI vào trình đọc!");
        }}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectAudio={(item) => {
          setCurrentAudio(item);
          setCurrentScript(item.text);
          setSelectedVoice(item.voiceUsed);
          setIsHistoryOpen(false);
          showToast(`Đã tải bản thu: ${item.presetTitle || "Kịch bản"}`);
        }}
        onClearHistory={handleClearHistory}
        currentAudioId={currentAudio?.id}
      />
    </div>
  );
}
