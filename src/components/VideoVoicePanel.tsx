import React, { useMemo, useState } from "react";
import { Download, Film, Loader2, RefreshCw } from "lucide-react";

type SceneResult = {
  index: number;
  text: string;
  start: number;
  end: number;
  duration: number;
  audioDataUrl: string;
};

type Props = {
  script: string;
  voiceName: string;
  speed: number;
  customPrompt?: string;
};

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function wavPcmPayload(wav: Uint8Array): Uint8Array {
  // Current backend returns standard 44-byte PCM WAV.
  if (wav.length <= 44) return new Uint8Array();
  return wav.slice(44);
}

function makeWav(pcm: Uint8Array, sampleRate = 24000): Blob {
  const out = new Uint8Array(44 + pcm.length);
  const view = new DataView(out.buffer);
  const writeAscii = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) out[offset + i] = s.charCodeAt(i);
  };
  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(36, "data");
  view.setUint32(40, pcm.length, true);
  out.set(pcm, 44);
  return new Blob([out], { type: "audio/wav" });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function VideoVoicePanel({ script, voiceName, speed, customPrompt }: Props) {
  const [pauseSeconds, setPauseSeconds] = useState(0.35);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scenes, setScenes] = useState<SceneResult[]>([]);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);

  const sceneTexts = useMemo(() => {
    return script
      .split(/\n\s*\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [script]);

  const generateOne = async (text: string) => {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceName, speed, customPrompt: customPrompt || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Không thể tạo audio cho scene.");
    return data as {
      audioDataUrl: string;
      sampleRate?: number;
      estimatedDurationSeconds?: number;
    };
  };

  const generateAll = async () => {
    if (!sceneTexts.length) {
      setError("Hãy nhập kịch bản và ngăn các scene bằng một dòng trống.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setScenes([]);
    setProgress(0);

    try {
      const results: SceneResult[] = [];
      const pcmParts: Uint8Array[] = [];
      let cursor = 0;
      let sampleRate = 24000;

      for (let i = 0; i < sceneTexts.length; i++) {
        const text = sceneTexts[i];
        const data = await generateOne(text);
        sampleRate = data.sampleRate || 24000;
        const wavBytes = dataUrlToBytes(data.audioDataUrl);
        const pcm = wavPcmPayload(wavBytes);
        const measuredDuration = pcm.length / (sampleRate * 2);
        const duration = measuredDuration || data.estimatedDurationSeconds || 0;

        const start = cursor;
        const end = start + duration;
        results.push({ index: i + 1, text, start, end, duration, audioDataUrl: data.audioDataUrl });
        pcmParts.push(pcm);

        if (i < sceneTexts.length - 1 && pauseSeconds > 0) {
          const silence = new Uint8Array(Math.round(sampleRate * 2 * pauseSeconds));
          pcmParts.push(silence);
          cursor = end + pauseSeconds;
        } else {
          cursor = end;
        }
        setProgress(i + 1);
        setScenes([...results]);
      }

      const total = pcmParts.reduce((n, p) => n + p.length, 0);
      const mergedPcm = new Uint8Array(total);
      let offset = 0;
      for (const part of pcmParts) {
        mergedPcm.set(part, offset);
        offset += part.length;
      }
      const blob = makeWav(mergedPcm, sampleRate);
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
      setMergedBlob(blob);
      setMergedUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      setError(e?.message || "Có lỗi khi tạo Video Voice.");
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateScene = async (scene: SceneResult) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const data = await generateOne(scene.text);
      const updated = scenes.map((s) =>
        s.index === scene.index
          ? { ...s, audioDataUrl: data.audioDataUrl, duration: data.estimatedDurationSeconds || s.duration }
          : s
      );
      setScenes(updated);
      // Re-run full merge so timeline stays exact and contiguous.
      setTimeout(() => generateAll(), 50);
    } catch (e: any) {
      setError(e?.message || "Không thể tạo lại scene.");
      setIsGenerating(false);
    }
  };

  const downloadTimeline = () => {
    const payload = {
      voiceName,
      speed,
      pauseSeconds,
      totalDuration: scenes.length ? scenes[scenes.length - 1].end : 0,
      scenes: scenes.map(({ index, text, start, end, duration }) => ({ index, text, start, end, duration })),
    };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), "video-voice-timeline.json");
  };

  return (
    <section className="rounded-2xl border border-cyan-900/70 bg-slate-900/70 p-5 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-300">
            <Film className="h-5 w-5" />
            <h2 className="text-lg font-bold">Video Voice</h2>
          </div>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
            Mỗi đoạn cách nhau bằng một dòng trống sẽ thành một scene. App tạo từng scene, ghép thành một WAV duy nhất và xuất timeline JSON để dựng video theo đúng audio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Pause</label>
          <select
            value={pauseSeconds}
            onChange={(e) => setPauseSeconds(Number(e.target.value))}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
          >
            <option value={0.2}>0.2s</option>
            <option value={0.35}>0.35s</option>
            <option value={0.5}>0.5s</option>
            <option value={0.7}>0.7s</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={generateAll}
          disabled={isGenerating || !sceneTexts.length}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
          {isGenerating ? `Đang tạo ${progress}/${sceneTexts.length}` : `Tạo ${sceneTexts.length} scene + timeline`}
        </button>

        {mergedBlob && (
          <button
            onClick={() => downloadBlob(mergedBlob, "video-voice-full.wav")}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-950/60 px-4 py-2.5 text-sm font-semibold text-emerald-200"
          >
            <Download className="h-4 w-4" /> WAV đầy đủ
          </button>
        )}

        {!!scenes.length && (
          <button
            onClick={downloadTimeline}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-700 bg-amber-950/50 px-4 py-2.5 text-sm font-semibold text-amber-200"
          >
            <Download className="h-4 w-4" /> Timeline JSON
          </button>
        )}
      </div>

      {error && <div className="mt-4 rounded-xl border border-rose-800 bg-rose-950/60 p-3 text-xs text-rose-200">{error}</div>}

      {mergedUrl && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="mb-2 text-xs font-semibold text-slate-300">Preview WAV đã ghép</div>
          <audio controls src={mergedUrl} className="w-full" />
        </div>
      )}

      {!!scenes.length && (
        <div className="mt-4 space-y-2">
          {scenes.map((scene) => (
            <div key={scene.index} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 md:grid-cols-[110px_1fr_180px] md:items-center">
              <div className="text-xs font-mono text-cyan-300">
                Scene {scene.index}<br />
                {scene.start.toFixed(2)}s → {scene.end.toFixed(2)}s
              </div>
              <div className="text-xs leading-5 text-slate-300 line-clamp-3">{scene.text}</div>
              <div className="flex items-center gap-2">
                <audio controls src={scene.audioDataUrl} className="h-8 w-32" />
                <button
                  title="Tạo lại scene"
                  onClick={() => regenerateScene(scene)}
                  className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-cyan-700 hover:text-cyan-300"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
